/**
 * Generate og:video MP4s for GIF tag pages.
 *
 * For each tag, builds a seamlessly-looping horizontal scroll of animated
 * GIFs at 1200×630. Each GIF plays its animation while scrolling past.
 *
 * Uses sharp to render each frame and pipes raw RGB to ffmpeg for encoding.
 *
 * Usage:
 *   npm run gen-videos
 *   npm run gen-videos -- --tag "One Piece (Netflix)"
 */
import { readFileSync, mkdirSync } from 'fs';
import { spawn } from 'child_process';
import yaml from 'js-yaml';
import sharp from 'sharp';

// Reuse the same curated GIF selections from the collage script.
// Each entry's rows are flattened into a single horizontal strip.
const VIDEO_TAGS = [
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
    tag: 'One Piece (Netflix)',
    slug: 'one-piece-netflix',
    rows: [
      ['ep01-ill-be-the-hero', 'ep02-where-are-my-freaks'],
      ['ep04-didnt-plan-for-that', 'ep06-whos-hungry', 'ep08-feel-what-you-need-to-feel'],
      ['ep08-fishman-karate', 'ep08-gonna-get-outta-here', 'ep08-nothings-gonna-stand'],
    ],
  },
];

const OUTPUT_W = 1200;
const OUTPUT_H = 630;
const FPS = 24;
const TILE_GAP = 4; // px gap between tiles
const OUT_DIR = 'public/og-videos';

// --- GIF data ---

const gifsRaw = yaml.load(readFileSync('content/gifs.yaml', 'utf-8'));
const gifsList = Array.isArray(gifsRaw) ? gifsRaw : [];
const gifBySlug = new Map(gifsList.map((g) => [g.slug, g]));

// Optional --tag filter
const tagFilter = process.argv.includes('--tag')
  ? process.argv[process.argv.indexOf('--tag') + 1]
  : null;

// --- Helpers ---

/** For a GIF with per-frame delays, find the page index at a given time. */
function pageAtTime(delays, timeMs) {
  const totalDur = delays.reduce((s, d) => s + d, 0);
  if (totalDur === 0) return 0;
  const t = ((timeMs % totalDur) + totalDur) % totalDur;
  let elapsed = 0;
  for (let i = 0; i < delays.length; i++) {
    elapsed += delays[i];
    if (t < elapsed) return i;
  }
  return 0;
}

/** Pre-decode all animation frames for a tile at target dimensions (as PNG). */
async function predecodeTile(path, pageCount, delays, tileW) {
  const frames = [];
  for (let page = 0; page < pageCount; page++) {
    try {
      const buf = await sharp(path, { page })
        .resize(tileW, OUTPUT_H, { fit: 'contain', background: '#000000' })
        .png()
        .toBuffer();
      frames.push(buf);
    } catch {
      // If a page fails, reuse the previous frame (or a transparent tile)
      if (frames.length > 0) {
        frames.push(frames[frames.length - 1]);
      } else {
        const blank = await sharp({ create: { width: tileW, height: OUTPUT_H, channels: 3, background: '#000' } }).png().toBuffer();
        frames.push(blank);
      }
    }
  }
  return { frames, delays, tileW };
}

/** Render one output frame: composite visible tiles onto a 1200×630 canvas. */
async function renderFrame(tiles, stripW, scrollX, timeMs) {
  const composites = [];

  let x = 0;
  for (const tile of tiles) {
    // Check both the original and wrapped position for seamless scroll loop.
    // Wrap copies use wrapOffset for seamless animation at the loop point.
    for (const [posOffset, isWrap] of [[0, false], [stripW, true]]) {
      const tileX = Math.round(x + posOffset - scrollX);

      // Skip if tile is completely off-screen
      if (tileX >= OUTPUT_W || tileX + tile.tileW <= 0) continue;

      // Pick the right animation frame
      const animTime = isWrap ? timeMs + tile.wrapOffset : timeMs;
      const page = pageAtTime(tile.delays, animTime);
      const frameBuf = tile.frames[page];

      // Clip tile to canvas boundaries [0, OUTPUT_W]
      let clipLeft = 0;
      let drawX = tileX;
      let visibleW = tile.tileW;

      if (tileX < 0) {
        clipLeft = -tileX;
        drawX = 0;
        visibleW -= clipLeft;
      }
      if (drawX + visibleW > OUTPUT_W) {
        visibleW = OUTPUT_W - drawX;
      }
      if (visibleW <= 0) continue;

      if (clipLeft > 0 || visibleW < tile.tileW) {
        const clipped = await sharp(frameBuf)
          .extract({ left: clipLeft, top: 0, width: visibleW, height: OUTPUT_H })
          .png()
          .toBuffer();
        composites.push({ input: clipped, left: drawX, top: 0 });
      } else {
        composites.push({ input: frameBuf, left: drawX, top: 0 });
      }
    }
    x += tile.tileW + TILE_GAP;
  }

  return sharp({
    create: { width: OUTPUT_W, height: OUTPUT_H, channels: 3, background: '#000000' },
  })
    .composite(composites)
    .removeAlpha()
    .raw()
    .toBuffer();
}

