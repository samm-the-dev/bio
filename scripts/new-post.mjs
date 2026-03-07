/**
 * Scaffold a new blog post with frontmatter.
 * Usage: node scripts/new-post.mjs "My Post Title"
 */
import { writeFileSync, existsSync } from 'fs';

const title = process.argv[2];
if (!title) {
  console.error('Usage: node scripts/new-post.mjs "My Post Title"');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const path = `content/posts/${slug}.md`;
if (existsSync(path)) {
  console.error(`Post already exists: ${path}`);
  process.exit(1);
}

const frontmatter = `---
title: "${title}"
slug: ${slug}
excerpt: ""
publishedAt:
tags: []
---

`;

writeFileSync(path, frontmatter);
console.log(`Created ${path}`);
