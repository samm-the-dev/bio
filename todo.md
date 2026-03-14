# Todo

- [x] Review planning docs: site structure, content plan, decisions, asset inventory
- [x] Make blocking decisions (tech stack, visual identity, deploy target, V1 scope)
- [x] Scaffold from toolbox template
- [x] Commit initial scaffold
- [ ] Set up samm.bio DNS (Porkbun A records → GitHub Pages IPs, CNAME www)
- [ ] Configure GitHub Pages custom domain + HTTPS
- [x] Vercel cleanup: remove production domains, clear deploy history, remove repo link (see [vercel-cleanup.md](../vercel-cleanup.md))
- [x] Reduce redundancy in Bluesky cross-post format (title/excerpt duplicated in text body and link card)
- [x] Fix crosspost tracking push (needs fine-grained PAT to bypass branch protection)

## Blog & Cross-Posting

- [x] Test cross-posting with a real blog post
- [ ] Add LinkedIn cross-posting integration
- [ ] Share-to-Bluesky button on blog post pages
- [x] Tag/category filtering on blog list
- [ ] Blog card image generator (for social previews)
- [x] Add pre-commit hook to update `publishedAt` in blog posts to current timestamp

## Domain Architecture

- [ ] Review [domain-architecture-addendum.md](../domain-architecture-addendum.md) (samm.bio as hub, /dev route, samm-the.dev redirect, apps subdomain)

## Toolbox Migrations

- [ ] Migrate `src/lib/share.ts` to use `.toolbox/lib/share.ts` (wrap with sonner toasts)

## Quality

- [ ] Add axe-core accessibility audit to CI (catch WCAG issues before review)

## Content

- [ ] Re-check project tech tags (now surfaced in tag filter — worth auditing for accuracy/consistency)

## Future Features

- [x] GIF section (curated favorites, Klipy integration, or skip — TBD)
- [ ] Generate better GIF alt text (currently just filenames)
- [ ] Improve GIF tagging with AI assistance (batch-suggest tags from visual content)
- [ ] Smarter GIF loading to prevent stuttering (pause off-screen GIFs, consider video format)
- [ ] Stats page (Letterboxd, GitHub, "terminally online" meter)
- [ ] Analytics (Plausible/Fathom vs. none — TBD)
