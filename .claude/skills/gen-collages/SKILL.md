# gen-collages

Generate OG image collages and scrolling video previews for GIF tag pages.

## What this does

1. **Collage builder** (`/dev/collages`) — visual dev tool for selecting GIFs,
   scrubbing frames, arranging rows, and previewing the brick layout. Exports
   config JSON with rows + frameOverrides.

2. **gen-collages** — builds 1200×630 brick-layout collage JPEGs from the
   config and writes them to `public/og-collages/`.

3. **gen-videos** — builds seamlessly-looping horizontal-scroll MP4s from
   the animated GIFs and writes them to `public/og-videos/`.

## Workflow

1. Open the collage builder at `https://localhost:5173/dev/collages`
2. Filter by tag, click GIFs to add to rows, scrub frames with ◀▶
3. Use focus mode + sliding crop box to preview the final output
4. Copy config → paste into `COLLAGE_TAGS` in the scripts

5. Generate collages and videos:

   ```
   npm run gen-collages
   npm run gen-videos
   ```

   Or for one tag: `npm run gen-videos -- --tag "Game Changer"`

6. Review outputs:

   ```
   start public/og-collages/<slug>.jpg
   start public/og-videos/<slug>.mp4
   ```

7. Run `npm run build` to regenerate OG HTML with image + video meta tags.

## Adding a new tag

Add the entry to `COLLAGE_TAGS` / `VIDEO_TAGS` in:

- `scripts/generate-gif-collages.mjs` (slug, rows)
- `scripts/generate-og-videos.mjs` (slug, rows)
- `scripts/inject-og-tags.mjs` (tag + slug only)

## Row layout guidelines

Tiles render at exact natural aspect ratio — no distortion. A warning prints
if a row fills less than 85% of 1200px. Mix aspect ratios to fill width:

- 2 squares + 2 landscape ≈ 1168px ✓
- 3 landscape ≈ 1122px ✓
- 3 squares = 630px ✗ — add more tiles or mix in landscape
