# samm.bio — Blog + Cross-Posting Plan

Originally drafted as a Sanity CMS + cross-posting plan. Blog authoring moved
to local markdown files (authored in VS Code) after determining Sanity Studio's
form layout was inadequate for long-form writing. Sanity still powers site
settings and projects.

---

## Phase 1 — Foundation (DONE)

- [x] Create Sanity project + define schemas (`siteSettings`, `project`)
- [x] Set up Sanity Studio, deploy to sanity.studio
- [x] Migrate content.jsonc + project text files into Sanity
- [x] Install `@sanity/client` in bio repo (devDependency, build-time only)
- [x] Build-time content pipeline: `scripts/fetch-content.mjs` -> static TS modules
- [x] Sanity webhook -> `repository_dispatch` -> GitHub Pages auto-redeploy

## Phase 2 — Blog (IN PROGRESS)

- [x] Blog posts as local markdown files in `content/posts/`
- [x] Build pipeline: gray-matter + marked + Shiki (dark-plus theme) -> static HTML
- [x] `/blog` route with post list page (titled "ADHDev")
- [x] `/blog/:slug` route with individual post rendering
- [x] Prose typography matching VS Code markdown preview
- [x] Syntax highlighting with VS Code's dark-plus theme (zero client JS)
- [x] Home page blog card in Explore section
- [x] Scaffolding script: `npm run new-post "Title"`
- [x] Claude skill: `/publish-post` for metadata generation + timestamp
- [x] CI runs on blog post PRs (paths-ignore narrowed to `docs/**`)
- [x] RSS feed generation (`/feed.xml`)
- [x] Per-post OG meta tags for social previews
- [x] Blog post tests

## Phase 3 — Cross-Posting

### Platform Breakdown

#### Bluesky (best option for automation)

- Open AT Protocol API, well-documented
- Auth via app password (Settings -> Privacy -> App Passwords)
- Post format: text + link card with image preview
- Use `@atproto/api` npm package
- Effort: Low

#### LinkedIn (possible but more involved)

- Posts API (REST), requires OAuth 2.0 (3-legged)
- Scopes: `w_member_social`, `openid`, `email`
- Must manually set thumbnail/title/description (no auto-scrape via API)
- Tokens expire every 60 days, need refresh handling
- Effort: Medium

#### Facebook / Instagram

- Facebook: personal profile posting deprecated since 2018, would need a Page
- Instagram: image-only, would need blog card image generation
- Both: skip unless audience warrants it

### Architecture Options

**Option A — Serverless function (full automation)**

```
Publish blog post (git push)
  -> GitHub Pages deploy
  -> Serverless function (Vercel/Netlify)
       -> Fetch post data
       -> Post to Bluesky via @atproto/api
       -> Post to LinkedIn via Posts API
```

**Option B — Semi-automatic (lighter)**

- RSS feed auto-generates on build
- Pipedream/Zapier free tier watches RSS
- On new item -> auto-post to platforms
- No custom serverless code needed

### Environment Variables (when ready)

```
BLUESKY_HANDLE=samm-the-human.online
BLUESKY_APP_PASSWORD=xxx

LINKEDIN_CLIENT_ID=xxx
LINKEDIN_CLIENT_SECRET=xxx
LINKEDIN_ACCESS_TOKEN=xxx
LINKEDIN_AUTHOR_ID=xxx
```

### Tasks

- [ ] Set up Bluesky app password
- [ ] Build or configure cross-posting (serverless or Pipedream/Zapier)
- [ ] Test with a real blog post
- [ ] Add LinkedIn integration

## Phase 4 — Polish

- [ ] Share-to-Bluesky button on blog post pages
- [ ] Tag/category filtering on blog list
- [ ] Blog card image generator (for Instagram/social previews)
