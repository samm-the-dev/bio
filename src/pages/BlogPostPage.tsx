import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { posts } from '@/data/posts';
import { formatDate } from '@/lib/formatDate';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = posts.find((p) => p.slug === slug);

  useDocumentTitle(post?.title);

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <article className="mx-auto max-w-2xl">
      <Link
        to="/blog"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All posts
      </Link>

      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{post.title}</h1>
        <time className="text-sm text-muted-foreground" dateTime={post.publishedAt}>
          {formatDate(post.publishedAt)}
        </time>
        {post.tags && post.tags.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">{post.tags.join(' \u00B7 ')}</p>
        )}
      </header>

      <div
        className="prose max-w-none dark:prose-invert prose-headings:mb-2 prose-headings:mt-6 prose-headings:font-semibold prose-headings:text-foreground prose-p:my-3 prose-p:text-muted-foreground prose-a:text-primary hover:prose-a:text-primary-hover prose-blockquote:my-3 prose-blockquote:border-border prose-blockquote:text-muted-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:my-3 prose-ol:my-2 prose-ul:my-2 prose-li:my-0 prose-li:text-muted-foreground prose-hr:my-4"
        dangerouslySetInnerHTML={{ __html: post.body }}
      />

      {post.relatedProjects && post.relatedProjects.length > 0 && (
        <aside className="mt-8 rounded-lg border border-border bg-card p-4 text-sm">
          Related {post.relatedProjects.length === 1 ? 'project' : 'projects'}:{' '}
          {post.relatedProjects.map((project, i) => (
            <span key={project.slug}>
              {i > 0 && ', '}
              <Link to="/projects" className="font-medium text-primary hover:text-primary-hover">
                {project.name}
              </Link>
            </span>
          ))}
        </aside>
      )}
    </article>
  );
}
