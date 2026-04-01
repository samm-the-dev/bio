/**
 * Sync GIF/WebP files from source folders into public/gifs/
 * and regenerate content/gifs.yaml.
 *
 * Source: ~/OneDrive/Pictures/{Dropout, Game Grumps, YouTube, Movies & TV}
 * Target: public/gifs/  (all files flat in one directory)
 *
 * Also converts GIF sources to MP4 (via ffmpeg) and animated WebP (via sharp)
 * into public/gifs/mp4/ and public/gifs/webp/, and converts WebP sources to GIF
 * into public/gifs/gif/. Only files missing a converted counterpart are processed.
 *
 * Tags are derived from the folder hierarchy (show/series name).
 * Featured status is determined by presence in public/gifs/featured/.
 *
 * Usage: node scripts/sync-gifs.mjs
 */

import { copyFileSync, mkdirSync, writeFileSync, existsSync, readdirSync, statSync, unlinkSync } from 'fs';
import { execFileSync, execFile } from 'child_process';
import { join, extname, basename, relative, sep } from 'path';
import { homedir } from 'os';
import { promisify } from 'util';

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
const MP4_DIR = join(TARGET, 'mp4');
const WEBP_DIR = join(TARGET, 'webp');
const GIF_DIR = join(TARGET, 'gif');
const FEATURED_DIR = join(TARGET, 'featured');
/** Max concurrent conversions. */
const CONCURRENCY = 4;
/** Episode-like folder names to skip when deriving tags. */
const EP_PATTERN = /^(ep\s*\d+|\d+(\.\d+)?)$/i;
/** Season folder pattern — matched folders are stripped from tags but prefixed to slugs. */
const SEASON_PATTERN = /^(?:s|season)\s*(\d+)$/i;

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
 * Derive tags and an optional season slug prefix from the folder path.
 * Takes the source folder (e.g. "Dropout") plus the first non-episode,
 * non-season subfolder as a tag. Season folders (S1, S2, Season 2, etc.)
 * are stripped from tags but returned as a slug prefix like "s2-".
 */
