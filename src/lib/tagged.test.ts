import { describe, it, expect } from 'vitest';
import { collectTags, filterTagged } from './tagged';

interface Item {
  name: string;
  tags: string[] | null;
}

const items: Item[] = [
  { name: 'Alpha', tags: ['react', 'typescript'] },
  { name: 'Beta', tags: ['react', 'python'] },
  { name: 'Gamma', tags: ['python'] },
  { name: 'Delta', tags: null },
];

const getTags = (item: Item) => item.tags;
const getSearchText = (item: Item) => item.name;

describe('collectTags', () => {
  it('returns tags sorted by frequency descending', () => {
    const tags = collectTags(items, getTags);
    // react: 2, python: 2, typescript: 1
    expect(tags.slice(0, 2)).toEqual(expect.arrayContaining(['react', 'python']));
    expect(tags).toContain('typescript');
    expect(tags).toHaveLength(3);
  });

  it('returns empty array when no items have tags', () => {
    expect(collectTags([{ name: 'X', tags: null }], getTags)).toEqual([]);
  });

  it('returns empty array for empty input', () => {
    expect(collectTags([], getTags)).toEqual([]);
  });
});

describe('filterTagged', () => {
  it('returns all items when no filter is active', () => {
    const result = filterTagged(items, null, '', getSearchText, getTags);
    expect(result).toEqual(items);
  });

  it('filters by active tag', () => {
    const result = filterTagged(items, 'typescript', '', getSearchText, getTags);
    expect(result).toEqual([items[0]]);
  });

  it('filters by search query matching name', () => {
    const result = filterTagged(items, null, 'gamma', getSearchText, getTags);
    expect(result).toEqual([items[2]]);
  });

  it('filters by search query matching tag', () => {
    const result = filterTagged(items, null, 'python', getSearchText, getTags);
    expect(result).toEqual([items[1], items[2]]);
  });

  it('combines tag and search filters', () => {
    const result = filterTagged(items, 'react', 'alpha', getSearchText, getTags);
    expect(result).toEqual([items[0]]);
  });

  it('returns empty array when nothing matches', () => {
    const result = filterTagged(items, 'react', 'zzz', getSearchText, getTags);
    expect(result).toEqual([]);
  });

  it('handles items with null tags gracefully', () => {
    const result = filterTagged(items, null, 'delta', getSearchText, getTags);
    expect(result).toEqual([items[3]]);
  });
});
