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
    renderWithRouter(<BlogPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Blog');
  });

  it('renders post cards on Blog tab', () => {
    renderWithRouter(<BlogPage />);
    expect(screen.getByRole('link', { name: /Test Post/ })).toBeInTheDocument();
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });

  it('renders post date with dateTime attribute', () => {
    renderWithRouter(<BlogPage />);
    const time = screen.getByRole('time');
    expect(time).toHaveAttribute('dateTime', '2026-01-15T12:00:00.000Z');
  });

  it('renders tags', () => {
    renderWithRouter(<BlogPage />);
    expect(screen.getByText('meta')).toBeInTheDocument();
  });

  it('renders all four tab buttons', () => {
    renderWithRouter(<BlogPage />);
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Blog' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bluesky' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Letterboxd' })).toBeInTheDocument();
  });

  it('marks active tab with aria-pressed', () => {
    renderWithRouter(<BlogPage />);
    expect(screen.getByRole('button', { name: 'Blog' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Bluesky' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('shows only blog posts on Blog tab by default', () => {
    renderWithRouter(<BlogPage />);
    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.queryByText('Hello from Bluesky')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Film')).not.toBeInTheDocument();
  });

  it('shows Bluesky posts when switching to Bluesky tab', () => {
    renderWithRouter(<BlogPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Bluesky' }));
    expect(screen.getByText('Hello from Bluesky')).toBeInTheDocument();
    expect(screen.queryByText('Test Post')).not.toBeInTheDocument();
  });

  it('shows Letterboxd entries when switching to Letterboxd tab', () => {
    renderWithRouter(<BlogPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Letterboxd' }));
    expect(screen.getByText('Test Film')).toBeInTheDocument();
    expect(screen.queryByText('Test Post')).not.toBeInTheDocument();
  });

  it('shows all items sorted by date on All tab', () => {
    renderWithRouter(<BlogPage />);
    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('Hello from Bluesky')).toBeInTheDocument();
    expect(screen.getByText('Test Film')).toBeInTheDocument();

    // Verify chronological order (newest first)
    const times = screen.getAllByRole('time');
    const dates = times.map((t) => new Date(t.getAttribute('dateTime') ?? '').getTime());
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i]!).toBeLessThanOrEqual(dates[i - 1]!);
    }
  });
});
