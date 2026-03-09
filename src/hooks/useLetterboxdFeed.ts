import { letterboxdEntries as buildTimeEntries } from '@/data/letterboxd';

export function useLetterboxdFeed(_enabled = true) {
  return { entries: buildTimeEntries, loading: false, error: null };
}
