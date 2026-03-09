/**
 * Build-time content: local YAML + markdown -> static TypeScript modules.
 * Run from project root: node scripts/fetch-content.mjs
 *
 * Generates src/data/{settings,projects,gifs,shows,posts}.ts (all gitignored).
 * Settings, projects, GIFs, and shows come from YAML files in content/.
 * Blog posts come from markdown files in content/posts/.
 */
import { writeFileSync, mkdirSync, readdirSync, readFileSync } from 'fs';
import matter from 'gray-matter';
import { marked } from 'marked';
import { createHighlighter } from 'shiki';
import yaml from 'js-yaml';

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Set up syntax highlighting with VS Code's Dark+ theme
const highlighter = await createHighlighter({
  themes: ['dark-plus'],
  langs: ['typescript', 'javascript', 'html', 'css', 'json', 'bash', 'markdown'],
});

const renderer = {
  code({ text, lang }) {
    const language = highlighter.getLoadedLanguages().includes(lang) ? lang : 'text';
    return highlighter.codeToHtml(text, { lang: language, theme: 'dark-plus' });
  },
  link({ href, text }) {
    return `<a href="${escapeXml(href)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  },
};

marked.use({ renderer });

/** Parse a markdown string to HTML using marked (for rich text fields). */
function renderMarkdown(md) {
  if (!md) return '';
  return marked(md.trim());
}

// --- Settings ---
const settingsRaw = yaml.load(readFileSync('content/settings.yaml', 'utf-8'));

const richTextFields = [
  'intro',
  'projectsTeaser',
  'aboutTeaser',
  'blogTeaser',
  'showsTeaser',
  'aboutImprov',
  'aboutMovies',
  'aboutTtrpgs',
  'aboutCode',
];

const settings = { ...settingsRaw };
for (const field of richTextFields) {
  settings[field] = renderMarkdown(settings[field]);
}

// --- Projects ---
const projectsFile = yaml.load(readFileSync('content/projects.yaml', 'utf-8'));

const projectSections = (projectsFile.sections || []).map((s) => ({
  key: s.key,
  label: s.label,
  description: renderMarkdown(s.description || ''),
}));

const projects = (projectsFile.projects || []).map((p) => ({
  ...p,
  description: renderMarkdown(p.description),
}));

// --- GIFs ---
const GCS_BUCKET = 'https://storage.googleapis.com/samm-bio-gifs';
const gifsRaw = yaml.load(readFileSync('content/gifs.yaml', 'utf-8')) || [];
const gifsList = Array.isArray(gifsRaw) ? gifsRaw : gifsRaw.gifs || [];
const gifs = gifsList.map((g) => ({
  slug: g.slug,
  alt: g.alt,
  src: process.env.NODE_ENV === 'production' ? `${GCS_BUCKET}${g.src}` : g.src,
  width: g.width || 0,
  height: g.height || 0,
  tags: g.tags || [],
  featured: !!g.featured,
}));

// --- Shows ---
const showsData = yaml.load(readFileSync('content/shows.yaml', 'utf-8')) || {};
const venues = showsData.venues || {};
const shows = (showsData.shows || []).map((s) => {
  const venue = venues[s.venue] || {};
  return {
    title: s.title,
    venue: venue.name || s.venue,
    venueUrl: venue.url || null,
    address: venue.address || null,
    mapsUrl: venue.mapsUrl || null,
    datetime: String(s.datetime),
    endDatetime: s.endDatetime ? String(s.endDatetime) : null,
    note: s.note || null,
  };
});

// --- Blog Posts ---
const postsDir = 'content/posts';
const postFiles = readdirSync(postsDir).filter((f) => f.endsWith('.md'));

const posts = postFiles
  .map((file) => {
    const raw = readFileSync(`${postsDir}/${file}`, 'utf-8');
    const { data, content } = matter(raw);
    if (!data.publishedAt) return null;

    // Resolve relatedProjects slugs to { name, slug } objects
    const relatedProjects = (data.relatedProjects || [])
      .map((slug) => projects.find((p) => p.slug === slug))
      .filter(Boolean)
      .map(({ name, slug }) => ({ name, slug }));

    return {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      body: marked(content),
      publishedAt: new Date(data.publishedAt).toISOString(),
      tags: data.tags || null,
      relatedProjects: relatedProjects.length > 0 ? relatedProjects : null,
    };
  })
  .filter(Boolean)
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

// --- Letterboxd RSS ---
function decodeHtmlEntities(str) {
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function parseLbDescription(html) {
  if (!html) return { posterUrl: null, reviewHtml: null };
  const imgMatch = html.match(/<img\s+src="([^"]+)"/);
  const posterUrl = imgMatch ? imgMatch[1] : null;
  // Extract everything after the poster image paragraph
  const afterPoster = html.replace(/<p>\s*<img[^>]*>\s*<\/p>/, '').trim();
  if (!afterPoster) return { posterUrl, reviewHtml: null };
  // Remove "Watched on" / "Rewatched on" boilerplate paragraphs
  const cleaned = afterPoster
    .replace(/<p>\s*Watched on\s[\s\S]*?<\/p>/gi, '')
    .replace(/<p>\s*Rewatched on\s[\s\S]*?<\/p>/gi, '')
    .trim();
  // Allow only safe HTML tags
  const safeHtml = cleaned
    .replace(/<(?!\/?(?:p|blockquote|em|strong|br)\b)[^>]+>/g, '')
    .trim();
  return { posterUrl, reviewHtml: safeHtml || null };
}

let letterboxdEntries = [];
try {
  const lbRes = await fetch('https://letterboxd.com/samm_loves_film/rss/');
  if (lbRes.ok) {
    const xml = await lbRes.text();
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let lbMatch;
    while ((lbMatch = itemRegex.exec(xml)) !== null) {
      const itemXml = lbMatch[1];
      const get = (tag) => {
        const m = itemXml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
        return m ? m[1].trim() : null;
      };
      const getCdata = (tag) => {
        const m = itemXml.match(
          new RegExp(`<${tag}>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`),
        );
        return m ? m[1].trim() : null;
      };

      const title = getCdata('title') || get('title') || '';
      const link = get('link') || get('guid') || '';
      const pubDate = get('pubDate') || '';
      const filmTitle = decodeHtmlEntities(
        getCdata('letterboxd:filmTitle') || get('letterboxd:filmTitle') || '',
      );
      const filmYear = get('letterboxd:filmYear') || null;
      const memberRating = get('letterboxd:memberRating') || null;
      const rewatchVal = get('letterboxd:rewatch');
      const isRewatch = rewatchVal === 'Yes';
      const likeVal = get('letterboxd:memberLike');
      const isLiked = likeVal === 'Yes';
      const description = getCdata('description') || get('description') || '';
      const { posterUrl, reviewHtml } = parseLbDescription(description);

      const parsedDate = pubDate ? new Date(pubDate) : null;
      if (!filmTitle || !parsedDate || isNaN(parsedDate.getTime())) continue;

      letterboxdEntries.push({
        title: decodeHtmlEntities(title),
        link,
        publishedAt: parsedDate.toISOString(),
        filmTitle,
        filmYear,
        rating: memberRating,
        isRewatch,
        isLiked,
        posterUrl,
        reviewHtml,
      });
    }
  }
} catch (err) {
  console.warn('Letterboxd RSS fetch failed (build-time cache will be empty):', err.message);
}
console.log(`Fetched ${letterboxdEntries.length} Letterboxd entries.`);

// --- Write output ---
const HEADER = '// Auto-generated by scripts/fetch-content.mjs — do not edit\n';

mkdirSync('src/data', { recursive: true });

writeFileSync(
  'src/data/settings.ts',
  `${HEADER}import type { SiteSettings } from '@/lib/queries';\n\nexport const settings: SiteSettings = ${JSON.stringify(settings, null, 2)};\n`,
);

writeFileSync(
  'src/data/projects.ts',
  `${HEADER}import type { Project, ProjectSection } from '@/lib/queries';\n\nexport const projectSections: ProjectSection[] = ${JSON.stringify(projectSections, null, 2)};\n\nexport const projects: Project[] = ${JSON.stringify(projects, null, 2)};\n`,
);

writeFileSync(
  'src/data/gifs.ts',
  `${HEADER}import type { Gif } from '@/lib/queries';\n\nexport const gifs: Gif[] = ${JSON.stringify(gifs, null, 2)};\n`,
);

writeFileSync(
  'src/data/shows.ts',
  `${HEADER}import type { Show } from '@/lib/queries';\n\nexport const shows: Show[] = ${JSON.stringify(shows, null, 2)};\n`,
);

writeFileSync(
  'src/data/letterboxd.ts',
  `${HEADER}import type { LetterboxdEntry } from '@/lib/queries';\n\nexport const letterboxdEntries: LetterboxdEntry[] = ${JSON.stringify(letterboxdEntries, null, 2)};\n`,
);

writeFileSync(
  'src/data/posts.ts',
  `${HEADER}import type { BlogPost } from '@/lib/queries';\n\nexport const posts: BlogPost[] = ${JSON.stringify(posts, null, 2)};\n`,
);

// --- RSS feed ---
const siteUrl = 'https://samm.bio';
const feedItems = posts
  .map(
    (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
    </item>`,
  )
  .join('\n');

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Sam Marsh's Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Improv, code, games, and whatever else is on my mind.</description>
    <language>en-us</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${feedItems}
  </channel>
</rss>
`;

writeFileSync('public/feed.xml', feed);

console.log('Content built and written to src/data/ + public/feed.xml.');
