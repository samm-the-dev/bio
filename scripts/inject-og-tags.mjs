/**
 * Post-build: generate per-post HTML files with Open Graph meta tags.
 *
 * Reads dist/index.html (with Vite's hashed assets), then for each published
 * blog post creates dist/blog/<slug>/index.html with OG tags injected.
 * Crawlers get rich link previews; users get the full SPA once JS loads.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import matter from 'gray-matter';

const siteUrl = 'https://samm.bio';
const postsDir = 'content/posts';
const template = readFileSync('dist/index.html', 'utf-8');

const postFiles = readdirSync(postsDir).filter((f) => f.endsWith('.md'));

for (const file of postFiles) {
  const { data } = matter(readFileSync(`${postsDir}/${file}`, 'utf-8'));
  if (!data.publishedAt) continue;

  const ogBlock = [
    `<title>${escapeHtml(data.title)} - ADHDev</title>`,
    `<meta property="og:title" content="${escapeAttr(data.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(data.excerpt)}" />`,
    `<meta property="og:url" content="${siteUrl}/blog/${data.slug}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:site_name" content="ADHDev" />`,
    `<meta name="description" content="${escapeAttr(data.excerpt)}" />`,
  ].join('\n    ');

  const html = template.replace(
    /<!-- og:start -->[\s\S]*?<!-- og:end -->/,
    ogBlock,
  );

  const dir = `dist/blog/${data.slug}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/index.html`, html);
}

console.log(`Generated OG pages for ${postFiles.length} post(s).`);

function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
