/**
 * Cross-post new blog posts to Bluesky.
 *
 * Reads published posts from content/posts/, compares against .crossposted.json
 * to find new ones, and posts each to Bluesky with a link card embed.
 *
 * Supports `replyTo` frontmatter field to post as a reply to a previous crosspost.
 *
 * Requires env vars: BLUESKY_HANDLE, BLUESKY_APP_PASSWORD
 * Dry-run mode: set DRY_RUN=1 to preview without posting.
 */
import { AtpAgent, RichText } from '@atproto/api';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import matter from 'gray-matter';

const SITE_URL = 'https://samm.bio';
const TRACKING_FILE = '.crossposted.json';

// Tag-to-hashtag mapping for Bluesky posts
const TAG_HASHTAGS = {
  ai: ['#AI'],
  code: ['#BuildInPublic', '#WebDev'],
  climate: ['#Climate'],
  improv: ['#Improv', '#ImprovComedy'],
  ttrpg: ['#TTRPG', '#GameDesign'],
  adhd: ['#ADHD', '#ADHDlife'],
  'mental-health': ['#MentalHealth'],
};

function getHashtags(post) {
  const tags = [...new Set((post.tags || []).flatMap((tag) => TAG_HASHTAGS[tag] || []))];
  if ((post.authors || []).includes('claude')) tags.push('#ClaudeCode');
  return tags;
}
const handle = process.env.BLUESKY_HANDLE;
const password = process.env.BLUESKY_APP_PASSWORD;
const dryRun = process.env.DRY_RUN === '1';

if (!dryRun && (!handle || !password)) {
  console.error('Missing BLUESKY_HANDLE or BLUESKY_APP_PASSWORD env vars.');
  process.exit(1);
}

// Load and migrate tracking state (array format -> object format)
let tracking = existsSync(TRACKING_FILE)
  ? JSON.parse(readFileSync(TRACKING_FILE, 'utf-8'))
  : {};

if (Array.isArray(tracking)) {
  const migrated = {};
  for (const slug of tracking) {
    migrated[slug] = { uri: null, cid: null };
  }
  tracking = migrated;
  writeFileSync(TRACKING_FILE, JSON.stringify(tracking, null, 2) + '\n');
  console.log('Migrated tracking file from array to object format.');
}

// Find published posts not yet cross-posted
const postsDir = 'content/posts';
const postFiles = readdirSync(postsDir).filter((f) => f.endsWith('.md'));

const newPosts = postFiles
  .map((file) => {
    const { data } = matter(readFileSync(`${postsDir}/${file}`, 'utf-8'));
    if (!data.publishedAt || data.slug in tracking) return null;
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
    const hashtags = getHashtags(post);
    const hashtagLine = hashtags.length > 0 ? `\n\n${hashtags.join(' ')}` : '';
    const prefix = post.replyTo ? 'Follow-up' : 'New blog post';
    const replyNote = post.replyTo ? ` (reply to: ${post.replyTo})` : '';
    console.log(`[DRY RUN] Would post${replyNote}:\n---\n${prefix}: ${SITE_URL}/blog/${post.slug}${hashtagLine}\n---`);
  }
  process.exit(0);
}

// Authenticate
const agent = new AtpAgent({ service: 'https://bsky.social' });
await agent.login({ identifier: handle, password });

/**
 * Resolve a parent post's URI and CID for reply threading.
 * Checks tracking file first, then searches Bluesky feed as fallback.
 */
async function resolveParent(slug) {
  const entry = tracking[slug];
  if (entry?.uri && entry?.cid) return entry;

  // Search author's recent posts for the matching blog URL
  const url = `${SITE_URL}/blog/${slug}`;
  console.log(`Resolving parent post for "${slug}" via Bluesky feed...`);

  const feed = await agent.getAuthorFeed({ actor: handle, limit: 50 });
  const match = feed.data.feed.find((item) => {
    const record = item.post.record;
    return record?.embed?.external?.uri === url;
  });

  if (match) {
    const resolved = { uri: match.post.uri, cid: match.post.cid };
    if (slug in tracking) tracking[slug] = resolved;
    console.log(`Resolved parent: ${resolved.uri}`);
    return resolved;
  }

  console.warn(`Could not resolve parent post for "${slug}" -- posting as standalone.`);
  return null;
}

for (const post of newPosts) {
  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const hashtags = getHashtags(post);
  const hashtagLine = hashtags.length > 0 ? `\n\n${hashtags.join(' ')}` : '';
  const prefix = post.replyTo ? 'Follow-up' : 'New blog post';
  const text = `${prefix}: ${postUrl}${hashtagLine}`;

  // Build rich text to detect link facets
  const rt = new RichText({ text });
  await rt.detectFacets(agent);

  const postParams = {
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
  };

  // Thread as reply if replyTo is set and parent can be resolved
  if (post.replyTo) {
    const parent = await resolveParent(post.replyTo);
    if (parent) {
      postParams.reply = {
        root: { uri: parent.uri, cid: parent.cid },
        parent: { uri: parent.uri, cid: parent.cid },
      };
    }
  }

  const response = await agent.post(postParams);

  console.log(`Posted: "${post.title}"${post.replyTo ? ` (reply to ${post.replyTo})` : ''}`);
  tracking[post.slug] = { uri: response.uri, cid: response.cid };
  writeFileSync(TRACKING_FILE, JSON.stringify(tracking, null, 2) + '\n');
}

console.log('Tracking file updated.');
