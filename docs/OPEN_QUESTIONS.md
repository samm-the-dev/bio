# Open Questions

Issues to resolve during future development.

## GIF Section

### Context

Original collection started in Tenor (shares tracked there), but migrated to Klipy. Tenor API is now closed to new clients (as of January 2026), and Klipy API doesn't appear to support accessing personal collections.

### Options

**Option 1: Curated Favorites**

- Manually select 10-20 favorite GIFs
- Host or link to them directly
- Write personal commentary about why each one is meaningful/funny
- **Pros:** Fully controlled, personal, fits hand-authored content principle
- **Cons:** Manual curation required, limited to selected GIFs

**Option 2: Klipy API Integration**

- Reach out to Klipy support about personal collection access
- Build dynamic integration if possible
- Show most shared/most used GIFs
- **Pros:** Automated, comprehensive
- **Cons:** May not be possible, dependency on external API

**Option 3: Hybrid Approach**

- Curate favorites for display
- Include links to full Klipy profile (username: sammthehuman)
- **Pros:** Personal curation + full collection access
- **Cons:** Requires maintaining both

**Option 4: Skip entirely**

- Not every idea needs to ship
- **Pros:** Reduces scope
- **Cons:** Delays a potentially fun section

### Decision Needed

- Which option to pursue?
- Where does this fit in site structure? (Stats page? Its own section? Part of About?)

## Stats Page

### Letterboxd Integration

- **Question:** What's the best way to embed Letterboxd content?
- **Options:**
  - RSS feed parsing
  - Manual stats updates
  - Third-party embeds
  - Scraping (if necessary and ethical)

### GitHub Integration

- **Question:** Which GitHub metrics to display?
- **Options:**
  - Contribution graph (via GitHub API)
  - Language breakdown
  - Repository highlights
  - Recent activity

### "Terminally Online" Meter

- **Question:** Is this worth the technical complexity?
- Bluesky API appears accessible for post counts
- Discord doesn't have public user stats API — may not be feasible
- **Decision needed:** Build at all? Bluesky-only? Manual vs. automated?

## Future Features

### Analytics

- **Question:** Track visitors/engagement?
- **Options:**
  - Privacy-focused alternatives (Plausible, Fathom)
  - No analytics
- **Decision needed:** Privacy vs. curiosity about traffic
