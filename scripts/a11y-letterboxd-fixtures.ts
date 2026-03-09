// Letterboxd fixture data for a11y audit — deterministic entries covering all card variants.
//
// Variants covered:
//   - Rated + liked + rewatch + poster (standard)
//   - Half-star rating
//   - No rating, liked only
//   - No poster
//   - With review HTML (short)
//   - With review HTML (long, triggers truncation)
//   - With spoiler review
//   - No year, no rating, no liked, no rewatch (minimal)
import type { LetterboxdEntry } from '@/lib/queries';

export const letterboxdEntries: LetterboxdEntry[] = [
  {
    title: 'Hoppers, 2026 - ★★★★',
    link: 'https://letterboxd.com/samm_loves_film/film/hoppers/',
    publishedAt: '2026-03-07T04:48:48.000Z',
    filmTitle: 'Hoppers',
    filmYear: '2026',
    rating: '4.0',
    isRewatch: false,
    isLiked: true,
    posterUrl: 'https://placehold.co/150x225/1a1a2e/e0e0e0?text=Hoppers',
    reviewHtml: null,
  },
  {
    title: 'Perfect Days, 2023 - ★★★★½',
    link: 'https://letterboxd.com/samm_loves_film/film/perfect-days-2023/',
    publishedAt: '2026-02-27T03:44:03.000Z',
    filmTitle: 'Perfect Days',
    filmYear: '2023',
    rating: '4.5',
    isRewatch: true,
    isLiked: true,
    posterUrl: 'https://placehold.co/150x225/1a1a2e/e0e0e0?text=Perfect+Days',
    reviewHtml: null,
  },
  {
    title: 'Double Team, 1997',
    link: 'https://letterboxd.com/samm_loves_film/film/double-team/',
    publishedAt: '2026-02-24T02:55:31.000Z',
    filmTitle: 'Double Team',
    filmYear: '1997',
    rating: null,
    isRewatch: false,
    isLiked: true,
    posterUrl: 'https://placehold.co/150x225/1a1a2e/e0e0e0?text=Double+Team',
    reviewHtml: null,
  },
  {
    title: 'Mystery Film',
    link: 'https://letterboxd.com/samm_loves_film/film/mystery/',
    publishedAt: '2026-02-20T12:00:00.000Z',
    filmTitle: 'Mystery Film',
    filmYear: null,
    rating: null,
    isRewatch: false,
    isLiked: false,
    posterUrl: null,
    reviewHtml: null,
  },
  {
    title: 'Space Truckers, 1996 - ★★★★½',
    link: 'https://letterboxd.com/samm_loves_film/film/space-truckers/',
    publishedAt: '2026-02-03T03:08:35.000Z',
    filmTitle: 'Space Truckers',
    filmYear: '1996',
    rating: '4.5',
    isRewatch: true,
    isLiked: true,
    posterUrl: 'https://placehold.co/150x225/1a1a2e/e0e0e0?text=Space+Truckers',
    reviewHtml: '<p>Caught this at a theater with a packed crowd. GREAT time at the movies.</p>',
  },
  {
    title: 'Long Review Film, 2025 - ★★★',
    link: 'https://letterboxd.com/samm_loves_film/film/long-review/',
    publishedAt: '2026-01-15T20:00:00.000Z',
    filmTitle: 'Long Review Film',
    filmYear: '2025',
    rating: '3.0',
    isRewatch: false,
    isLiked: false,
    posterUrl: 'https://placehold.co/150x225/1a1a2e/e0e0e0?text=Long+Review',
    reviewHtml:
      '<p>First paragraph of a long review that goes on for a while.</p><p>Second paragraph continues the thought with more detail.</p><p>Third paragraph wraps up.</p><p>Fourth paragraph should be truncated in the card preview.</p>',
  },
  {
    title: 'Spoiler Film, 2025 - ★★★★',
    link: 'https://letterboxd.com/samm_loves_film/film/spoiler/',
    publishedAt: '2026-01-10T18:00:00.000Z',
    filmTitle: 'Spoiler Film',
    filmYear: '2025',
    rating: '4.0',
    isRewatch: false,
    isLiked: true,
    posterUrl: 'https://placehold.co/150x225/1a1a2e/e0e0e0?text=Spoiler',
    reviewHtml:
      '<p><em>This review may contain spoilers.</em></p><p>The ending was incredible — the twist where the main character was actually a ghost the whole time completely recontextualizes every scene.</p>',
  },
];
