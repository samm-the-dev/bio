import { useState, useEffect } from 'react';

export interface BlueskyPost {
  uri: string;
  text: string;
  publishedAt: string;
  url: string;
  likeCount: number;
  repostCount: number;
  replyCount: number;
  hasImages: boolean;
  images: { thumb: string; alt: string }[];
}

const BSKY_PUBLIC_API = 'https://public.api.bsky.app/xrpc';
const HANDLE = 'samm-the-human.online';

export function useBlueskyFeed(enabled = true, limit = 25) {
  const [posts, setPosts] = useState<BlueskyPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!enabled || fetched) return;

    let cancelled = false;

    setLoading(true);
    setError(null);

    async function fetchFeed() {
      try {
        // Resolve handle to DID
        const profileRes = await fetch(
          `${BSKY_PUBLIC_API}/app.bsky.actor.getProfile?actor=${encodeURIComponent(HANDLE)}`,
        );
        if (!profileRes.ok) throw new Error('Failed to load Bluesky profile');
        const profile = await profileRes.json();
        const did = profile.did;

        // Fetch author feed (posts only, no replies/reposts)
        const feedRes = await fetch(
          `${BSKY_PUBLIC_API}/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(did)}&limit=${limit}&filter=posts_no_replies`,
        );
        if (!feedRes.ok) throw new Error('Failed to load Bluesky feed');
        const feedData = await feedRes.json();

        if (cancelled) return;

        const parsed: BlueskyPost[] = (feedData.feed || [])
          .filter(
            (item: Record<string, unknown>) =>
              item.post &&
              !(
                item.reason &&
                (item.reason as Record<string, unknown>).$type === 'app.bsky.feed.defs#reasonRepost'
              ),
          )
          .map((item: Record<string, unknown>) => {
            const post = item.post as Record<string, unknown>;
            const record = post.record as Record<string, unknown>;
            const rkey = (post.uri as string).split('/').pop();
            const handle = (post.author as Record<string, unknown>).handle as string;

            const embed = post.embed as Record<string, unknown> | undefined;
            const images: { thumb: string; alt: string }[] = [];
            if (embed?.images && Array.isArray(embed.images)) {
              for (const img of embed.images) {
                images.push({ thumb: img.thumb, alt: img.alt || '' });
              }
            }

            const createdAt = (record.createdAt as string) || '';
            return {
              uri: post.uri as string,
              text: (record.text as string) || '',
              publishedAt: createdAt,
              url: `https://bsky.app/profile/${handle}/post/${rkey}`,
              likeCount: (post.likeCount as number) || 0,
              repostCount: (post.repostCount as number) || 0,
              replyCount: (post.replyCount as number) || 0,
              hasImages: images.length > 0,
              images,
            };
          })
          .filter((p: BlueskyPost) => p.publishedAt && !isNaN(Date.parse(p.publishedAt)));

        setPosts(parsed);
        setFetched(true);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load Bluesky feed');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFeed();
    return () => {
      cancelled = true;
    };
  }, [enabled, fetched, limit]);

  return { posts, loading, error };
}
