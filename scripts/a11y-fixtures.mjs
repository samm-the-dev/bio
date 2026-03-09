/**
 * Bluesky fixture data for a11y audit — deterministic posts covering all embed variants.
 * Based on real feed data with a synthetic video post added for coverage.
 *
 * Variants covered:
 *   - Images (single)
 *   - External link card (with and without thumb)
 *   - GIF embed (Tenor)
 *   - Quoted post with images
 *   - Thread (parent + self-reply)
 *   - Text-only
 *   - Video embed (synthetic)
 */

const DID = 'did:plc:b6qlc4j47d2iyj46tl6igiuu';
const HANDLE = 'samm-the-human.online';

export const BLUESKY_PROFILE = {
  did: DID,
  handle: HANDLE,
  displayName: 'Sam Marsh',
};

export const BLUESKY_FEED = {
  feed: [
    // 1. Images
    {
      post: {
        uri: `at://${DID}/app.bsky.feed.post/a11y-images`,
        cid: 'cid-a11y-images',
        author: { did: DID, handle: HANDLE, displayName: 'Sam Marsh' },
        record: {
          $type: 'app.bsky.feed.post',
          text: 'I continue to obsessively work on my site. Just set up a combined feed of blog posts, Bluesky, and Letterboxd:\nsamm.bio/blog/all',
          createdAt: '2026-03-09T08:58:10.548Z',
        },
        embed: {
          $type: 'app.bsky.embed.images#view',
          images: [
            {
              thumb: 'https://placehold.co/400x300/1a1a2e/e0e0e0?text=Feed+screenshot',
              fullsize: 'https://placehold.co/800x600/1a1a2e/e0e0e0?text=Feed+screenshot',
              alt: 'Screenshot of the combined blog feed',
            },
          ],
        },
        likeCount: 3,
        repostCount: 1,
        replyCount: 0,
      },
    },
    // 2. External link card (with thumb)
    {
      post: {
        uri: `at://${DID}/app.bsky.feed.post/a11y-external`,
        cid: 'cid-a11y-external',
        author: { did: DID, handle: HANDLE, displayName: 'Sam Marsh' },
        record: {
          $type: 'app.bsky.feed.post',
          text: "Y'all like gifs? I put all of mine on my site:\nsamm.bio/projects/gifs",
          createdAt: '2026-03-09T00:36:55.135Z',
        },
        embed: {
          $type: 'app.bsky.embed.external#view',
          external: {
            uri: 'https://samm.bio/projects/gifs',
            title: 'GIFs',
            description: "All the GIFs I've made from various movies and shows.",
            thumb: 'https://placehold.co/600x315/1a1a2e/e0e0e0?text=GIFs+page',
          },
        },
        likeCount: 2,
        repostCount: 0,
        replyCount: 0,
      },
    },
    // 3. Quoted post with images
    {
      post: {
        uri: `at://${DID}/app.bsky.feed.post/a11y-quote`,
        cid: 'cid-a11y-quote',
        author: { did: DID, handle: HANDLE, displayName: 'Sam Marsh' },
        record: {
          $type: 'app.bsky.feed.post',
          text: 'It me! I was at both but had to leave early during the second one.',
          createdAt: '2026-03-08T00:19:43.745Z',
        },
        embed: {
          $type: 'app.bsky.embed.record#view',
          record: {
            $type: 'app.bsky.embed.record#viewRecord',
            uri: 'at://did:plc:other/app.bsky.feed.post/quoted-post',
            cid: 'cid-quoted-post',
            author: {
              did: 'did:plc:other',
              handle: 'iolitestudioz.bsky.social',
              displayName: 'Iolite Studioz',
            },
            value: {
              text: 'Great weekend class with Jason Lord and Sara Ragsdale! We had WALLA, Auditions, and ADR!',
            },
            embeds: [
              {
                $type: 'app.bsky.embed.images#view',
                images: [
                  {
                    thumb: 'https://placehold.co/300x200/2a2a3e/e0e0e0?text=Class+photo+1',
                    fullsize: 'https://placehold.co/600x400/2a2a3e/e0e0e0?text=Class+photo+1',
                    alt: 'Weekend class group photo',
                  },
                  {
                    thumb: 'https://placehold.co/300x200/2a2a3e/e0e0e0?text=Class+photo+2',
                    fullsize: 'https://placehold.co/600x400/2a2a3e/e0e0e0?text=Class+photo+2',
                    alt: 'Students in the studio',
                  },
                ],
              },
            ],
          },
        },
        likeCount: 2,
        repostCount: 0,
        replyCount: 0,
      },
    },
    // 4. GIF embed (Tenor URL in external)
    {
      post: {
        uri: `at://${DID}/app.bsky.feed.post/a11y-gif`,
        cid: 'cid-a11y-gif',
        author: { did: DID, handle: HANDLE, displayName: 'Sam Marsh' },
        record: {
          $type: 'app.bsky.feed.post',
          text: 'Neat. This was an automated test post from my new dev blog.',
          createdAt: '2026-03-07T21:11:54.741Z',
          reply: {
            parent: { uri: `at://${DID}/app.bsky.feed.post/a11y-thread-parent`, cid: 'cid-tp' },
            root: { uri: `at://${DID}/app.bsky.feed.post/a11y-thread-parent`, cid: 'cid-tp' },
          },
        },
        embed: {
          $type: 'app.bsky.embed.external#view',
          external: {
            uri: 'https://media.tenor.com/Fml5n5WhvrMAAAAC/anakin.gif',
            title: 'Anakin reaction GIF',
            description: 'A little boy holding something and saying "it\'s".',
            thumb: 'https://placehold.co/400x200/1a1a2e/e0e0e0?text=GIF+thumbnail',
          },
        },
        likeCount: 0,
        repostCount: 0,
        replyCount: 0,
      },
    },
    // 5. Text-only (also a thread reply for coverage)
    {
      post: {
        uri: `at://${DID}/app.bsky.feed.post/a11y-textonly`,
        cid: 'cid-a11y-textonly',
        author: { did: DID, handle: HANDLE, displayName: 'Sam Marsh' },
        record: {
          $type: 'app.bsky.feed.post',
          text: 'Loved it. Wonderfully weird and fun.',
          createdAt: '2026-03-07T04:53:15.039Z',
        },
        likeCount: 0,
        repostCount: 0,
        replyCount: 0,
      },
    },
    // 6. Thread parent (external link card, no thumb)
    {
      post: {
        uri: `at://${DID}/app.bsky.feed.post/a11y-thread-parent`,
        cid: 'cid-tp',
        author: { did: DID, handle: HANDLE, displayName: 'Sam Marsh' },
        record: {
          $type: 'app.bsky.feed.post',
          text: 'New blog post: Hello World\n\nA test post to verify the markdown blog pipeline.\n\nhttps://samm.bio/blog/hello-world',
          createdAt: '2026-03-07T21:09:50.778Z',
        },
        embed: {
          $type: 'app.bsky.embed.external#view',
          external: {
            uri: 'https://samm.bio/blog/hello-world',
            title: 'Hello World',
            description:
              'A test post to verify the markdown blog pipeline — code blocks, lists, tables, and typography.',
            thumb: null,
          },
        },
        likeCount: 0,
        repostCount: 0,
        replyCount: 1,
      },
    },
    // 7. Video embed (synthetic — no real video posts in feed yet)
    {
      post: {
        uri: `at://${DID}/app.bsky.feed.post/a11y-video`,
        cid: 'cid-a11y-video',
        author: { did: DID, handle: HANDLE, displayName: 'Sam Marsh' },
        record: {
          $type: 'app.bsky.feed.post',
          text: 'Check out this clip from the show.',
          createdAt: '2026-03-06T18:00:00.000Z',
        },
        embed: {
          $type: 'app.bsky.embed.video#view',
          playlist: 'https://example.com/video.m3u8',
          thumbnail: 'https://placehold.co/640x360/1a1a2e/e0e0e0?text=Video+thumbnail',
          alt: 'Short clip from an improv show',
          aspectRatio: { width: 16, height: 9 },
        },
        likeCount: 5,
        repostCount: 2,
        replyCount: 1,
      },
    },
  ],
  cursor: undefined,
};
