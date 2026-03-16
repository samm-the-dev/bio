import { useState, useCallback } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ImageLightbox } from '@/components/ImageLightbox';
import { posts } from '@/data/posts';
import { formatDate } from '@/lib/formatDate';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = posts.find((p) => p.slug === slug);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  useDocumentTitle(post?.title);

  // Delegate clicks on images inside the prose container to open lightbox
  const handleProseClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const img = (e.target as HTMLElement).closest('img');
    if (img) {
      e.preventDefault();
      setLightbox({ src: img.src, alt: img.alt || '' });
    }
  }, []);

  if (!post) return <Navigate to="/blog" replace />;

  const parentPost = post.replyTo ? posts.find((p) => p.slug === post.replyTo) : null;
  const followUps = posts.filter((p) => p.replyTo === post.slug);

  return (
    <article className="mx-auto max-w-2xl">
      <Link
        to="/blog"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All posts
      </Link>

      {parentPost && (
        <p className="mb-4 text-sm text-muted-foreground">
          Follow-up to{' '}
          <Link to={`/blog/${parentPost.slug}`} className="text-primary hover:text-primary-hover">
            {parentPost.title}
          </Link>
        </p>
      )}

      <header className="mb-4">
        <h1 className="mb-2 text-3xl font-bold">
          {post.draft && '[Draft] '}
          {post.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {post.draft ? (
            'Unpublished draft'
          ) : (
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          )}
          {post.authors?.includes('claude') && (
            <>
              {' \u00B7 '}
              {post.authors?.includes('sam') ? 'Co-authored with' : 'Written by'}{' '}
              <a
                href="https://claude.ai"
                className="text-primary hover:text-primary-hover"
                target="_blank"
                rel="noopener noreferrer"
              >
                Claude
              </a>
            </>
          )}
        </p>
        {post.tags && post.tags.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">{post.tags.join(' \u00B7 ')}</p>
        )}
        {post.excerpt && (
          <blockquote className="mt-4 border-l-2 border-border pl-4 text-sm italic text-muted-foreground">
            {post.excerpt}
          </blockquote>
        )}
      </header>

      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- keyboard handled by lightbox */}
      <div
        className="blog-prose prose max-w-none dark:prose-invert prose-headings:mb-2 prose-headings:mt-6 prose-headings:font-semibold prose-headings:text-foreground prose-p:my-3 prose-p:text-muted-foreground prose-a:text-primary hover:prose-a:text-primary-hover prose-blockquote:my-3 prose-blockquote:border-border prose-blockquote:text-muted-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:my-3 prose-ol:my-2 prose-ul:my-2 prose-li:my-0 prose-li:text-muted-foreground prose-hr:my-4"
        onClick={handleProseClick}
        dangerouslySetInnerHTML={{ __html: post.body }}
      />

      {lightbox && <ImageLightbox images={[lightbox]} onClose={() => setLightbox(null)} />}

      {post.relatedProjects && post.relatedProjects.length > 0 && (
        <aside className="mt-8 rounded-lg border border-border bg-card p-4 text-sm">
          Related {post.relatedProjects.length === 1 ? 'project' : 'projects'}:{' '}
          {post.relatedProjects.map((project, i) => (
            <span key={project.slug}>
              {i > 0 && ', '}
              <Link
                to={`/projects#${project.slug}`}
                className="font-medium text-primary hover:text-primary-hover"
              >
                {project.name}
              </Link>
            </span>
          ))}
        </aside>
      )}
      {followUps.length > 0 && (
        <aside className="mt-8 rounded-lg border border-border bg-card p-4 text-sm">
          Follow-up {followUps.length === 1 ? 'post' : 'posts'}:{' '}
          {followUps.map((followUp, i) => (
            <span key={followUp.slug}>
              {i > 0 && ', '}
              <Link
                to={`/blog/${followUp.slug}`}
                className="font-medium text-primary hover:text-primary-hover"
              >
                {followUp.title}
              </Link>
            </span>
          ))}
        </aside>
      )}
    </article>
  );
}
