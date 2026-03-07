/**
 * Cross-post new blog posts to Bluesky.
 *
 * Reads published posts from content/posts/, compares against .crossposted.json
 * to find new ones, and posts each to Bluesky with a link card embed.
 *
 * Requires env vars: BLUESKY_HANDLE, BLUESKY_APP_PASSWORD
 * Dry-run mode: set DRY_RUN=1 to preview without posting.
 */
import { AtpAgent, RichText } from '@atproto/api';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import matter from 'gray-matter';

const SITE_URL = 'https://samm.bio';
const TRACKING_FILE = '.crossposted.json';

const handle = process.env.BLUESKY_HANDLE;
const password = process.env.BLUESKY_APP_PASSWORD;
const dryRun = process.env.DRY_RUN === '1';

if (!dryRun && (!handle || !password)) {
  console.error('Missing BLUESKY_HANDLE or BLUESKY_APP_PASSWORD env vars.');
  process.exit(1);
}

// Load tracking state
const posted = existsSync(TRACKING_FILE)
  ? JSON.parse(readFileSync(TRACKING_FILE, 'utf-8'))
  : [];

// Find published posts not yet cross-posted
const postsDir = 'content/posts';
const postFiles = readdirSync(postsDir).filter((f) => f.endsWith('.md'));

const newPosts = postFiles
  .map((file) => {
    const { data } = matter(readFileSync(`${postsDir}/${file}`, 'utf-8'));
    if (!data.publishedAt || posted.includes(data.slug)) return null;
    return data;
  })
  .filter(Boolean)
  .sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));

if (newPosts.length === 0) {
  console.log('No new posts to cross-post.');
  process.exit(0);
}

console.log(`Found ${newPosts.length} new post(s) to cross-post.`);

if (dryRun) {
  for (const post of newPosts) {
    console.log(`[DRY RUN] Would post: "${post.title}" -> ${SITE_URL}/blog/${post.slug}`);
  }
  process.exit(0);
}

// Authenticate
const agent = new AtpAgent({ service: 'https://bsky.social' });
await agent.login({ identifier: handle, password });

for (const post of newPosts) {
  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const text = `New blog post: ${post.title}\n\n${post.excerpt}\n\n${postUrl}`;

  // Build rich text to detect link facets
  const rt = new RichText({ text });
  await rt.detectFacets(agent);

  await agent.post({
    text: rt.text,
    facets: rt.facets,
    embed: {
      $type: 'app.bsky.embed.external',
      external: {
        uri: postUrl,
        title: post.title,
        description: post.excerpt,
      },
    },
    createdAt: new Date().toISOString(),
  });

  console.log(`Posted: "${post.title}"`);
  posted.push(post.slug);
  writeFileSync(TRACKING_FILE, JSON.stringify(posted, null, 2) + '\n');
}

console.log('Tracking file updated.');
