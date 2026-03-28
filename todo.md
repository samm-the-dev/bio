# Todo

- [ ] Add LinkedIn cross-posting integration
- [ ] Share-to-Bluesky button on blog post pages
- [ ] Blog card image generator (for social previews)

## Domain Architecture

- [ ] Review [domain-architecture-addendum.md](../domain-architecture-addendum.md) (samm.bio as hub, /dev route, samm-the.dev redirect, apps subdomain)

## Toolbox Migrations

- [ ] Migrate `src/lib/share.ts` to use `.toolbox/lib/share.ts` (wrap with sonner toasts)
- [ ] Update .toolbox submodule to 2a1bf9d (TW v4, stricter tsconfig, mkcert, test stubs)

## Quality

- [ ] Add axe-core accessibility audit to CI (catch WCAG issues before review)

## Content

- [ ] Re-check project tech tags (now surfaced in tag filter — worth auditing for accuracy/consistency)

## Future Features

- [ ] Generate better GIF alt text (currently just filenames)
- [ ] Improve GIF tagging with AI assistance (batch-suggest tags from visual content)
- [ ] Smarter GIF loading to prevent stuttering (pause off-screen GIFs, consider video format)
- [ ] Stats page (Letterboxd, GitHub, "terminally online" meter)
- [ ] Analytics (Plausible/Fathom vs. none — TBD)
