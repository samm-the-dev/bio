import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { FeedCard } from '@/components/FeedCard';
import { BlueskyCard } from '@/components/BlueskyCard';
import { LetterboxdCard } from '@/components/LetterboxdCard';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useBlueskyFeed } from '@/hooks/useBlueskyFeed';
import { useLetterboxdFeed } from '@/hooks/useLetterboxdFeed';
import { posts } from '@/data/posts';
import { formatDate } from '@/lib/formatDate';
import { Film, PenLine } from 'lucide-react';
import { BlueskyIcon } from '@/components/icons';

type Tab = 'all' | 'blog' | 'bluesky' | 'letterboxd';

const tabs: { key: Tab; label: string }[] = [
  { key: 'blog', label: 'Blog' },
  { key: 'bluesky', label: 'Bluesky' },
  { key: 'letterboxd', label: 'Letterboxd' },
  { key: 'all', label: 'All' },
];

function BlogPostCard({ post }: { post: (typeof posts)[number] }) {
  return (
    <FeedCard as="link" to={`/blog/${post.slug}`}>
      <div className="p-4">
        <div className="flex items-center gap-2">
          <PenLine className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
            Blog
          </span>
        </div>
        <h2 className="mt-2 font-semibold text-card-foreground">{post.title}</h2>
        <time className="mt-1 block text-xs text-muted-foreground" dateTime={post.publishedAt}>
          {formatDate(post.publishedAt)}
        </time>
        <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
        {post.tags && post.tags.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">{post.tags.join(' · ')}</p>
        )}
      </div>
    </FeedCard>
  );
}

type FeedItem =
  | { type: 'blog'; publishedAt: string; data: (typeof posts)[number] }
  | {
      type: 'bluesky';
      publishedAt: string;
      data: ReturnType<typeof useBlueskyFeed>['posts'][number];
    }
  | {
      type: 'letterboxd';
      publishedAt: string;
      data: ReturnType<typeof useLetterboxdFeed>['entries'][number];
    };

export function BlogPage() {
  useDocumentTitle('Blog');
  const [activeTab, setActiveTab] = useState<Tab>('blog');
  const needsFeeds = activeTab === 'bluesky' || activeTab === 'all';
  // Letterboxd data is build-time, so entries are available immediately
  const { entries: lbEntries, loading: lbLoading, error: lbError } = useLetterboxdFeed();

  // Oldest Letterboxd entry sets the target date for Bluesky pagination
  const lbCutoff = useMemo(() => {
    if (lbEntries.length === 0) return null;
    return Math.min(...lbEntries.map((e) => Date.parse(e.publishedAt)));
  }, [lbEntries]);

  // On "all" tab, extend Bluesky fetch to cover the Letterboxd date range
  const bskyFetchUntil = activeTab === 'all' ? lbCutoff : null;
  const {
    posts: bskyPosts,
    loading: bskyLoading,
    error: bskyError,
  } = useBlueskyFeed(needsFeeds, bskyFetchUntil);

  const allItems = useMemo(() => {
    const items: FeedItem[] = [];

    for (const post of posts) {
      items.push({ type: 'blog', publishedAt: post.publishedAt, data: post });
    }
    for (const post of bskyPosts) {
      items.push({ type: 'bluesky', publishedAt: post.publishedAt, data: post });
    }
    for (const entry of lbEntries) {
      items.push({ type: 'letterboxd', publishedAt: entry.publishedAt, data: entry });
    }

    return items.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  }, [bskyPosts, lbEntries]);

  const filteredItems =
    activeTab === 'all' ? allItems : allItems.filter((i) => i.type === activeTab);

  const isTabLoading =
    (activeTab === 'bluesky' && bskyLoading) ||
    (activeTab === 'letterboxd' && lbLoading) ||
    (activeTab === 'all' && (bskyLoading || lbLoading));

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Blog" />

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-border bg-muted p-1">
        {tabs.map((tab) => {
          const isLoading =
            (tab.key === 'bluesky' && bskyLoading) ||
            (tab.key === 'letterboxd' && lbLoading) ||
            (tab.key === 'all' && (bskyLoading || lbLoading));
          return (
            <button
              type="button"
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              aria-pressed={activeTab === tab.key}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                {tab.label}
                {isLoading && (
                  <span className="border-current/30 inline-block h-3 w-3 animate-spin rounded-full border border-t-current" />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feed errors */}
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
      {activeTab === 'letterboxd' && lbError && (
        <p className="text-center text-sm text-muted-foreground">
          Couldn't load Letterboxd feed.{' '}
          <a
            href="https://letterboxd.com/samm_loves_film/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            View on Letterboxd →
          </a>
        </p>
      )}

      {filteredItems.length === 0 &&
      !isTabLoading &&
      !(activeTab === 'bluesky' && bskyError) &&
      !(activeTab === 'letterboxd' && lbError) ? (
        <p className="text-center text-muted-foreground">
          {activeTab === 'blog' && 'No posts yet. Check back soon!'}
          {activeTab === 'bluesky' && 'No Bluesky posts found.'}
          {activeTab === 'letterboxd' && 'No Letterboxd activity found.'}
          {activeTab === 'all' && 'Nothing here yet. Check back soon!'}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
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
          {!isTabLoading &&
            bskyPosts.length > 0 &&
            (activeTab === 'bluesky' || activeTab === 'all') && (
              <div className="flex items-center justify-center gap-3 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                <BlueskyIcon className="h-4 w-4 shrink-0" />
                <span>
                  That's the latest from Bluesky.{' '}
                  <a
                    href="https://bsky.app/profile/samm-the-human.online"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground"
                  >
                    See more on Bluesky →
                  </a>
                </span>
              </div>
            )}
          {!isTabLoading &&
            lbEntries.length > 0 &&
            (activeTab === 'letterboxd' || activeTab === 'all') && (
              <div className="flex items-center justify-center gap-3 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                <Film className="h-4 w-4 shrink-0" />
                <span>
                  That's the latest from Letterboxd.{' '}
                  <a
                    href="https://letterboxd.com/samm_loves_film/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground"
                  >
                    See more on Letterboxd →
                  </a>
                </span>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
