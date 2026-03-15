# gen-collages

Generate OG image collages and scrolling video previews for GIF tag pages.

## What this does

1. **Collage builder** (`/dev/collages`) — visual dev tool for designing
   collages. Browse all GIFs by tag, click to add to rows, scrub frames with
   ImageDecoder, preview brick layout, nudge rows, use focus mode with sliding
   crop box, then capture (clipboard or download) the final 1200×630 JPEG.

2. **gen-videos** — builds seamlessly-looping horizontal-scroll MP4s from
   the animated GIFs and writes them to `public/og-videos/`.

## Collage workflow

1. Start the dev server and open `https://localhost:5173/dev/collages`
2. Filter by tag, click GIFs to add to rows, scrub frames with « ◀ ▶ »
3. Use ← ↑ ↓ → to reorder tiles, row nudge arrows to shift whole rows
4. Enter focus mode, slide the crop box to frame the shot
5. Copy image (clipboard) or Download (JPEG)
6. Save the JPEG to `public/og-collages/<slug>.jpg`

## Video workflow

1. Update `VIDEO_TAGS` in `scripts/generate-og-videos.mjs` with the GIF slugs
2. Run: `npm run gen-videos` (or `npm run gen-videos -- --tag "Game Changer"`)
3. Review: `start public/og-videos/<slug>.mp4`

## Adding a new tag

1. Add the entry to `VIDEO_TAGS` in `scripts/generate-og-videos.mjs` (slug, rows)
2. Add `{ tag, slug }` to `COLLAGE_TAGS` in `scripts/inject-og-tags.mjs`
3. Build the collage in the dev page, save to `public/og-collages/`
4. Run `npm run gen-videos -- --tag "New Tag"`
5. Run `npm run build` to regenerate OG HTML with image + video meta tags
