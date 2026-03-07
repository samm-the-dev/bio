import { useEffect, useState } from 'react';
import { sanityClient } from '@/lib/sanity';

const cache = new Map<string, unknown>();

export function useSanityQuery<T>(
  query: string,
  params?: Record<string, unknown>,
): {
  data: T | null;
  loading: boolean;
  error: string | null;
} {
  const cacheKey = query + JSON.stringify(params ?? {});
  const [data, setData] = useState<T | null>((cache.get(cacheKey) as T) ?? null);
  const [loading, setLoading] = useState(!cache.has(cacheKey));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache.has(cacheKey)) return;

    let cancelled = false;
    sanityClient
      .fetch<T>(query, params ?? {})
      .then((result) => {
        if (cancelled) return;
        cache.set(cacheKey, result);
        setData(result);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch content');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey, query, params]);

  return { data, loading, error };
}
