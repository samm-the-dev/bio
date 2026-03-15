/**
 * For each GIF in COLLAGE_TAGS, sample candidate frames, run Tesseract OCR on
 * the bottom strip of each, and pick the frame with the most confident subtitle
 * text. Outputs a JSON map of { slug: pageIndex } to stdout so gen-collages can
 * use it as a frame override. Writes the result to scripts/subtitle-frames.json.
 *
 * Usage:
 *   node scripts/pick-subtitle-frames.mjs
 *   node scripts/pick-subtitle-frames.mjs --tag "One Piece"
 *
 * Requires: npm install --save-dev tesseract.js
 */
import { readFileSync, writeFileSync } from 'fs';
import { createWorker } from 'tesseract.js';
import yaml from 'js-yaml';
import sharp from 'sharp';

const COLLAGE_TAGS = [
  {
    tag: 'Cloudward Ho',
    slug: 'cloudward-ho',
    rows: [
      ['who-s-horny-i-m-horny', 'i-am-a-rowdy', 'the-main-guy', 'ass-creamed-cream-ass'],
      ['full-of-beans', 'you-re-not-supposed-to-say-that', 'are-you-making-fun-of-me', 'we-re-gonna-get-you-freaky'],
      ['havin-fun-chillin-out', 'chunky-ep', 'i-have-become-rowdy'],
    ],
  },
  {
    tag: 'Game Changer',
    slug: 'game-changer',
    rows: [
      ['sick-sick-man', 'vulnerability', 'flow-state'],
      ['left-me-on-my-own', 'weak-mind', 'i-will-not-do-that'],
      ['fuck-you-society', 'no-bits', 'lock-in-tear-it-up'],
    ],
  },
  {
    tag: 'One Piece',
    slug: 'one-piece',
    rows: [
      ['ep01-ill-be-the-hero', 'ep02-ricochet-shot', 'ep02-where-are-my-freaks'],
      ['ep04-didnt-plan-for-that', 'ep06-whos-hungry', 'ep08-feel-what-you-need-to-feel'],
      ['ep08-fishman-karate', 'ep08-gonna-get-outta-here', 'ep08-nothings-gonna-stand'],
    ],
  },
];

const MAX_SAMPLES = 20;
const OUT_FILE = 'scripts/subtitle-frames.json';

// Optional --tag filter
const tagFilter = process.argv.includes('--tag')
  ? process.argv[process.argv.indexOf('--tag') + 1]
  : null;

const gifsRaw = yaml.load(readFileSync('content/gifs.yaml', 'utf-8'));
const gifsList = Array.isArray(gifsRaw) ? gifsRaw : [];
const gifBySlug = new Map(gifsList.map((g) => [g.slug, g]));

const worker = await createWorker('eng', 1, { logger: () => {} });

async function ocrScore(imageBuf) {
  const { data } = await worker.recognize(imageBuf);
  // Confidence 0–100; require at least a few characters to avoid noise
  return data.text.trim().length >= 3 ? data.confidence : 0;
}

async function bestSubtitleFrame(localPath) {
  let pageCount = 1;
  try {
    const meta = await sharp(localPath, { animated: true }).metadata();
    pageCount = meta.pages ?? 1;
  } catch { /* single-frame */ }

  const step = Math.max(1, Math.floor(pageCount / MAX_SAMPLES));
  const pages = [];
  for (let p = 0; p < pageCount; p += step) pages.push(p);

  let bestPage = pages[0] ?? 0;
  let bestScore = -1;

  for (const page of pages) {
    try {
      // Crop bottom 20% of the frame for OCR
      const meta = await sharp(localPath, { page }).metadata();
      const h = meta.height ?? 300;
      const w = meta.width ?? 600;
      const stripH = Math.max(1, Math.floor(h * 0.2));
      const strip = await sharp(localPath, { page })
        .extract({ left: 0, top: h - stripH, width: w, height: stripH })
        .png()
        .toBuffer();
      const score = await ocrScore(strip);
      process.stderr.write(`  page ${page}: score ${score.toFixed(1)}\n`);
      if (score > bestScore) { bestScore = score; bestPage = page; }
    } catch { /* skip bad frames */ }
  }

  return { page: bestPage, score: bestScore };
}

// Load existing overrides so we only reprocess what's needed
let existing = {};
try { existing = JSON.parse(readFileSync(OUT_FILE, 'utf-8')); } catch { /* first run */ }

const results = { ...existing };

const tags = tagFilter
  ? COLLAGE_TAGS.filter((t) => t.tag === tagFilter)
  : COLLAGE_TAGS;

for (const entry of tags) {
  const slugs = entry.rows.flat();
  console.log(`\n=== ${entry.tag} (${slugs.length} GIFs) ===`);

  for (const slug of slugs) {
    const g = gifBySlug.get(slug);
    if (!g) { console.warn(`  MISSING: ${slug}`); continue; }

    const localPath = 'public' + g.src;
    console.log(`  ${slug}`);
    const { page, score } = await bestSubtitleFrame(localPath);
    console.log(`  → page ${page} (score ${score.toFixed(1)})`);
    results[slug] = page;
  }
}

await worker.terminate();

writeFileSync(OUT_FILE, JSON.stringify(results, null, 2));
console.log(`\nWritten: ${OUT_FILE}`);