function deriveTagsAndSeason(srcPath, srcDir, sourceFolder) {
  const rel = relative(srcDir, srcPath);
  const parts = rel.split(sep).slice(0, -1); // drop filename
  const firstTag = parts.find((p) => !EP_PATTERN.test(p) && !SEASON_PATTERN.test(p));
  const raw = firstTag ? [sourceFolder, firstTag] : [sourceFolder];
  const tags = raw.map((t) => TAG_RENAMES.get(t) || t);

  const seasonFolder = parts.find((p) => SEASON_PATTERN.test(p));
  const seasonPrefix = seasonFolder
    ? `s${seasonFolder.match(SEASON_PATTERN)[1]}-`
    : '';

  return { tags, seasonPrefix };
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

    const src = `/gifs/${file}`;
    const { tags, seasonPrefix } = deriveTagsAndSeason(srcPath, srcDir, folder);

    // Deduplicate slugs (season prefix keeps S1/S2 episodes distinct)
    let slug = seasonPrefix + slugify(file);
    if (seenSlugs.has(slug)) {
      let i = 2;
      while (seenSlugs.has(`${slug}-${i}`)) i++;
      slug = `${slug}-${i}`;
    }
    seenSlugs.add(slug);

    // Read dimensions via ImageMagick
    let width = 0;
    let height = 0;
    try {
      const out = execFileSync('magick', ['identify', '-format', '%w %h', `${join(TARGET, file)}[0]`], {
        encoding: 'utf-8',
        timeout: 5000,
      }).trim();
      const [w, h] = out.split(' ').map(Number);
      if (w && h) { width = w; height = h; }
    } catch {
      console.warn(`  Could not process: ${file}`);
    }

    const stem = basename(file, extname(file));
    entries.push({
      slug,
      alt: stem,
      src,
      ext: extname(file).toLowerCase(),
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

console.log(`\nCollected ${entries.length} entries`);
const featuredCount = entries.filter((e) => e.featured).length;
if (featuredCount > 0) console.log(`${featuredCount} marked as featured`);
const tagSet = new Set(entries.flatMap((e) => e.tags));
console.log(`${tagSet.size} unique tags: ${[...tagSet].sort().join(', ')}`);

// --- Clean up orphaned files (not in any source folder anymore) ---
const knownFiles = new Set(entries.map((e) => basename(e.src)));
const knownSlugs = new Set(entries.map((e) => e.slug));
let orphanCount = 0;

// Clean main target dir (skip subdirectories)
for (const f of readdirSync(TARGET)) {
  const full = join(TARGET, f);
  if (statSync(full).isDirectory()) continue;
  if (!knownFiles.has(f)) {
    unlinkSync(full);
    orphanCount++;
  }
}

// Clean converted subdirs by slug
for (const [dir, fmtExt] of [[MP4_DIR, '.mp4'], [WEBP_DIR, '.webp'], [GIF_DIR, '.gif']]) {
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) {
    const slug = basename(f, fmtExt);
    if (!knownSlugs.has(slug)) {
      unlinkSync(join(dir, f));
      orphanCount++;
    }
  }
}

if (orphanCount > 0) console.log(`Removed ${orphanCount} orphaned files`);

// --- Convert to MP4, WebP, and GIF ---
mkdirSync(MP4_DIR, { recursive: true });
mkdirSync(WEBP_DIR, { recursive: true });
mkdirSync(GIF_DIR, { recursive: true });

const execFileAsync = promisify(execFile);

/** Convert a GIF or WebP to MP4 via ffmpeg. WebP sources are converted to a
 *  temporary GIF first (via sharp) since ffmpeg animated WebP support varies. */
async function convertToMp4(srcFile, outFile) {
  let input = srcFile;
  let tempGif;
  try {
    if (extname(srcFile).toLowerCase() === '.webp') {
      tempGif = outFile.replace(/\.mp4$/, '.tmp.gif');
      const sharp = (await import('sharp')).default;
      await sharp(srcFile, { animated: true }).gif().toFile(tempGif);
      input = tempGif;
    }
    await execFileAsync('ffmpeg', [
      '-y', '-i', input,
      '-movflags', 'faststart',
      '-pix_fmt', 'yuv420p',
      '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
      '-c:v', 'libx264',
      '-crf', '23',
      '-preset', 'medium',
      '-an',
      outFile,
    ], { timeout: 60000, maxBuffer: 10 * 1024 * 1024 });
    return true;
  } catch (err) {
    console.warn(`  MP4 failed: ${basename(srcFile)} — ${err.message}`);
    return false;
  } finally {
    if (tempGif && existsSync(tempGif)) unlinkSync(tempGif);
  }
}

/** Convert a single GIF to animated WebP via sharp. Returns true if converted. */
async function convertToWebp(srcFile, outFile) {
  try {
    const sharp = (await import('sharp')).default;
    await sharp(srcFile, { animated: true })
      .webp({ quality: 75, effort: 4 })
      .toFile(outFile);
    return true;
  } catch (err) {
    console.warn(`  WebP failed: ${basename(srcFile)} — ${err.message}`);
    return false;
  }
}

/** Convert an animated WebP source to GIF via sharp. Returns true if converted. */
async function convertToGif(srcFile, outFile) {
  try {
    const sharp = (await import('sharp')).default;
    await sharp(srcFile, { animated: true })
      .gif()
      .toFile(outFile);
    return true;
  } catch (err) {
    console.warn(`  GIF failed: ${basename(srcFile)} — ${err.message}`);
    return false;
  }
}

/** Run async tasks with limited concurrency. Returns count of successes. */
async function runPool(tasks, concurrency) {
  let i = 0;
  let succeeded = 0;
  async function next() {
    while (i < tasks.length) {
      const task = tasks[i++];
      if (await task()) succeeded++;
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, () => next()));
  return succeeded;
}

// Check ffmpeg availability once
let hasFfmpeg = true;
try {
  execFileSync('ffmpeg', ['-version'], { stdio: 'ignore', timeout: 5000 });
} catch {
  hasFfmpeg = false;
  console.warn('ffmpeg not found — skipping MP4 conversion');
}

// All entries get MP4 (if ffmpeg available); GIF sources get WebP; WebP sources get GIF
const mp4Tasks = [];
const webpTasks = [];
const gifTasks = [];

/** True if outFile is missing or older than srcFile. */
function needsConvert(srcFile, outFile) {
  if (!existsSync(outFile)) return true;
  return statSync(srcFile).mtimeMs > statSync(outFile).mtimeMs;
}

for (const entry of entries) {
  const srcFile = join(TARGET, basename(entry.src));
  const mp4Out = join(MP4_DIR, `${entry.slug}.mp4`);

  if (hasFfmpeg && needsConvert(srcFile, mp4Out)) {
    mp4Tasks.push(() => convertToMp4(srcFile, mp4Out));
  }

  if (entry.ext === '.gif') {
    const webpOut = join(WEBP_DIR, `${entry.slug}.webp`);
    if (needsConvert(srcFile, webpOut)) {
      webpTasks.push(() => convertToWebp(srcFile, webpOut));
    }
  } else if (entry.ext === '.webp') {
    const gifOut = join(GIF_DIR, `${entry.slug}.gif`);
    if (needsConvert(srcFile, gifOut)) {
      gifTasks.push(() => convertToGif(srcFile, gifOut));
    }
  }
}

const totalTasks = mp4Tasks.length + webpTasks.length + gifTasks.length;
if (totalTasks > 0) {
  console.log(`\nConverting: ${mp4Tasks.length} MP4, ${webpTasks.length} WebP, ${gifTasks.length} GIF (concurrency: ${CONCURRENCY})...`);

  // Run sharp tasks sequentially after MP4 to avoid overwhelming CPU
  const mp4Count = hasFfmpeg && mp4Tasks.length > 0
    ? await runPool(mp4Tasks, CONCURRENCY)
    : 0;
  const webpCount = webpTasks.length > 0
    ? await runPool(webpTasks, CONCURRENCY)
    : 0;
  const gifCount = gifTasks.length > 0
    ? await runPool(gifTasks, CONCURRENCY)
    : 0;

  for (const [format, count] of [['MP4', mp4Count], ['WebP', webpCount], ['GIF', gifCount]]) {
    if (count > 0) console.log(`  ${format}: ${count} files converted`);
  }
} else {
  console.log('\nAll conversions up to date.');
}

// Backfill format paths — only reference files that actually exist
for (const entry of entries) {
  const mp4Path = join(MP4_DIR, `${entry.slug}.mp4`);
  if (existsSync(mp4Path)) entry.srcMp4 = `/gifs/mp4/${entry.slug}.mp4`;

  if (entry.ext === '.gif') {
    const webpPath = join(WEBP_DIR, `${entry.slug}.webp`);
    entry.srcWebp = existsSync(webpPath) ? `/gifs/webp/${entry.slug}.webp` : undefined;
    entry.srcGif = entry.src;
  } else if (entry.ext === '.webp') {
    entry.srcWebp = entry.src;
    const gifPath = join(GIF_DIR, `${entry.slug}.gif`);
    entry.srcGif = existsSync(gifPath) ? `/gifs/gif/${entry.slug}.gif` : undefined;
  }
}

// Generate YAML (after conversion so paths reflect actual files)
const lines = [
  '# Auto-generated by scripts/sync-gifs.mjs — do not edit manually',
  '# except for `featured` flags. To re-sync, run: npm run sync-gifs',
  '',
];

for (const entry of entries) {
  lines.push(`- slug: ${entry.slug}`);
  lines.push(`  alt: "${entry.alt.replace(/"/g, '\\"')}"`);
  lines.push(`  src: "${entry.src}"`);
  if (entry.srcMp4) lines.push(`  srcMp4: "${entry.srcMp4}"`);
  if (entry.srcWebp) lines.push(`  srcWebp: "${entry.srcWebp}"`);
  if (entry.srcGif) lines.push(`  srcGif: "${entry.srcGif}"`);
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

// Upload to Google Cloud Storage
const GCS_BUCKET = 'gs://samm-bio-gifs';
console.log(`\nSyncing to ${GCS_BUCKET}...`);
try {
  // Sync original GIFs (exclude featured/, mp4/, webp/ subdirs)
  execFileSync('gcloud', [
    'storage', 'rsync', TARGET, `${GCS_BUCKET}/gifs/`,
    '--recursive', '--delete-unmatched-destination-objects',
    '--exclude=featured/.*', '--exclude=mp4/.*', '--exclude=webp/.*', '--exclude=gif/.*',
  ], { stdio: 'inherit', timeout: 300000 });

  // Sync converted subdirectories
  for (const [dir, name] of [[MP4_DIR, 'mp4'], [WEBP_DIR, 'webp'], [GIF_DIR, 'gif']]) {
    if (existsSync(dir) && readdirSync(dir).length > 0) {
      execFileSync('gcloud', [
        'storage', 'rsync', dir, `${GCS_BUCKET}/gifs/${name}/`,
        '--recursive', '--delete-unmatched-destination-objects',
      ], { stdio: 'inherit', timeout: 300000 });
    }
  }

  console.log('GCS sync complete.');
} catch {
  console.warn('GCS sync failed — run manually:\n  gcloud storage rsync public/gifs/ gs://samm-bio-gifs/gifs/ --recursive --exclude="featured/.*" --exclude="mp4/.*" --exclude="webp/.*" --exclude="gif/.*"\n  then sync each subdir separately');
}
