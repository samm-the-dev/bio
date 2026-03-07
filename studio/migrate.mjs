/**
 * One-off migration script: content.jsonc -> Sanity documents.
 * Run from studio/: node migrate.mjs
 *
 * Requires SANITY_API_TOKEN env var (create at sanity.io/manage -> API -> Tokens -> Add token with Editor role).
 */
import {createClient} from '@sanity/client'
import {readFileSync} from 'fs'
import {randomUUID} from 'crypto'

const PROJECT_ID = 'wqqh5015'
const DATASET = 'production'

const token = process.env.SANITY_API_TOKEN
if (!token) {
  console.error('Set SANITY_API_TOKEN env var (Editor token from sanity.io/manage)')
  process.exit(1)
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  token,
  apiVersion: '2025-03-01',
  useCdn: false,
})

// --- Parse content.jsonc (same parser as inject-content.mjs) ---
function stripJsoncComments(text) {
  text = text.replace(
    /"(?:[^"\\]|\\.)*"|\/\/.*$|\/\*[\s\S]*?\*\//gm,
    (match) => (match.startsWith('"') ? match : ''),
  )
  text = text.replace(/,\s*([}\]])/g, '$1')
  return text
}

const raw = readFileSync('../content.jsonc', 'utf-8')
const content = JSON.parse(stripJsoncComments(raw))

// --- Portable Text helpers ---
// Converts an array of strings (with markdown links and \n paragraph breaks)
// into Sanity Portable Text blocks.

function textToBlocks(paragraphs) {
  // First, merge paragraphs the same way inject-content does:
  // consecutive items merge unless the previous one ends with \n
  const merged = []
  for (const item of paragraphs) {
    const trimmed = item.trimEnd()
    if (merged.length === 0 || merged[merged.length - 1].endsWith('\n')) {
      merged.push(trimmed)
    } else {
      merged[merged.length - 1] += ' ' + trimmed
    }
  }

  return merged.map((text) => {
    const clean = text.replace(/\n$/, '').trim()
    const {children, markDefs} = parseInlineMarks(clean)
    return {
      _type: 'block',
      _key: randomUUID().slice(0, 12),
      style: 'normal',
      markDefs,
      children,
    }
  })
}

// Parse markdown links [text](url) and [[Page]] internal links into
// Portable Text spans with link annotations.
function parseInlineMarks(text) {
  const children = []
  const markDefs = []

  // Match [text](url) and [[Page]]
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\[\[(\w+)\]\]/g
  let lastIndex = 0
  let match

  while ((match = pattern.exec(text)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      children.push({
        _type: 'span',
        _key: randomUUID().slice(0, 12),
        text: text.slice(lastIndex, match.index),
        marks: [],
      })
    }

    if (match[3]) {
      // [[Page]] internal link — just render as plain text link
      const page = match[3]
      const markKey = randomUUID().slice(0, 12)
      markDefs.push({
        _type: 'link',
        _key: markKey,
        href: '/' + page.toLowerCase(),
      })
      children.push({
        _type: 'span',
        _key: randomUUID().slice(0, 12),
        text: page,
        marks: [markKey],
      })
    } else {
      // [text](url) external link
      const linkText = match[1]
      const href = match[2]
      const markKey = randomUUID().slice(0, 12)
      markDefs.push({
        _type: 'link',
        _key: markKey,
        href,
      })
      children.push({
        _type: 'span',
        _key: randomUUID().slice(0, 12),
        text: linkText,
        marks: [markKey],
      })
    }

    lastIndex = match.index + match[0].length
  }

  // Remaining text
  if (lastIndex < text.length) {
    children.push({
      _type: 'span',
      _key: randomUUID().slice(0, 12),
      text: text.slice(lastIndex),
      marks: [],
    })
  }

  // Ensure at least one child
  if (children.length === 0) {
    children.push({
      _type: 'span',
      _key: randomUUID().slice(0, 12),
      text: '',
      marks: [],
    })
  }

  return {children, markDefs}
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// --- Build documents ---
const tx = client.transaction()

// 1. Site Settings (singleton)
tx.createOrReplace({
  _id: 'siteSettings',
  _type: 'siteSettings',
  name: content.site.name,
  descriptor: content.site.descriptor,
  githubUrl: content.site.githubUrl,
  repoUrl: content.site.repoUrl,
  tagline: content.home.tagline,
  taglineAttribution: content.home.taglineAttribution,
  taglineUrl: content.home.taglineUrl,
  intro: textToBlocks(content.home.intro),
  projectsTeaser: content.home.projectsTeaser,
  aboutTeaser: content.home.aboutTeaser,
  aboutImprov: textToBlocks(content.about.improv),
  aboutMovies: textToBlocks(content.about.movies),
  aboutTtrpgs: textToBlocks(content.about.ttrpgs),
  aboutCode: textToBlocks(content.about.code),
  socialLinks: content.social.map((link) => ({
    _type: 'socialLink',
    _key: randomUUID().slice(0, 12),
    label: link.label,
    href: link.href,
  })),
})

// 2. Projects
for (let i = 0; i < content.projects.code.length; i++) {
  const p = content.projects.code[i]
  const slug = slugify(p.name)
  tx.createOrReplace({
    _id: `project-${slug}`,
    _type: 'project',
    name: p.name,
    slug: {_type: 'slug', current: slug},
    category: 'code',
    description: textToBlocks(p.description),
    tech: p.tech,
    link: p.link || undefined,
    repo: p.repo,
    displayOrder: i,
    featured: false,
    status: 'active',
  })
}

// Tabletop projects (if any)
if (content.projects.tabletop) {
  const codeCount = content.projects.code.length
  for (let i = 0; i < content.projects.tabletop.length; i++) {
    const p = content.projects.tabletop[i]
    const slug = slugify(p.name)
    tx.createOrReplace({
      _id: `project-${slug}`,
      _type: 'project',
      name: p.name,
      slug: {_type: 'slug', current: slug},
      category: 'tabletop',
      description: textToBlocks(p.description),
      tech: p.tech,
      link: p.link || undefined,
      repo: p.repo,
      displayOrder: codeCount + i,
      featured: false,
      status: 'active',
    })
  }
}

// --- Execute ---
console.log('Migrating content to Sanity...')
const result = await tx.commit()
console.log(`Done! ${result.results.length} documents created/updated.`)
