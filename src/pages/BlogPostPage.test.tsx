import { render, screen, fireEvent } from '@testing-library/react';
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
      body: '<p>Hello world</p><p><img src="/blog/test.png" alt="Test image" /></p>',
      tags: ['meta'],
      relatedProjects: [],
    },
    {
      title: 'No Excerpt Post',
      slug: 'no-excerpt',
      excerpt: '',
      publishedAt: '2026-01-16T12:00:00.000Z',
      body: '<p>Body only</p>',
      tags: null,
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

  it('renders excerpt as blockquote epigraph when present', () => {
    const { container } = renderPostPage('test-post');
    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toBeInTheDocument();
    expect(blockquote).toHaveTextContent('A test excerpt.');
  });

  it('does not render blockquote when excerpt is empty', () => {
    const { container } = renderPostPage('no-excerpt');
    expect(container.querySelector('blockquote')).not.toBeInTheDocument();
  });

  it('makes blog images keyboard-accessible', () => {
    const { container } = renderPostPage('test-post');
    const img = container.querySelector('.blog-prose img') as HTMLImageElement;
    expect(img).toHaveAttribute('tabindex', '0');
    expect(img).toHaveAttribute('role', 'button');
  });

  it('opens lightbox on image click', () => {
    const { container } = renderPostPage('test-post');
    const img = container.querySelector('.blog-prose img') as HTMLImageElement;
    fireEvent.click(img);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('opens lightbox on Enter key', () => {
    const { container } = renderPostPage('test-post');
    const img = container.querySelector('.blog-prose img') as HTMLImageElement;
    fireEvent.keyDown(img, { key: 'Enter' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
