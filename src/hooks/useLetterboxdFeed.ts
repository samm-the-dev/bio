import { letterboxdEntries as buildTimeEntries } from '@/data/letterboxd';

export function useLetterboxdFeed() {
  return { entries: buildTimeEntries, loading: false, error: null };
}
