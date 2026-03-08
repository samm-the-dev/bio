import { screen } from '@testing-library/react';
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

describe('BlogPage', () => {
  it('renders the Blog heading', () => {
    renderWithRouter(<BlogPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Blog');
  });

  it('renders post cards', () => {
    renderWithRouter(<BlogPage />);
    expect(screen.getByRole('article')).toBeInTheDocument();
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
});
