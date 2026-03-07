import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { BlogPostPage } from './BlogPostPage';

vi.mock('@/data/posts', () => ({
  posts: [
    {
      title: 'Test Post',
      slug: 'test-post',
      excerpt: 'A test excerpt.',
      publishedAt: '2026-01-15T12:00:00.000Z',
      body: '<p>Hello world</p>',
      tags: ['meta'],
      relatedProjects: [],
    },
  ],
}));

function renderPostPage(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/blog/${slug}`]}>
      <Routes>
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/blog" element={<div>Blog list</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('BlogPostPage', () => {
  it('renders the post title', () => {
    renderPostPage('test-post');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Post');
  });

  it('renders the post body', () => {
    renderPostPage('test-post');
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders date with dateTime attribute', () => {
    renderPostPage('test-post');
    const time = screen.getByRole('time');
    expect(time).toHaveAttribute('dateTime', '2026-01-15T12:00:00.000Z');
  });

  it('redirects for unknown slugs', () => {
    renderPostPage('nonexistent');
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    expect(screen.getByText('Blog list')).toBeInTheDocument();
  });
});
