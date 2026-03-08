# samm.bio

Personal portfolio and about-me site for Sam Marsh — improv, movies, TTRPGs, and code.

Built with React, TypeScript, Tailwind CSS, and Vite. Dark mode default with light mode support.

## Pages

- **Home** — hero + social links + section previews
- **About** — bio covering improv, movies, game design, and development
- **Projects** — code + games
- **Blog** — markdown posts with syntax highlighting
- **Shows** — upcoming improv shows with calendar + map links

## Development

```bash
npm install
npm run dev
```

### Other scripts

| Script | Description |
| --- | --- |
| `npm run build` | Production build (fetches content, type-checks, bundles, injects OG tags) |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting |
| `npm run new-post` | Scaffold a new blog post |
| `npm run audit:a11y` | Run accessibility audit |

## Project structure

| Directory | Contents |
| --- | --- |
| `content/` | Hand-authored YAML (settings, projects, shows) + markdown (posts) |
| `src/pages/` | Route-level page components |
| `src/components/` | Shared UI components |
| `scripts/` | Build and content scripts |
| `docs/` | Planning docs (structure, content plan, decisions, assets) |