// --- Main ---

async function generateVideo(entry) {
  const slugs = entry.rows.flat();
  console.log(`\n=== ${entry.tag} (${slugs.length} GIFs) ===`);

  // Gather tile metadata and pre-decode all frames
  const tiles = [];
  let stripW = 0;

  for (const slug of slugs) {
    const g = gifBySlug.get(slug);
    if (!g) { console.warn(`  MISSING: ${slug}`); continue; }

    const localPath = 'public' + g.src;
    const meta = await sharp(localPath, { animated: true }).metadata();
    const pageCount = meta.pages ?? 1;
    const delays = meta.delay ?? Array(pageCount).fill(100);
    const tileW = Math.min(Math.round(OUTPUT_H * (g.width / g.height)), OUTPUT_W);

    process.stderr.write(`  Pre-decoding ${slug} (${pageCount} frames)...\r`);
    const decoded = await predecodeTile(localPath, pageCount, delays, tileW);
    tiles.push({ ...decoded, slug, wrapOffset: 0 });
    stripW += tileW + TILE_GAP;
  }
  stripW -= TILE_GAP; // no gap after the last tile

  // Scroll speed: ~200px/sec means each 1120px-wide landscape GIF is visible for ~5.5s.
  // Round frame count and adjust speed so total scroll = exactly one strip width (seamless loop).
  const totalFrames = Math.round(stripW * FPS / 200);
  const scrollSpeed = stripW * FPS / totalFrames;
  const duration = totalFrames / FPS;

  // Wrap copies use an animation offset so they align with the real copies
  // at the loop point — seamless animation across the video loop.
  const videoDurMs = duration * 1000;
  for (const tile of tiles) {
    const totalGifDur = tile.delays.reduce((s, d) => s + d, 0);
    if (totalGifDur > 0) {
      const remainder = videoDurMs % totalGifDur;
      tile.wrapOffset = remainder > 0 ? totalGifDur - remainder : 0;
    } else {
      tile.wrapOffset = 0;
    }
  }

  console.log(`  Strip: ${stripW}px, Duration: ${duration.toFixed(1)}s, Frames: ${totalFrames}`);
  console.log(`  Scroll speed: ${scrollSpeed.toFixed(0)}px/s`);

  // Spawn ffmpeg
  const outPath = `${OUT_DIR}/${entry.slug}.mp4`;
  const ffmpeg = spawn('ffmpeg', [
    '-y',
    '-f', 'rawvideo',
    '-vcodec', 'rawvideo',
    '-s', `${OUTPUT_W}x${OUTPUT_H}`,
    '-pix_fmt', 'rgb24',
    '-r', String(FPS),
    '-i', '-',
    '-an',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'medium',
    '-crf', '23',
    '-movflags', '+faststart',
    outPath,
  ], { stdio: ['pipe', 'pipe', 'pipe'] });

  let ffmpegErr = '';
  ffmpeg.stderr.on('data', (d) => { ffmpegErr += d.toString(); });

  // Render frames
  for (let frame = 0; frame < totalFrames; frame++) {
    const t = frame / FPS;
    const scrollX = (t * scrollSpeed) % stripW;
    const timeMs = t * 1000;

    const frameBuf = await renderFrame(tiles, stripW, scrollX, timeMs);
    const canWrite = ffmpeg.stdin.write(frameBuf);

    // Back-pressure: wait if ffmpeg can't keep up
    if (!canWrite) {
      await new Promise((resolve) => ffmpeg.stdin.once('drain', resolve));
    }

    if (frame % FPS === 0 || frame === totalFrames - 1) {
      process.stderr.write(`  Frame ${frame + 1}/${totalFrames} (${((frame + 1) / totalFrames * 100).toFixed(0)}%)\r`);
    }
  }

  ffmpeg.stdin.end();
  process.stderr.write('\n');

  const code = await new Promise((resolve) => ffmpeg.on('close', resolve));
  if (code !== 0) {
    console.error(`  ffmpeg error (code ${code}):`);
    console.error(ffmpegErr.split('\n').slice(-5).join('\n'));
    return;
  }

  console.log(`  Written: ${outPath}`);
}

mkdirSync(OUT_DIR, { recursive: true });

const tags = tagFilter
  ? VIDEO_TAGS.filter((t) => t.tag === tagFilter)
  : VIDEO_TAGS;

for (const entry of tags) {
  await generateVideo(entry);
}

console.log('\nDone.');
