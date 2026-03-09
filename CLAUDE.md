# Personal Site

@todo.md

@.toolbox/ai-context/CLAUDE.md

## Project-Specific Context

Personal portfolio and about-me site. Minimal, clean aesthetic. Dark mode
default with light mode support.

### Pages

Five pages: Home (hero + social links + section previews), About (bio covering
improv, movies, game design, development), Projects (code + games), Blog
(tabbed feed: blog posts, Bluesky, Letterboxd, All), Shows (upcoming improv
shows with calendar + map links).

### Content Principle

All content in `content/` is hand-authored — AI assists with design/build
only, and may help summarize or draft blog posts.

### Content Voice

- Conversational and authentic — avoid excessive formality, let personality show
- Be specific over generic — no marketing speak or inflated claims
- Technical descriptions: clear but not jargon-heavy, explain the "why" not just the "what"
- Honest about current status and goals, comfortable with work-in-progress

### Key Directories

| Directory         | Contents                                                          |
| ----------------- | ----------------------------------------------------------------- |
| `content/`        | Hand-authored YAML (settings, projects, shows) + markdown (posts) |
| `src/pages/`      | Route-level page components (Home, About, Projects, Blog, Shows)  |
| `src/components/` | Shared UI components                                              |

### Social Profiles

- Bluesky: samm-the-human.online
- Letterboxd: samm_loves_film
- Instagram: samm.the.human
- GitHub: samm-the-dev
