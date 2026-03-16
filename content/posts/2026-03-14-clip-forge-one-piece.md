---
title: 'Making Reaction GIFs with Claude'
slug: building-clip-forge
publishedAt: 2026-03-16T14:33:48-05:00
excerpt: 'Building an AI-assisted CLI pipeline to make movie/show reaction GIFs. Subtitle extraction, FFmpeg cutting, DaVinci Resolve via scripting API, and more.'
tags:
  - code
  - video
  - claude
authors:
  - sam
  - claude
relatedProjects:
  - clip-forge
---

I'm a big reaction GIF guy.
I used to have moments in online/text conversations where I'd want to react with a specific moment from a show,
but I'd either be unable to find a GIF of it or what I would find would be low quality.

Now I make my own, and I've automated about as much as I can in my workflow.

I started making GIFs a couple of years back with a much more manual process. I used a desktop app that would record frames from a window and had limited editing and subtitling capability.

That worked well enough for a bit, but I wanted to make it better. I eventually discovered [ezgif](https://ezgif.com/video-to-gif/), which works quite well, and started capturing video with [OBS](https://obsproject.com/) and editing with [DaVinci Resolve](https://www.blackmagicdesign.com/products/davinciresolve).

I continued to refine my process and developed some decent editing skills, including some nicer effects for moving subtitles and graphic overlays. I got to be pretty fast with this workflow, but I knew there was potential to make it even faster.

Now, with Claude, I can just take a screenshot of my rough notes in Google Keep and pipe that through to a DaVinci Resolve timeline where I still hand-edit the clips and set up subtitle styling.
It's not _perfect_, but it's even faster than before, and it's easy enough to revise the rough clip cuts with Claude. Once I'm done editing I have Claude run the export via DaVinci Resolve API and it produces an animated WebP file for each clip with subtitles burned in. I then sync the new files to this site.

Take a look at all the GIFs I've made [here](/projects/gifs).

> **The pipeline:** Google Keep note with rough timestamps → subtitle search → FFmpeg clip extraction → DaVinci Resolve import via scripting API → subtitle styling → individual WebP export.

> **Key technical wins:**
>
> - Cached subtitle extraction per episode (SRT + JSON) for fast cross-episode search
> - Fuzzy dialogue search to match rough clip notes to exact SRT timestamps
> - Auto-detection of English (non-SDH) subtitle tracks from MKV metadata
> - Letterbox cropping via `cropdetect`, stereo downmix for 5.1 sources
> - DaVinci Resolve project creation, timeline building, and per-clip WebP export via `fusionscript.dll` (Python 3.8 via `uv` — the DLL is compiled against 3.8 and won't load on anything newer)
> - Subtitle burn-in and infinite loop handled in Resolve's Deliver page, not in FFmpeg — cleaner output and easier to tweak per-clip
> - `sync-gifs` script copies finished WebPs to `public/gifs/`, generates `gifs.yaml` with dimensions and tags derived from folder structure, and syncs to GCS for CDN delivery

> **What didn't work (first version):**
>
> - FCP7 XML timeline generation — worked, but Resolve's "Individual Clips" export mode doesn't burn in subtitles, so I had to export as a single video and split with `blackdetect`. Replaced entirely by the scripting API.
> - `fusionscript.dll` segfaults on Python 3.13 — solved by running the Resolve scripts through `uv run --python 3.8`
