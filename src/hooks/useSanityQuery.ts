import { useEffect, useSyncExternalStore } from 'react';
import { sanityClient } from '@/lib/sanity';

type CacheEntry<T> = { data: T; error: null } | { data: null; error: string };

const cache = new Map<string, CacheEntry<unknown>>();
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify() {
  listeners.forEach((cb) => cb());
}

export function useSanityQuery<T>(
  query: string,
  params?: Record<string, unknown>,
): {
  data: T | null;
  loading: boolean;
  error: string | null;
} {
  const cacheKey = query + JSON.stringify(params ?? {});

  const entry = useSyncExternalStore(subscribe, () => cache.get(cacheKey)) as
    | CacheEntry<T>
    | undefined;

  useEffect(() => {
    if (cache.has(cacheKey)) return;

    let cancelled = false;
    sanityClient
      .fetch<T>(query, params ?? {})
      .then((result) => {
        if (cancelled) return;
        cache.set(cacheKey, { data: result, error: null });
        notify();
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        cache.set(cacheKey, {
          data: null,
          error: err instanceof Error ? err.message : 'Failed to fetch content',
        });
        notify();
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!entry) return { data: null, loading: true, error: null };
  return { data: entry.data as T | null, loading: false, error: entry.error };
}
