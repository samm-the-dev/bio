import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { posts } from '@/data/posts';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function BlogPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="ADHDev" descriptor="My scatterbrained dev journey with Claude Code" />

      {posts.length === 0 ? (
        <p className="text-center text-muted-foreground">No posts yet. Check back soon!</p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <article key={post.slug} className="rounded-lg border border-border bg-card p-4">
              <Link to={`/blog/${post.slug}`} className="group">
                <h2 className="font-semibold text-card-foreground group-hover:text-primary">
                  {post.title}
                </h2>
              </Link>
              <time className="mt-1 block text-xs text-muted-foreground">
                {formatDate(post.publishedAt)}
              </time>
              <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
              {post.tags && post.tags.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">{post.tags.join(' \u00B7 ')}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
