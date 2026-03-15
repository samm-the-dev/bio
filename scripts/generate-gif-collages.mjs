import { readFileSync, writeFileSync, mkdirSync, copyFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { execSync } from 'child_process';
import yaml from 'js-yaml';
import sharp from 'sharp';

// Each entry has `rows`: an array of 3 arrays of GIF slugs.
// Tiles in each row are shown at their natural aspect ratio. The widths are
// scaled uniformly so the row fills CANVAS_W exactly. Keep each row's natural
// widths summing close to CANVAS_W to minimise distortion — mix squares with
// landscape tiles rather than grouping all squares in one row.
const COLLAGE_TAGS = [
  {
    tag: 'Cloudward Ho',
    slug: 'cloudward-ho',
    rows: [
      // 2 square + 2 landscape ≈ 1166px → scale ~1.03
      ['who-s-horny-i-m-horny', 'i-am-a-rowdy', 'the-main-guy', 'ass-creamed-cream-ass'],
      // 2 square + 1 near-4:3 + 1 landscape ≈ 1091px → scale ~1.10
      ['full-of-beans', 'you-re-not-supposed-to-say-that', 'are-you-making-fun-of-me', 'we-re-gonna-get-you-freaky'],
      // 3 landscape ≈ 1119px → scale ~1.07
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

const CANVAS_W = 1200;
const CANVAS_H = 630;
const TILE_H = Math.floor(CANVAS_H / 3); // 210 — fixed row height
const OUT_DIR = 'public/og-collages';

/**
 * For a row of GIFs, compute tile widths from each GIF's natural aspect ratio
 * at TILE_H. No row-level scaling — zero distortion. The last tile absorbs the
 * integer pixel remainder (always < 1px per tile, imperceptible). Warns if the
 * row fills less than 85% of CANVAS_W so you know to add more tiles.
 */
function computeRowWidths(rowGifData) {
  const natural = rowGifData.map((g) => Math.round(TILE_H * (g.width / g.height)));
  const naturalSum = natural.reduce((s, w) => s + w, 0);
  const fillPct = (naturalSum / CANVAS_W * 100).toFixed(1);
  if (naturalSum < CANVAS_W * 0.85) {
    console.warn(`  WARNING: row fills only ${fillPct}% (${naturalSum}/${CANVAS_W}px) — add more tiles`);
  } else {
    console.log(`  Row fill: ${fillPct}% (${naturalSum}/${CANVAS_W}px)`);
  }
  // Last tile absorbs remainder so composited row reaches exactly CANVAS_W.
  const widths = [...natural];
  widths[widths.length - 1] = CANVAS_W - natural.slice(0, -1).reduce((s, w) => s + w, 0);
  return widths;
}

/**
 * Score a frame for subtitle content: count bright pixels (>200) in the bottom
 * 15% of the image. White subtitle text on a dark background creates a cluster
 * of bright pixels there; busy scene detail does not reliably do the same.
 */
async function subtitleScore(localPath, page) {
  try {
    const { data, info } = await sharp(localPath, { page })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const bottomStart = Math.floor(info.height * 0.85) * info.width;
    const slice = data.subarray(bottomStart);
    let bright = 0;
    for (const v of slice) { if (v > 200) bright++; }
    return bright / slice.length;
  } catch {
    return 0;
  }
}

/**
 * Sample up to 20 evenly-spaced frames and return the page with the highest
 * subtitle-region bright-pixel density.
 */
async function bestFrame(localPath) {
  let pageCount = 1;
  try {
    const meta = await sharp(localPath, { animated: true }).metadata();
    pageCount = meta.pages ?? 1;
  } catch { /* single-frame */ }

  const maxSamples = Math.min(pageCount, 20);
  const step = Math.max(1, Math.floor(pageCount / maxSamples));
  const pages = [];
  for (let p = 0; p < pageCount; p += step) pages.push(p);

  let bestPage = pages[0] ?? 0;
  let bestScore = -1;
  for (const page of pages) {
    const score = await subtitleScore(localPath, page);
    if (score > bestScore) { bestScore = score; bestPage = page; }
  }
  return bestPage;
}

/**
 * Extract the best subtitle frame and resize to (w, h).
 * w is derived from the GIF's natural aspect ratio at TILE_H, so fit:'fill'
 * is pixel-accurate: w/h ≈ src_w/src_h with at most 0.5px rounding error.
 * No crop, no distortion.
 */
async function extractFrame(localPath, w, h, slug = '') {
  const opts = { fit: 'fill' };

  if (!localPath.endsWith('.gif')) {
    return sharp(localPath).resize(w, h, opts).toBuffer();
  }

  // Use OCR-selected frame if available, otherwise fall back to heuristic
  const page = slug in frameOverrides ? frameOverrides[slug] : await bestFrame(localPath);
  try {
    return await sharp(localPath, { page }).resize(w, h, opts).toBuffer();
  } catch {
    const safeTmp = join(tmpdir(), `collage-input-${Date.now()}.gif`);
    const frameTmp = join(tmpdir(), `collage-frame-${Date.now()}.png`);
    copyFileSync(localPath, safeTmp);
    try {
      execSync(`ffmpeg -y -i "${safeTmp}" -vframes 1 -f image2 "${frameTmp}"`, { stdio: 'pipe' });
    } finally {
      unlinkSync(safeTmp);
    }
    const buf = await sharp(frameTmp).resize(w, h, opts).toBuffer();
    unlinkSync(frameTmp);
    return buf;
  }
}

async function buildCollage(rows, gifBySlug) {
  const rowGifData = rows.map((row) =>
    row.map((slug) => {
      const g = gifBySlug.get(slug);
      if (!g) throw new Error(`GIF slug not found: ${slug}`);
      return g;
    }),
  );

  const layouts = rowGifData.map(computeRowWidths);

  // Extract frames at per-tile dimensions
  const tiles = await Promise.all(
    rowGifData.flatMap((rowGifs, rowIdx) =>
      rowGifs.map((g, col) =>
        extractFrame('public' + g.src, layouts[rowIdx][col], TILE_H, g.slug),
      ),
    ),
  );

  // Brick layout: rows 0 and 2 left-aligned, row 1 shifted right by half its
  // first tile's width. Row 1's rightmost tile bleeds off canvas (sharp clips).
  // Its right slice wraps back to fill the left gap.
  const composites = [];
  const brickOffset = Math.round(layouts[1][0] / 2);

  // Rows 0 and 2
  let tileIdx = 0;
  for (const row of [0, 2]) {
    const startIdx = row === 0 ? 0 : rowGifData[0].length + rowGifData[1].length;
    let x = 0;
    for (let col = 0; col < rowGifData[row].length; col++) {
      composites.push({ input: tiles[startIdx + col], top: row * TILE_H, left: x });
      x += layouts[row][col];
    }
  }
  tileIdx; // suppress unused warning

  // Row 1: staggered
  const row1Start = rowGifData[0].length;
  const row1Len = rowGifData[1].length;
  const lastTileW = layouts[1][row1Len - 1];
  const wrapSlice = await sharp(tiles[row1Start + row1Len - 1])
    .extract({ left: lastTileW - brickOffset, top: 0, width: brickOffset, height: TILE_H })
    .toBuffer();
  composites.push({ input: wrapSlice, top: TILE_H, left: 0 });

  let x1 = brickOffset;
  for (let col = 0; col < row1Len; col++) {
    composites.push({ input: tiles[row1Start + col], top: TILE_H, left: x1 });
    x1 += layouts[1][col];
  }

  return sharp({
    create: { width: CANVAS_W, height: CANVAS_H, channels: 3, background: '#000000' },
  })
    .composite(composites)
    .jpeg({ quality: 85 })
    .toBuffer();
}

const gifsRaw = yaml.load(readFileSync('content/gifs.yaml', 'utf-8'));
const gifsList = Array.isArray(gifsRaw) ? gifsRaw : [];
const gifBySlug = new Map(gifsList.map((g) => [g.slug, g]));

// Frame overrides produced by scripts/pick-subtitle-frames.mjs
const frameOverridesPath = 'scripts/subtitle-frames.json';
const frameOverrides = existsSync(frameOverridesPath)
  ? JSON.parse(readFileSync(frameOverridesPath, 'utf-8'))
  : {};

mkdirSync(OUT_DIR, { recursive: true });

for (const entry of COLLAGE_TAGS) {
  console.log(`Generating collage for: ${entry.tag}`);
  const buf = await buildCollage(entry.rows, gifBySlug);
  const outPath = `${OUT_DIR}/${entry.slug}.jpg`;
  writeFileSync(outPath, buf);
  console.log(`  Written: ${outPath}`);
}

console.log('Done.');
