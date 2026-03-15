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

function buildOgBlock({ title, description, url, type = 'website', image, imageWidth, imageHeight, video, videoWidth, videoHeight }) {
  const lines = [
    `<title>${escapeHtml(title)} - Sam Marsh</title>`,
    `<meta property="og:title" content="${escapeAttr(title)}" />`,
    `<meta property="og:description" content="${escapeAttr(description)}" />`,
    `<meta property="og:url" content="${escapeAttr(url)}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:site_name" content="Sam Marsh" />`,
    `<meta name="description" content="${escapeAttr(description)}" />`,
  ];
  if (image) {
    lines.push(`<meta property="og:image" content="${escapeAttr(image)}" />`);
    if (imageWidth) lines.push(`<meta property="og:image:width" content="${imageWidth}" />`);
    if (imageHeight) lines.push(`<meta property="og:image:height" content="${imageHeight}" />`);
  }
  if (video) {
    lines.push(`<meta property="og:video" content="${escapeAttr(video)}" />`);
    lines.push(`<meta property="og:video:type" content="video/mp4" />`);
    if (videoWidth) lines.push(`<meta property="og:video:width" content="${videoWidth}" />`);
    if (videoHeight) lines.push(`<meta property="og:video:height" content="${videoHeight}" />`);
  }
  return lines.join('\n    ');
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

const showsData = yaml.load(readFileSync('content/shows.yaml', 'utf-8'));
const venues = showsData.venues ?? {};
// All shows are in DFW (America/Chicago). Compare datetimes as CT strings so
// the "next show" selection is stable regardless of the build machine's timezone.
const nowCT = new Date().toLocaleString('sv', { timeZone: 'America/Chicago' }).replace(' ', 'T').slice(0, 16);
const nextShow = (showsData.shows ?? [])
  .filter((s) => s.datetime >= nowCT)
  .sort((a, b) => a.datetime.localeCompare(b.datetime))[0];

function formatShowOgDate(datetime) {
  // Date portion is the CT calendar date — parse as UTC midnight (date-only ISO = UTC, unambiguous)
  return new Date(datetime.slice(0, 10)).toLocaleDateString('en-US', {
    timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric',
  });
}

const showsDescription = nextShow
  ? `Next up: ${nextShow.title} at ${venues[nextShow.venue]?.name ?? nextShow.venue}, ${formatShowOgDate(nextShow.datetime)}.`
  : stripMarkdown(settings.showsTeaser);

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
    path: 'blog/bluesky',
    title: 'Bluesky',
    description: 'Recent posts from Bluesky.',
  },
  {
    path: 'blog/letterboxd',
    title: 'Letterboxd',
    description: 'Recent film watches and reviews from Letterboxd.',
  },
  {
    path: 'blog/all',
    title: 'All Posts',
    description: 'Blog posts, Bluesky updates, and Letterboxd activity.',
  },
  {
    path: 'shows',
    title: 'Shows',
    description: showsDescription,
  },
];

for (const route of staticRoutes) {
  writePage(route.path, buildOgBlock({
    title: route.title,
    description: route.description,
    url: `${siteUrl}/${route.path}/`,
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
    url: `${siteUrl}/blog/${data.slug}/`,
    type: 'article',
  }));
}

console.log(`Generated OG pages for ${postCount} blog post(s).`);

// --- GIF tag pages ---

const COLLAGE_TAGS = [
  { tag: 'Cloudward Ho', slug: 'cloudward-ho' },
  { tag: 'Game Changer', slug: 'game-changer' },
  { tag: 'One Piece (Netflix)', slug: 'one-piece-netflix' },
];

for (const { tag, slug } of COLLAGE_TAGS) {
  writePage(`projects/gifs/tag/${slug}`, buildOgBlock({
    title: `${tag} GIFs`,
    description: `A collection of ${tag} GIFs.`,
    url: `${siteUrl}/projects/gifs/tag/${slug}/`,
    image: `${siteUrl}/og-collages/${slug}.jpg`,
    imageWidth: 1200,
    imageHeight: 630,
    video: `${siteUrl}/og-videos/${slug}.mp4`,
    videoWidth: 1200,
    videoHeight: 630,
  }));
}

console.log(`Generated OG pages for ${COLLAGE_TAGS.length} GIF tag(s).`);
