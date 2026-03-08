# Site Structure

## Navigation

Five pages with light navigation:

### Home

- Hero section with tagline and brief introduction
- Social profile links
- Section previews for Projects, About, Blog, and Shows

### About

- Expanded biography covering improv, movies, TTRPGs, and code

### Projects

- Code projects and tabletop games, organized by category
- See `content/projects.yaml` for the full list

### Blog

- Markdown posts with syntax highlighting (Shiki, dark-plus theme)
- RSS feed (`/feed.xml`) and cross-posting to Bluesky

### Shows

- Upcoming improv shows with calendar and map links

## Technical Approach

- React 19 + TypeScript + Vite + Tailwind CSS
- React Router for multi-page navigation
- Content in `content/` as YAML + markdown, compiled at build time
- GitHub Pages deployment via Actions workflow
- Dark mode default with light mode support
