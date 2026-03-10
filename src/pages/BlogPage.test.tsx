import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithRouter } from '@/test/utils';
import { BlogPage } from './BlogPage';

vi.mock('@/data/posts', () => ({
  posts: [
    {
      title: 'Test Post',
      slug: 'test-post',
      excerpt: 'A test excerpt.',
      publishedAt: '2026-01-15T12:00:00.000Z',
      body: '<p>Hello</p>',
      tags: ['meta'],
      relatedProjects: [],
    },
  ],
}));

vi.mock('@/hooks/useBlueskyFeed', () => ({
  useBlueskyFeed: () => ({
    posts: [
      {
        uri: 'at://did:plc:123/app.bsky.feed.post/abc',
        text: 'Hello from Bluesky',
        publishedAt: '2026-01-14T12:00:00.000Z',
        url: 'https://bsky.app/profile/test/post/abc',
        likeCount: 2,
        repostCount: 0,
        replyCount: 0,
        hasImages: false,
        images: [] as { thumb: string; fullsize: string; alt: string }[],
        quotedPost: null,
        external: null,
        video: null,
        replyParentUri: null,
        threadReplies: [],
      },
    ],
    loading: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useLetterboxdFeed', () => ({
  useLetterboxdFeed: () => ({
    entries: [
      {
        title: 'Test Film Review',
        link: 'https://letterboxd.com/test/film/test-film/',
        publishedAt: '2026-01-13T12:00:00.000Z',
        filmTitle: 'Test Film',
        filmYear: '2025',
        rating: '4.0',
        isRewatch: false,
        isLiked: false,
        posterUrl: null,
        reviewHtml: null,
      },
    ],
    loading: false,
    error: null,
  }),
}));

describe('BlogPage', () => {
  it('renders the Blog heading', () => {
    renderWithRouter(<BlogPage />, { route: '/blog' });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Blog');
  });

  it('renders post cards on Blog tab', () => {
    renderWithRouter(<BlogPage />, { route: '/blog' });
    expect(screen.getByRole('link', { name: /Test Post/ })).toBeInTheDocument();
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });

  it('renders post date with dateTime attribute', () => {
    renderWithRouter(<BlogPage />, { route: '/blog' });
    const time = document.querySelector('time[dateTime]');
    expect(time).toHaveAttribute('dateTime', '2026-01-15T12:00:00.000Z');
  });

  it('renders tags', () => {
    renderWithRouter(<BlogPage />, { route: '/blog' });
    expect(screen.getAllByText('meta').length).toBeGreaterThanOrEqual(1);
  });

  it('renders all four tab buttons', () => {
    renderWithRouter(<BlogPage />, { route: '/blog' });
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Blog' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bluesky' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Letterboxd' })).toBeInTheDocument();
  });

  it('marks active tab with aria-pressed', () => {
    renderWithRouter(<BlogPage />, { route: '/blog' });
    expect(screen.getByRole('button', { name: 'Blog' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Bluesky' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('shows only blog posts on Blog tab by default', () => {
    renderWithRouter(<BlogPage />, { route: '/blog' });
    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.queryByText('Hello from Bluesky')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Film')).not.toBeInTheDocument();
  });

  it('shows Bluesky posts at /blog/bluesky', () => {
    renderWithRouter(<BlogPage />, { route: '/blog/bluesky' });
    expect(screen.getByRole('button', { name: 'Bluesky' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Hello from Bluesky')).toBeInTheDocument();
    expect(screen.queryByText('Test Post')).not.toBeInTheDocument();
  });

  it('shows Letterboxd entries at /blog/letterboxd', () => {
    renderWithRouter(<BlogPage />, { route: '/blog/letterboxd' });
    expect(screen.getByRole('button', { name: 'Letterboxd' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('Test Film')).toBeInTheDocument();
    expect(screen.queryByText('Test Post')).not.toBeInTheDocument();
  });

  it('shows all items sorted by date at /blog/all', () => {
    renderWithRouter(<BlogPage />, { route: '/blog/all' });
    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('Hello from Bluesky')).toBeInTheDocument();
    expect(screen.getByText('Test Film')).toBeInTheDocument();

    // Verify chronological order (newest first)
    const times = document.querySelectorAll('time[dateTime]');
    const dates = Array.from(times).map((t) =>
      new Date(t.getAttribute('dateTime') ?? '').getTime(),
    );
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i]!).toBeLessThanOrEqual(dates[i - 1]!);
    }
  });

  it('sets document title per tab route', () => {
    renderWithRouter(<BlogPage />, { route: '/blog' });
    expect(document.title).toBe('Blog - Sam Marsh');

    renderWithRouter(<BlogPage />, { route: '/blog/bluesky' });
    expect(document.title).toBe('Bluesky - Sam Marsh');

    renderWithRouter(<BlogPage />, { route: '/blog/letterboxd' });
    expect(document.title).toBe('Letterboxd - Sam Marsh');

    renderWithRouter(<BlogPage />, { route: '/blog/all' });
    expect(document.title).toBe('All Posts - Sam Marsh');
  });

  it('navigates between tabs via click', () => {
    renderWithRouter(<BlogPage />, { route: '/blog' });
    expect(screen.getByText('Test Post')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Bluesky' }));
    expect(screen.getByText('Hello from Bluesky')).toBeInTheDocument();
    expect(screen.queryByText('Test Post')).not.toBeInTheDocument();
  });

  it('filters blog posts by search query', () => {
    renderWithRouter(<BlogPage />, { route: '/blog' });
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    expect(screen.queryByText('Test Post')).not.toBeInTheDocument();
    expect(screen.getByText('No posts match your search.')).toBeInTheDocument();
  });

  it('filters blog posts by tag', () => {
    renderWithRouter(<BlogPage />, { route: '/blog' });
    fireEvent.click(screen.getByRole('button', { name: 'meta' }));
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });

  it('shows empty message when search and tag yield no results', () => {
    renderWithRouter(<BlogPage />, { route: '/blog' });
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'zzz' } });
    expect(screen.getByText('No posts match your search.')).toBeInTheDocument();
  });
});
