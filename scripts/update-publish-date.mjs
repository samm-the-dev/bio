/**
 * Pre-commit hook script: updates publishedAt in blog posts.
 * Only touches posts that already have a publishedAt value (skips drafts).
 * Skips metadata-only changes (tags, excerpt, etc.) -- only updates when
 * the post body has actually changed.
 * Called by lint-staged on content/posts/*.md files.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const files = process.argv.slice(2);

function extractBody(content) {
  const closing = content.indexOf('\n---\n', content.indexOf('---\n') + 4);
  return closing === -1 ? content : content.slice(closing + 5);
}

function getCommittedBody(file) {
  try {
    const committed = execSync(`git show HEAD:${file.replace(/\\/g, '/')}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return extractBody(committed);
  } catch {
    return null; // New file
  }
}

function formatLocalISO() {
  const now = new Date();
  const offset = -now.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const h = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
  const m = String(Math.abs(offset) % 60).padStart(2, '0');
  const pad = (n, len = 2) => String(n).padStart(len, '0');

  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}` +
    `${sign}${h}:${m}`
  );
}

const timestamp = formatLocalISO();

for (const file of files) {
  const content = readFileSync(file, 'utf-8');

  // Skip if no publishedAt value (draft post)
  if (!/^publishedAt:[ \t]+\S/m.test(content)) continue;

  // Skip metadata-only changes (body unchanged from last commit)
  const committedBody = getCommittedBody(file);
  if (committedBody !== null && extractBody(content) === committedBody) continue;

  const updated = content.replace(
    /^(publishedAt:[ \t]+)\S.+$/m,
    `$1${timestamp}`,
  );

  if (updated !== content) {
    writeFileSync(file, updated, 'utf-8');
  }
}
