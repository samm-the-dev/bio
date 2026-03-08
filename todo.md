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

- [ ] Test cross-posting with a real blog post
- [ ] Add LinkedIn cross-posting integration
- [ ] Share-to-Bluesky button on blog post pages
- [ ] Tag/category filtering on blog list
- [ ] Blog card image generator (for social previews)

## Future Features

- [ ] Write tabletop game project descriptions (SMARS, Wizard Battle) for `content/projects.yaml`
- [ ] GIF section (curated favorites, Klipy integration, or skip — TBD)
- [ ] Stats page (Letterboxd, GitHub, "terminally online" meter)
- [ ] Analytics (Plausible/Fathom vs. none — TBD)
