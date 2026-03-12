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

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const datePrefix = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;

const path = `content/posts/${datePrefix}-${slug}.md`;
if (existsSync(path)) {
  console.error(`Post already exists: ${path}`);
  process.exit(1);
}

const safeTitle = title.replace(/"/g, '\\"');
const frontmatter = `---
title: "${safeTitle}"
slug: ${slug}
excerpt: ""
publishedAt:
tags: []
---

`;

writeFileSync(path, frontmatter);
console.log(`Created ${path}`);
