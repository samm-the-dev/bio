import { useState, useMemo, useRef, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { GifDialog } from '@/components/GifDialog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useModalState } from '@/hooks/useModalState';
import { gifs } from '@/data/gifs';
import type { Gif } from '@/lib/queries';

const BATCH_SIZE = 40;
const OFFSCREEN_MARGIN = '400px';

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }
  return copy;
}

/**
 * Always shows the animated GIF when near the viewport.
 * When far off-screen, replaces with an aspect-ratio placeholder to free memory.
 */
function LazyGifCard({ gif, onClick }: { gif: Gif; onClick: () => void }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [near, setNear] = useState(false);
  const ratio = gif.width && gif.height ? gif.width / gif.height : 4 / 3;

  useEffect(() => {
    const el = btnRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setNear(entry!.isIntersecting), {
      rootMargin: OFFSCREEN_MARGIN,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      className="mb-4 block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-lg border border-border bg-card transition-transform hover:scale-[1.02]"
    >
      {near ? (
        <img
          src={gif.src}
          alt={gif.alt}
          decoding="async"
          className="w-full"
          style={{ aspectRatio: ratio }}
        />
      ) : (
        <div className="w-full bg-card" style={{ aspectRatio: ratio }} />
      )}
    </button>
  );
}

export function GifsPage() {
  useDocumentTitle('GIFs');
  const modal = useModalState<Gif>();
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const shuffled = useMemo(() => shuffle(gifs), []);

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const g of gifs) {
      for (const t of g.tags) {
        counts.set(t, (counts.get(t) || 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([tag]) => tag);
  }, []);

  const filtered = useMemo(() => {
    let result = shuffled;
    if (activeTag) {
      result = result.filter((g) => g.tags.includes(activeTag));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) => g.alt.toLowerCase().includes(q) || g.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [shuffled, search, activeTag]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Auto-load next batch when sentinel scrolls into view
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry!.isIntersecting) {
          setVisibleCount((n) => n + BATCH_SIZE);
        }
      },
      { rootMargin: '600px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, visibleCount]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="GIFs" />

      <input
        type="search"
        aria-label="Search GIFs by name or tag"
        placeholder="Search by name or tag..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setVisibleCount(BATCH_SIZE);
        }}
        className="mb-4 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground/30 focus:outline-none"
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <button
            key={tag}
            type="button"
            aria-pressed={activeTag === tag}
            onClick={() => {
              setActiveTag(activeTag === tag ? null : tag);
              setVisibleCount(BATCH_SIZE);
            }}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              activeTag === tag
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="columns-1 gap-4 sm:columns-2">
        {visible.map((gif) => (
          <LazyGifCard key={gif.slug} gif={gif} onClick={() => modal.open(gif)} />
        ))}
      </div>

      {hasMore && <div ref={sentinelRef} className="h-px" />}

      {filtered.length === 0 && (
        <p className="mt-4 text-center text-sm text-muted-foreground">No GIFs match your search.</p>
      )}

      {modal.item && <GifDialog gif={modal.item} onClose={modal.close} />}
    </div>
  );
}
