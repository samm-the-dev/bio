---
title: Shipping Search, Filtering, and a Bunch of Small Fixes
slug: shipping-search-and-small-fixes
excerpt: "A productive Tuesday: search and tag filtering across the site, a redesigned shows page, and a handful of cleanup PRs."
publishedAt: 2026-03-12T00:00:00-05:00
tags:
  - meta
  - code
  - personal-site
authors:
  - sam
  - claude
relatedProjects:
  - bio
---

I merged a bunch of PRs into this site yesterday, which felt good — one big feature drop and a few smaller cleanup items. Here's a quick rundown of what shipped.

## Search and tag filtering

The biggest chunk of work was adding search and tag filtering to the Projects and Blog pages. Each page now has a text search input and a set of tag filter pills. On projects, you can filter by tech tags; on the blog, by topic. The tag filter is responsive — it shows more tags as the screen gets wider, with a "More" button to expand the rest on smaller screens.

It's the kind of thing that's pretty invisible until you actually need it, but I've already found myself using it while poking around the site. The Projects page in particular was getting long enough that it was worth having a way to narrow things down.

## Shows page improvements

The shows page got a solid overhaul as part of the same PR. Show cards now display a relative time badge ("3 days away", etc.) next to the title, and timezone abbreviations (CST/CDT) show up next to the time. The link ordering was also cleaned up — calendar link first, then map and venue, then website — which makes more sense as a natural flow for someone actually trying to attend a show.

I also wired up the `/shows` page Open Graph description to show the next upcoming show, so when someone shares the link, they get something useful instead of a generic placeholder. To keep that fresh without anyone having to do anything, I added a daily GitHub Actions rebuild that runs at midnight CT. Slightly overkill, but it means the OG tags are never more than a day stale.

## The smaller stuff

The other three PRs were quick cleanup:

- **URL fix**: The Ohm app link was pointing to the wrong URL — it's now correctly pointing to `apps.samm-the.dev/ohm` after I set up the subdomain.
- **Content refresh**: A few project descriptions were out of date. Ohm's description still had "big refactor planned" language that I've been carrying around for a while; I softened it to reflect where things actually are. Build-a-Jam's description was missing a bunch of features that already exist (saved sessions, history, favoriting). Small things, but they were bugging me.
- **AI disclaimer tweak**: I updated the "about this site" section to be clearer about what I mean when I say Claude helps with prose. The previous wording implied I wrote basically everything myself, which is mostly true for the site copy — but blog posts are a different story, as you can see from the `authors` field on this one.

## Reflections

There's something satisfying about a day where you just ship a bunch of stuff. Some of it had been sitting in draft branches for a while, and getting it all merged out felt like clearing a mental backlog as much as a code backlog. The search and filtering work in particular had a longer review cycle because I wanted the responsive tag behavior to actually feel right at different sizes — those CSS visibility tricks took a few iterations.

Next up is probably the DNS setup for `samm.bio`, which has been on the to-do list since this site launched. One of those annoying tasks that's blocked on me sitting down and actually doing it.
