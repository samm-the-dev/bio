# Open Questions

Issues to resolve before or during implementation.

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
- Best of both worlds
- **Pros:** Personal curation + full collection access
- **Cons:** Requires maintaining both

**Option 4: Skip for V1**
- Focus on other sections first
- Add GIF showcase in future version
- **Pros:** Reduces scope, can implement later with more research
- **Cons:** Delays a potentially fun section

### Decision Needed
- Which option to pursue?
- Where does this fit in site structure? (Stats page? Its own section? Part of About?)
- Priority level for v1?

## Stats Page Technical Details

### Letterboxd Integration
- **Question:** What's the best way to embed Letterboxd content?
- **Options:**
  - RSS feed parsing
  - Manual stats updates
  - Third-party embeds
  - Scraping (if necessary and ethical)
- **Research needed:** Letterboxd API or embed options

### GitHub Integration
- **Question:** Which GitHub metrics to display?
- **Options:**
  - Contribution graph (straightforward via GitHub's API)
  - Language breakdown
  - Repository highlights
  - Recent activity
- **Decision needed:** Scope and presentation approach

### "Terminally Online" Meter
- **Question:** Is this worth the technical complexity?
- **Bluesky:** API appears accessible for post counts
- **Discord:** 
  - Discord doesn't have public user stats API
  - Could use "Request Data" export (manual, one-time)
  - Could track going forward with bot access (if in servers)
  - May not be feasible for real-time metrics
- **Decision needed:** 
  - Build this feature at all?
  - Bluesky-only if Discord is too complex?
  - Manual update vs. automated?

## Design & Styling

### Visual Identity
- **Question:** What's the overall aesthetic?
- **Considerations:**
  - Clean and minimal vs. playful and expressive
  - Color scheme
  - Typography choices
  - Balance of personality and professionalism

### Component Library
- **Question:** Build custom components or use a library?
- **Options:**
  - Custom CSS/styled-components
  - Tailwind
  - Material-UI or similar
  - Minimal framework
- **Decision needed:** Based on template and time investment

## Deployment & Domain

### GitHub Pages Configuration
- **Question:** Custom domain or github.io?
- **Question:** Deployment workflow automation?

### Repository Setup
- **Question:** Public or private repository?
- **Consideration:** Public aligns with open source spirit, but verify comfort level

## Future Features Priority

### Blog Implementation
- **Question:** What blogging solution when ready?
- **Options:**
  - Static markdown files
  - Headless CMS
  - Simple JSON/data files
  - Third-party embed
- **Decision:** Can wait until blog is actually needed

### Analytics
- **Question:** Track visitors/engagement?
- **Options:**
  - Google Analytics
  - Privacy-focused alternatives (Plausible, Fathom)
  - No analytics
- **Decision needed:** Privacy vs. curiosity about traffic

## Content Priorities

### What Makes V1?
- **Question:** Minimum viable content for launch?
- **Must-haves:**
  - Home page
  - Projects (at least code and games)
  - About
- **Nice-to-haves:**
  - Now page
  - Stats page
  - Full project catalog
- **Decision needed:** Scope for initial launch vs. iterative additions

---

## How to Use This Document
As decisions are made, move them to a DECISIONS.md file with rationale. Keep this document updated with new questions that emerge during development.
