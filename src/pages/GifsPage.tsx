import { useState, useMemo, useRef, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { SearchInput } from '@/components/SearchInput';
import { TagFilter } from '@/components/TagFilter';
import { GifDialog } from '@/components/GifDialog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useModalState } from '@/hooks/useModalState';
import { gifs } from '@/data/gifs';
import { collectTags, filterTagged } from '@/lib/tagged';
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

const getGifTags = (g: Gif) => g.tags;
const gifTags = collectTags(gifs, getGifTags);

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

  const filtered = useMemo(
    () => filterTagged(shuffled, activeTag, search, (g) => g.alt, getGifTags),
    [shuffled, search, activeTag, getGifTags],
  );

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
      <PageHeader title="GIFs" backTo={{ label: 'Projects', path: '/projects' }} />

      <div className="mb-6 space-y-3">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setVisibleCount(BATCH_SIZE);
          }}
          placeholder="Search by name or tag..."
          label="Search GIFs by name or tag"
        />
        <TagFilter
          tags={gifTags}
          activeTag={activeTag}
          onTagChange={(tag) => {
            setActiveTag(tag);
            setVisibleCount(BATCH_SIZE);
          }}
        />
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
