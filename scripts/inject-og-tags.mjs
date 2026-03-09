/**
 * Post-build: generate per-route HTML files with Open Graph meta tags.
 *
 * Reads dist/index.html (with Vite's hashed assets), then for each route
 * creates dist/<path>/index.html with route-specific OG tags injected.
 * Crawlers get rich link previews; users get the full SPA once JS loads.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import yaml from 'js-yaml';
import matter from 'gray-matter';

const siteUrl = 'https://samm.bio';
const template = readFileSync('dist/index.html', 'utf-8');

// --- Helpers ---

function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Strip markdown links and basic formatting to plain text. */
function stripMarkdown(md) {
  return md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url) -> text
    .replace(/[*_~`#]/g, '')                  // formatting chars
    .replace(/\n+/g, ' ')                     // newlines -> spaces
    .replace(/ {2,}/g, ' ')                   // collapse multiple spaces
    .trim();
}

function buildOgBlock({ title, description, url, type = 'website' }) {
  return [
    `<title>${escapeHtml(title)} - Sam Marsh</title>`,
    `<meta property="og:title" content="${escapeAttr(title)}" />`,
    `<meta property="og:description" content="${escapeAttr(description)}" />`,
    `<meta property="og:url" content="${escapeAttr(url)}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:site_name" content="Sam Marsh" />`,
    `<meta name="description" content="${escapeAttr(description)}" />`,
  ].join('\n    ');
}

function writePage(path, ogBlock) {
  const html = template.replace(
    /<!-- og:start -->[\s\S]*?<!-- og:end -->/,
    ogBlock,
  );
  const dir = `dist/${path}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/index.html`, html);
}

// --- Read content sources ---

const settings = yaml.load(readFileSync('content/settings.yaml', 'utf-8'));
const projectsData = yaml.load(readFileSync('content/projects.yaml', 'utf-8'));
const gifSection = projectsData.sections?.find((s) => s.key === 'gifs');

// --- Static routes ---

const staticRoutes = [
  {
    path: 'about',
    title: 'About',
    description: stripMarkdown(settings.intro),
  },
  {
    path: 'projects',
    title: 'Projects',
    description: stripMarkdown(settings.projectsTeaser),
  },
  {
    path: 'projects/gifs',
    title: 'GIFs',
    description: gifSection?.metaDescription
      ?? (gifSection?.description ? stripMarkdown(gifSection.description) : 'Curated GIFs from shows and movies.'),
  },
  {
    path: 'blog',
    title: 'Blog',
    description: stripMarkdown(settings.blogTeaser),
  },
  {
    path: 'shows',
    title: 'Shows',
    description: stripMarkdown(settings.showsTeaser),
  },
];

for (const route of staticRoutes) {
  writePage(route.path, buildOgBlock({
    title: route.title,
    description: route.description,
    url: `${siteUrl}/${route.path}`,
  }));
}

console.log(`Generated OG pages for ${staticRoutes.length} static route(s).`);

// --- Blog posts ---

const postsDir = 'content/posts';
const postFiles = readdirSync(postsDir).filter((f) => f.endsWith('.md'));
let postCount = 0;

for (const file of postFiles) {
  const { data } = matter(readFileSync(`${postsDir}/${file}`, 'utf-8'));
  if (!data.publishedAt) continue;

  postCount++;
  writePage(`blog/${data.slug}`, buildOgBlock({
    title: data.title,
    description: data.excerpt,
    url: `${siteUrl}/blog/${data.slug}`,
    type: 'article',
  }));
}

console.log(`Generated OG pages for ${postCount} blog post(s).`);
