/** Shared types and utilities for tag-based search/filtering. */

export interface Tagged {
  tags: string[] | null;
}

type TagAccessor<T> = (item: T) => string[] | null;

/** Collect unique tags sorted by frequency (descending). */
export function collectTags<T>(items: T[], getTags: TagAccessor<T>): string[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const tag of getTags(item) ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([tag]) => tag);
}

/** Filter items by active tag and search query against searchable text. */
export function filterTagged<T>(
  items: T[],
  activeTag: string | null,
  search: string,
  getSearchText: (item: T) => string,
  getTags: TagAccessor<T>,
): T[] {
  let result = items;
  if (activeTag) {
    result = result.filter((item) => getTags(item)?.includes(activeTag));
  }
  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (item) =>
        getSearchText(item).toLowerCase().includes(q) ||
        (getTags(item) ?? []).some((t) => t.toLowerCase().includes(q)),
    );
  }
  return result;
}
