import { useState, useEffect } from 'react';

const query = '(prefers-reduced-motion: reduce)';

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => window.matchMedia?.(query).matches ?? false);

  useEffect(() => {
    const mql = window.matchMedia?.(query);
    if (!mql) return;
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return reduced;
}
