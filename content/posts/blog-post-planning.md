# Blog Post Planning (April 2026)

Last published post: **Making Reaction GIFs with Claude** (March 16)

---

## 1. GIF Video Optimization (follow-up to Clip Forge post)

**Angle:** The Clip Forge post covered *making* the GIFs. This one covers what
happened when you had 289 of them on a page — and the infrastructure work to
make that not terrible.

**Key beats:**

- The problem: 3.5GB of GIFs on one page. Not great.
- Multi-format conversion pipeline (sync-gifs → FFmpeg → MP4/WebP/GIF)
- Replacing `<img>` with lazy-loaded `<video>` — 55x bandwidth reduction
- Shared IntersectionObserver for play/pause and batched infinite scroll
- prefers-reduced-motion support (first-frame only)
- Orphan cleanup and mtime-based reconversion in the sync script
- Download buttons per format in the GIF dialog
- The a11y tangent: scrollable-region-focusable, eslint vs axe-core conflict

**Tone:** Technical but grounded in "I had too many GIFs and needed to fix it."

**Tags:** code, video, performance, accessibility

**Related projects:** bio, clip-forge

---

## 2. Movie Releases Bot

**Angle:** Building a Bluesky bot that posts weekly movie release info — why,
how, and what you learned about the AT Protocol ecosystem.

**Key beats:**

- Motivation: Why a movie release bot? What gap does it fill?
- Architecture: TMDB API → data processing → Bluesky posting via @atproto/api
- Weekly schedule: theatrical (Thu), digital (Tue), trailers (Wed), streaming (Mon)
- Image handling: poster collages/albums depending on movie count
- State management to prevent duplicate posts
- GitHub Actions as the scheduler
- Lessons from the AT Protocol / Bluesky API

**Tone:** Show-and-tell. "Here's a fun thing I built" energy.

**Tags:** code, bluesky, bots, movies

**Related projects:** movie-releases-bot

---

## 3. Anonymix (draft — decide later how public to go)

**Angle:** A social music game for friends — anonymous themed mixtapes with a
reveal mechanic. Focus on the *game design* and social dynamics, not just the
tech.

**Key beats:**

- The concept: themed rounds, anonymous submissions, group listening, reveal
- Why Deezer? (API availability, music search integration)
- Supabase as the backend — real-time features, auth
- The social/game design side: how the anonymity and reveal create fun tension
- PWA for mobile-first experience
- Playing it with friends — what worked, what surprised you

**Tone:** More personal/game-design than technical. Could hold the technical
blockquote lighter than usual.

**Tags:** code, music, game-design, friends

**Related projects:** anonymix

**Status:** Draft only — revisit when ready to share publicly.

---

## 4. Ohm: Building a Kanban for My Brain

**Angle:** A dedicated deep-dive on Ohm — the motivation (ADHD management),
the electrical metaphor, the redesign arc, and where it's at today. Covers
ground the "Two Weeks of Shipping" post only touched briefly.

**Key beats:**

- Why existing kanban tools don't work for ADHD (too much, too open-ended)
- The electrical metaphor: Powered/Live/Charging/Grounded
- Core design decisions: WIP limits, energy tags, today-focused board
- The gap: stopped using it for a while — what broke down and why
- The redesign: what changed and what motivated it
- Google Drive sync and PWA — using it as a real daily tool
- Where it's headed (ecosystem of task apps?)
- Honest reflection: building productivity tools vs. actually being productive

**Tone:** Personal + technical. The ADHD context is as important as the code.
Ties to the unpublished "ADHD is Frustrating" draft thematically.

**Tags:** code, adhd, productivity, design

**Related projects:** ohm

---

## 5. March in Review (summary/roundup post)

**Angle:** A month-end roundup linking all the March blog posts and
summarizing what shipped across all projects. Similar to "Two Weeks of
Shipping" but broader — a retrospective on the full month.

**Key beats:**

- Link and briefly summarize each March post:
  - Hello World (Mar 7)
  - Automated Accessibility Auditing (Mar 9)
  - Two Weeks of Shipping (Mar 12)
  - Does AI Really Use That Much Energy? (Mar 13)
  - Making Reaction GIFs with Claude (Mar 16)
- What else shipped in late March that didn't get a post (GIF infrastructure, etc.)
- Themes: AI-assisted development, ADHD & productivity, putting myself out there
- What's coming in April

**Tone:** Reflective, casual. A "here's the month in review" wrap-up.

**Tags:** meta, personal

**Related projects:** bio

---

## Suggested order / priority

1. **March in Review** — quick to write, ties a bow on the month
2. **GIF Video Optimization** — freshest work, natural Clip Forge sequel
3. **Ohm** — motivated by today's redesign energy
4. **Movie Releases Bot** — fun standalone post, no urgency
5. **Anonymix** — draft when ready, publish when comfortable
