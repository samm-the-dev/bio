# Site Structure

## Navigation

Five pages with light navigation:

### Home

- Hero section with tagline and brief introduction
- Social profile links (Letterboxd, Bluesky, Instagram, GitHub, Discord, LinkedIn)
- Section previews for Projects, About, Blog, and Shows

### About

Expanded biography covering:

- Improv (ACT, Stomping Ground, Goofs & Goblins, Out of Bounds festival)
- Movies (Alamo Drafthouse Season Pass, 60+ new releases in 2025, Letterboxd logging)
- TTRPGs (D&D 5e, Pathfinder 2e, PbtA systems, upcoming TTRPG projects)
- Code (boot camp origin, Angular to React, Claude AI-assisted development)

### Projects

Organized by category:

**Code Projects**

- Ohm — personal kanban app with Google Drive integration
- Build-a-Jam — improv warm-up/exercise selector
- The Enchiridion — Adventure Time episode catalog
- Adventure Time Transcripts — speaker diarization pipeline
- Toolbox — shared templates and AI-assisted dev tools

**Tabletop Games** (planned)

- SMARS (simplified Pathfinder 2e derivative under ORC License)
- Wizard Battle (arena combat with elemental magic system)

### Blog

- Markdown posts with syntax highlighting (Shiki, dark-plus theme)
- Post list page titled "ADHDev"
- Individual post pages with OG meta tags
- RSS feed (`/feed.xml`)
- Cross-posting to Bluesky

### Shows

- Upcoming improv shows
- Calendar and map links for each show

## Technical Approach

- React 19 + TypeScript + Vite + Tailwind CSS
- React Router for multi-page navigation
- Content in `content/` as YAML + markdown, compiled at build time
- GitHub Pages deployment via Actions workflow
- Dark mode default with light mode support
