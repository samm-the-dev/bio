/**
 * Sync GIF/WebP files from source folders into public/gifs/
 * and regenerate content/gifs.yaml.
 *
 * Source: ~/OneDrive/Pictures/{Dropout, Game Grumps, Misc YouTube, Movies & TV}
 * Target: public/gifs/  (all files flat in one directory)
 *
 * Tags are derived from the folder hierarchy (show/series name).
 * Featured status is determined by presence in public/gifs/featured/.
 * Preserves hand-edited overrides across runs.
 *
 * Usage: node scripts/sync-gifs.mjs
 */

import { copyFileSync, mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { execFileSync } from 'child_process';
import { join, extname, basename, relative, sep } from 'path';
import { homedir } from 'os';
import yaml from 'js-yaml';

const PICTURES = join(homedir(), 'OneDrive', 'Pictures');
const YAML_PATH = 'content/gifs.yaml';

const SOURCES = [
  'Dropout',
  'Game Grumps',
  'YouTube',
  'Movies & TV',
];

const EXTS = new Set(['.gif', '.webp']);
const TARGET = 'public/gifs';
const THUMBS_DIR = join(TARGET, 'thumbs');
const FEATURED_DIR = join(TARGET, 'featured');

/** Episode-like folder names to skip when deriving tags. */
const EP_PATTERN = /^(ep\s*\d+|\d+(\.\d+)?)$/i;

/** Rename folder names to preferred display names. */
const TAG_RENAMES = new Map([
  ['Gamechanger', 'Game Changer'],
]);

function slugify(name) {
  return name
    .replace(extname(name), '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Recursively collect all GIF/WebP files from a directory. */
function collectFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...collectFiles(full));
    } else if (EXTS.has(extname(entry).toLowerCase())) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Derive tags from the path between the source folder and the file.
 * Always includes the source folder (e.g. "Dropout") plus any
 * non-episode subfolder names (e.g. "Gamechanger").
 */
function deriveTags(srcPath, srcDir, sourceFolder) {
  const rel = relative(srcDir, srcPath);
  const parts = rel.split(sep).slice(0, -1); // drop filename
  const subTags = parts.filter((p) => !EP_PATTERN.test(p));
  const raw = [sourceFolder, ...subTags];
  return raw.map((t) => TAG_RENAMES.get(t) || t);
}

// Build set of featured filenames from the featured subfolder
const featuredFiles = new Set();
if (existsSync(FEATURED_DIR)) {
  for (const f of readdirSync(FEATURED_DIR)) {
    if (EXTS.has(extname(f).toLowerCase())) {
      featuredFiles.add(f);
    }
  }
  console.log(`${featuredFiles.size} files in featured/`);
}

mkdirSync(TARGET, { recursive: true });
mkdirSync(THUMBS_DIR, { recursive: true });

const entries = [];
const seenSlugs = new Set();
const seenFiles = new Map(); // filename -> srcPath, detect collisions

for (const folder of SOURCES) {
  const srcDir = join(PICTURES, folder);
  if (!existsSync(srcDir)) {
    console.warn(`Skipping missing folder: ${srcDir}`);
    continue;
  }

  const files = collectFiles(srcDir);

  for (const srcPath of files) {
    const file = basename(srcPath);

    // Warn on filename collision from different sources
    if (seenFiles.has(file) && seenFiles.get(file) !== srcPath) {
      console.warn(`  Collision: "${file}" exists in multiple folders, last one wins`);
    }
    seenFiles.set(file, srcPath);
    copyFileSync(srcPath, join(TARGET, file));

    // Deduplicate slugs
    let slug = slugify(file);
    if (seenSlugs.has(slug)) {
      let i = 2;
      while (seenSlugs.has(`${slug}-${i}`)) i++;
      slug = `${slug}-${i}`;
    }
    seenSlugs.add(slug);

    const src = `/gifs/${file}`;
    const tags = deriveTags(srcPath, srcDir, folder);

    // Read dimensions and generate static thumbnail via ImageMagick
    let width = 0;
    let height = 0;
    const thumbFile = `${slug}.webp`;
    const thumbPath = join(THUMBS_DIR, thumbFile);
    try {
      const out = execFileSync('magick', ['identify', '-format', '%w %h', `${join(TARGET, file)}[0]`], {
        encoding: 'utf-8',
        timeout: 5000,
      }).trim();
      const [w, h] = out.split(' ').map(Number);
      if (w && h) { width = w; height = h; }

      // First frame as static WebP thumbnail (skip if already exists and source unchanged)
      const srcStat = statSync(join(TARGET, file));
      if (!existsSync(thumbPath) || statSync(thumbPath).mtimeMs < srcStat.mtimeMs) {
        execFileSync('magick', [`${join(TARGET, file)}[0]`, '-quality', '80', thumbPath], {
          timeout: 10000,
        });
      }
    } catch {
      console.warn(`  Could not process: ${file}`);
    }

    entries.push({
      slug,
      alt: basename(file, extname(file)),
      src,
      thumb: `/gifs/thumbs/${thumbFile}`,
      width,
      height,
      tags,
      featured: featuredFiles.has(file),
    });
  }

  console.log(`${folder}: ${files.length} files`);
}

// Sort alphabetically by slug for stable output
entries.sort((a, b) => a.slug.localeCompare(b.slug));

// Generate YAML
const lines = [
  '# Auto-generated by scripts/sync-gifs.mjs — do not edit manually',
  '# except for `featured` flags. To re-sync, run: npm run sync-gifs',
  '',
];

for (const entry of entries) {
  lines.push(`- slug: ${entry.slug}`);
  lines.push(`  alt: "${entry.alt.replace(/"/g, '\\"')}"`);
  lines.push(`  src: "${entry.src}"`);
  lines.push(`  thumb: "${entry.thumb}"`);
  if (entry.width && entry.height) {
    lines.push(`  width: ${entry.width}`);
    lines.push(`  height: ${entry.height}`);
  }
  if (entry.tags.length > 0) {
    lines.push(`  tags: [${entry.tags.map((t) => `"${t}"`).join(', ')}]`);
  }
  if (entry.featured) lines.push('  featured: true');
  lines.push('');
}

writeFileSync(YAML_PATH, lines.join('\n'));
console.log(`\nWrote ${entries.length} entries to ${YAML_PATH}`);
const featuredCount = entries.filter((e) => e.featured).length;
if (featuredCount > 0) console.log(`${featuredCount} marked as featured`);
const tagSet = new Set(entries.flatMap((e) => e.tags));
console.log(`${tagSet.size} unique tags: ${[...tagSet].sort().join(', ')}`);
