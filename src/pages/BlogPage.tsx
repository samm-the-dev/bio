import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { BlueskyCard } from '@/components/BlueskyCard';
import { LetterboxdCard } from '@/components/LetterboxdCard';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useBlueskyFeed } from '@/hooks/useBlueskyFeed';
import { posts } from '@/data/posts';
import { letterboxdEntries } from '@/data/letterboxd';
import { formatDate } from '@/lib/formatDate';

type Tab = 'all' | 'blog' | 'bluesky' | 'letterboxd';

const tabs: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'blog', label: 'Blog' },
  { key: 'bluesky', label: 'Bluesky' },
  { key: 'letterboxd', label: 'Letterboxd' },
];

function BlogPostCard({ post }: { post: (typeof posts)[number] }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block rounded-lg border border-border bg-card p-4"
    >
      <h2 className="font-semibold text-card-foreground group-hover:text-primary">{post.title}</h2>
      <time className="mt-1 block text-xs text-muted-foreground" dateTime={post.publishedAt}>
        {formatDate(post.publishedAt)}
      </time>
      <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
      {post.tags && post.tags.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">{post.tags.join(' · ')}</p>
      )}
    </Link>
  );
}

type FeedItem =
  | { type: 'blog'; publishedAt: string; data: (typeof posts)[number] }
  | {
      type: 'bluesky';
      publishedAt: string;
      data: ReturnType<typeof useBlueskyFeed>['posts'][number];
    }
  | { type: 'letterboxd'; publishedAt: string; data: (typeof letterboxdEntries)[number] };

export function BlogPage() {
  useDocumentTitle('Blog');
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const { posts: bskyPosts, loading: bskyLoading, error: bskyError } = useBlueskyFeed();

  const allItems = useMemo(() => {
    const items: FeedItem[] = [];

    for (const post of posts) {
      items.push({ type: 'blog', publishedAt: post.publishedAt, data: post });
    }
    for (const post of bskyPosts) {
      items.push({ type: 'bluesky', publishedAt: post.publishedAt, data: post });
    }
    for (const entry of letterboxdEntries) {
      items.push({ type: 'letterboxd', publishedAt: entry.publishedAt, data: entry });
    }

    return items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }, [bskyPosts]);

  const filteredItems =
    activeTab === 'all' ? allItems : allItems.filter((i) => i.type === activeTab);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Blog" />

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-border bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {activeTab === 'bluesky' && bskyLoading && (
        <p className="text-center text-sm text-muted-foreground">Loading Bluesky posts…</p>
      )}
      {activeTab === 'bluesky' && bskyError && (
        <p className="text-center text-sm text-muted-foreground">
          Couldn't load Bluesky feed.{' '}
          <a
            href="https://bsky.app/profile/samm-the-human.online"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            View on Bluesky →
          </a>
        </p>
      )}
      {activeTab === 'all' && bskyLoading && (
        <p className="mb-4 text-center text-xs text-muted-foreground">Loading Bluesky posts…</p>
      )}

      {filteredItems.length === 0 && !bskyLoading ? (
        <p className="text-center text-muted-foreground">
          {activeTab === 'blog' && 'No posts yet. Check back soon!'}
          {activeTab === 'bluesky' && !bskyError && 'No Bluesky posts found.'}
          {activeTab === 'letterboxd' &&
            'No Letterboxd activity yet. Check back after the next build.'}
          {activeTab === 'all' && 'Nothing here yet. Check back soon!'}
        </p>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            switch (item.type) {
              case 'blog':
                return <BlogPostCard key={`blog-${item.data.slug}`} post={item.data} />;
              case 'bluesky':
                return <BlueskyCard key={`bsky-${item.data.uri}`} post={item.data} />;
              case 'letterboxd':
                return <LetterboxdCard key={`lb-${item.data.link}`} entry={item.data} />;
            }
          })}
        </div>
      )}
    </div>
  );
}
