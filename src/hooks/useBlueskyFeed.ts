import { useState, useEffect } from 'react';

export interface BlueskyQuote {
  text: string;
  author: { handle: string; displayName: string };
  url: string;
  images: { thumb: string; fullsize: string; alt: string }[];
}

export interface BlueskyExternal {
  uri: string;
  title: string;
  description: string;
  thumb: string | null;
}

export interface BlueskyVideo {
  playlist: string;
  thumbnail: string | null;
  alt: string;
  aspectRatio: { width: number; height: number } | null;
}

export interface BlueskyPost {
  uri: string;
  text: string;
  publishedAt: string;
  url: string;
  likeCount: number;
  repostCount: number;
  replyCount: number;
  hasImages: boolean;
  images: { thumb: string; fullsize: string; alt: string }[];
  quotedPost: BlueskyQuote | null;
  external: BlueskyExternal | null;
  video: BlueskyVideo | null;
  replyParentUri: string | null;
  threadReplies: BlueskyPost[];
}

const BSKY_PUBLIC_API = 'https://public.api.bsky.app/xrpc';
const HANDLE = 'samm-the-human.online';

export function useBlueskyFeed(enabled = true, fetchUntil: number | null = null) {
  const [posts, setPosts] = useState<BlueskyPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedUntil, setFetchedUntil] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;
    // Skip if we already fetched with sufficient coverage
    if (fetchedUntil !== undefined) {
      if (fetchUntil === null) return; // no target needed, already fetched
      if (fetchedUntil !== null && fetchedUntil <= fetchUntil) return; // already covered
    }

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

        // Fetch author feed, paginating until we cover the target date range
        const pageSize = 50;
        const maxPages = 5;
        let allFeedItems: Record<string, unknown>[] = [];
        let cursor: string | undefined;

        for (let page = 0; page < maxPages; page++) {
          const params = new URLSearchParams({
            actor: did,
            limit: String(pageSize),
            filter: 'posts_and_author_threads',
          });
          if (cursor) params.set('cursor', cursor);

          const feedRes = await fetch(`${BSKY_PUBLIC_API}/app.bsky.feed.getAuthorFeed?${params}`);
          if (!feedRes.ok) throw new Error('Failed to load Bluesky feed');
          const feedData = await feedRes.json();

          if (cancelled) return;

          const items = (feedData.feed || []) as Record<string, unknown>[];
          allFeedItems = allFeedItems.concat(items);
          cursor = feedData.cursor;

          // Stop if no more pages
          if (!cursor || items.length === 0) break;

          // Stop if we've reached far enough back for the target date
          if (fetchUntil !== null) {
            let oldestInPage = Infinity;
            for (const item of items) {
              const record = (item.post as Record<string, unknown>)?.record as
                | Record<string, unknown>
                | undefined;
              if (record?.createdAt) {
                const ts = Date.parse(record.createdAt as string);
                if (ts < oldestInPage) oldestInPage = ts;
              }
            }
            if (oldestInPage <= fetchUntil) break;
          } else {
            // No target date — single page is enough
            break;
          }
        }

        const parsed: BlueskyPost[] = allFeedItems
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
            const images: { thumb: string; fullsize: string; alt: string }[] = [];
            let quotedPost: BlueskyQuote | null = null;
            let external: BlueskyExternal | null = null;
            let video: BlueskyVideo | null = null;

            if (embed) {
              const embedType = embed.$type as string | undefined;

              // Direct images
              if (embed.images && Array.isArray(embed.images)) {
                for (const img of embed.images) {
                  images.push({
                    thumb: img.thumb,
                    fullsize: img.fullsize || img.thumb,
                    alt: img.alt || '',
                  });
                }
              }

              // Quoted post (record embed or recordWithMedia)
              const recordEmbed =
                embedType === 'app.bsky.embed.record#view'
                  ? (embed.record as Record<string, unknown>)
                  : embedType === 'app.bsky.embed.recordWithMedia#view'
                    ? ((embed.record as Record<string, unknown>)?.record as Record<string, unknown>)
                    : null;

              if (
                recordEmbed &&
                (recordEmbed.$type as string)?.includes('app.bsky.embed.record#viewRecord')
              ) {
                const qAuthor = recordEmbed.author as Record<string, unknown>;
                const qRkey = (recordEmbed.uri as string).split('/').pop();
                const qHandle = (qAuthor?.handle as string) || '';
                // Extract images from quoted post's embeds
                const qImages: { thumb: string; fullsize: string; alt: string }[] = [];
                const qEmbeds = recordEmbed.embeds as Record<string, unknown>[] | undefined;
                if (Array.isArray(qEmbeds)) {
                  for (const qEmbed of qEmbeds) {
                    if (qEmbed.images && Array.isArray(qEmbed.images)) {
                      for (const img of qEmbed.images) {
                        qImages.push({
                          thumb: img.thumb,
                          fullsize: img.fullsize,
                          alt: img.alt || '',
                        });
                      }
                    }
                  }
                }

                quotedPost = {
                  text: ((recordEmbed.value as Record<string, unknown>)?.text as string) || '',
                  author: {
                    handle: qHandle,
                    displayName: (qAuthor?.displayName as string) || qHandle,
                  },
                  url: `https://bsky.app/profile/${qHandle}/post/${qRkey}`,
                  images: qImages,
                };
              }

              // External embed (link cards, GIFs)
              const ext =
                embedType === 'app.bsky.embed.external#view'
                  ? (embed.external as Record<string, unknown>)
                  : embedType === 'app.bsky.embed.recordWithMedia#view'
                    ? ((embed.media as Record<string, unknown>)?.external as Record<
                        string,
                        unknown
                      >)
                    : null;

              if (ext) {
                external = {
                  uri: (ext.uri as string) || '',
                  title: (ext.title as string) || '',
                  description: (ext.description as string) || '',
                  thumb: (ext.thumb as string) || null,
                };
              }

              // Images from recordWithMedia
              if (embedType === 'app.bsky.embed.recordWithMedia#view') {
                const mediaImages = (embed.media as Record<string, unknown>)?.images;
                if (Array.isArray(mediaImages)) {
                  for (const img of mediaImages) {
                    images.push({
                      thumb: img.thumb,
                      fullsize: img.fullsize || img.thumb,
                      alt: img.alt || '',
                    });
                  }
                }
              }

              // Video embed (used for GIFs in newer Bluesky)
              if (embedType === 'app.bsky.embed.video#view') {
                video = {
                  playlist: (embed.playlist as string) || '',
                  thumbnail: (embed.thumbnail as string) || null,
                  alt: (embed.alt as string) || '',
                  aspectRatio: embed.aspectRatio
                    ? {
                        width: (embed.aspectRatio as Record<string, number>).width || 1,
                        height: (embed.aspectRatio as Record<string, number>).height || 1,
                      }
                    : null,
                };
              }
            }

            const createdAt = (record.createdAt as string) || '';
            const reply = record.reply as Record<string, unknown> | undefined;
            const replyParentUri = reply
              ? ((reply.parent as Record<string, unknown>)?.uri as string) || null
              : null;

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
              quotedPost,
              external,
              video,
              replyParentUri,
              threadReplies: [],
            };
          })
          .filter((p: BlueskyPost) => p.publishedAt && !isNaN(Date.parse(p.publishedAt)));

        // Chain self-replies into threads
        const postsByUri = new Map(parsed.map((p) => [p.uri, p]));
        const threadChildUris = new Set<string>();
        for (const p of parsed) {
          if (p.replyParentUri && postsByUri.has(p.replyParentUri)) {
            postsByUri.get(p.replyParentUri)!.threadReplies.push(p);
            threadChildUris.add(p.uri);
          }
        }
        // Flatten nested chains: if A -> B -> C, move C into A's threadReplies
        for (const p of parsed) {
          if (threadChildUris.has(p.uri)) continue;
          const flat: BlueskyPost[] = [];
          const queue = [...p.threadReplies];
          p.threadReplies = [];
          while (queue.length > 0) {
            const reply = queue.shift()!;
            flat.push(reply);
            queue.push(...reply.threadReplies);
            reply.threadReplies = [];
          }
          p.threadReplies = flat;
        }
        const threaded = parsed.filter((p) => !threadChildUris.has(p.uri));

        setPosts(threaded);
        setFetchedUntil(fetchUntil);
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
  }, [enabled, fetchedUntil, fetchUntil]);

  return { posts, loading, error };
}
