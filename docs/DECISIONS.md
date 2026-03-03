# Decisions Log

Track resolved questions and rationale. Move items here from OPEN_QUESTIONS.md as they're decided.

## Format
```
### [Decision Topic]
**Date:** YYYY-MM-DD
**Decision:** What was decided
**Rationale:** Why this choice was made
**Alternatives Considered:** What else was on the table
```

---

## Site Structure

### Multi-Page Architecture
**Date:** 2026-02-08
**Decision:** Use multi-page structure with light navigation
**Rationale:** Content breadth (code projects, games, stats, about, now, future blog) warrants separate pages rather than single-page scroll. Provides better organization and allows sections to grow independently.
**Alternatives Considered:** 
- Single-page scrolling site with hash navigation
- Hybrid approach with some sections as modals/overlays

---

## Content Approach

### Hand-Authored Content Principle
**Date:** 2026-02-08
**Decision:** All body text and non-structural content must be personally written
**Rationale:** Maintains authenticity and personal voice. Makes the site genuinely reflective of personality and interests rather than generic AI-generated content. AI assistance acceptable for design/build but not for actual content.
**Alternatives Considered:** N/A - this is a guiding principle, not a choice among options

### AI Assistance Transparency
**Date:** 2026-02-08
**Decision:** Note that design/build is AI-assisted but content is hand-authored
**Rationale:** Honesty about process while maintaining content authenticity. Acknowledges reality of modern development workflows.
**Alternatives Considered:**
- Not mentioning AI involvement at all
- Being vague about AI role

---

## Tech Stack & Design

### Planet-Smars Template Stack
**Date:** 2026-03-02
**Decision:** React 19 + Vite + Tailwind + React Router, scaffolded from toolbox template
**Rationale:** Consistent with all other projects. No reason to deviate for a personal site.
**Alternatives Considered:** None seriously — standardization wins here.

### Minimal Visual Identity
**Date:** 2026-03-02
**Decision:** Clean/minimal aesthetic. Dark mode default with light mode support via toolbox useTheme.
**Rationale:** Matches developer personality, lets content speak, easy to maintain. Avoids overdesign.
**Alternatives Considered:** Playful/expressive — decided against as it requires more design investment and maintenance.

### GitHub Pages Deployment
**Date:** 2026-03-02
**Decision:** GitHub Pages via Actions workflow. Public repo. Custom domain deferred.
**Rationale:** Same deployment pattern as all other projects. Domain can be added anytime without code changes.

---

## V1 Scope

### V1 Pages: Home, Projects, About
**Date:** 2026-03-02
**Decision:** Ship Home, Projects, and About. Now page as stretch goal. Stats, Blog, GIF section deferred to v2+.
**Rationale:** Three pages are enough to launch. Stats integrations add API complexity, Blog needs a content system, GIF section has uncertain Klipy API access. None of these block a useful site.
**Alternatives Considered:** Including Stats page — deferred because Letterboxd integration approach is still open and not worth blocking launch.
