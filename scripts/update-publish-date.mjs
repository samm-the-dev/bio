/**
 * Pre-commit hook script: updates publishedAt in blog posts.
 * Only touches posts that already have a publishedAt value (skips drafts).
 * Called by lint-staged on content/posts/*.md files.
 */

import { readFileSync, writeFileSync } from 'node:fs';

const files = process.argv.slice(2);

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

  // Only update if publishedAt has an existing value (not empty/missing)
  const updated = content.replace(
    /^(publishedAt:[ \t]+)\S.+$/m,
    `$1${timestamp}`,
  );

  if (updated !== content) {
    writeFileSync(file, updated, 'utf-8');
  }
}
