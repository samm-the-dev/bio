import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SearchInput } from '@/components/SearchInput';
import { TagFilter } from '@/components/TagFilter';
import { GifDialog } from '@/components/GifDialog';
import { GifVideo, type GifVideoHandle } from '@/components/GifVideo';
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
function toSlug(tag: string) {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const tagSlugMap = new Map(gifTags.map((t) => [toSlug(t), t]));

export function GifsPage() {
  const { tagSlug } = useParams<{ tagSlug?: string }>();
  const urlTag = tagSlug ? (tagSlugMap.get(tagSlug) ?? null) : null;
  useDocumentTitle(urlTag ? `${urlTag} GIFs` : 'GIFs');
  const navigate = useNavigate();
  const modal = useModalState<Gif>();
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(urlTag);

  // Sync activeTag when URL param changes (navigating between tag routes)
  useEffect(() => {
    setActiveTag(urlTag);
  }, [urlTag]);

  // Update URL when tag filter is toggled
  const handleTagChange = (tag: string | null) => {
    setActiveTag(tag);
    if (tag) {
      navigate(`/projects/gifs/tag/${toSlug(tag)}`, { replace: true });
    } else {
      navigate('/projects/gifs', { replace: true });
    }
  };

  const shuffled = useMemo(() => shuffle(gifs), []);

  const filtered = useMemo(
    () => filterTagged(shuffled, activeTag, search, (g) => g.alt, getGifTags),
    [shuffled, search, activeTag],
  );

  // Infinite scroll batching
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset batch count when filters change
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [filtered]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry!.isIntersecting) setVisibleCount((n) => n + BATCH_SIZE);
      },
      { rootMargin: '600px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, visibleCount]);

  // Single shared IntersectionObserver for all grid cards
  const videoHandles = useRef<Map<string, GifVideoHandle>>(new Map());
  const elementMap = useRef<WeakMap<Element, string>>(new WeakMap());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const slug = elementMap.current.get(entry.target);
          if (!slug) continue;
          const handle = videoHandles.current.get(slug);
          if (!handle) continue;
          if (entry.isIntersecting) handle.play();
          else handle.pause();
        }
      },
      { rootMargin: OFFSCREEN_MARGIN },
    );
    observerRef.current = observer;
    return () => observer.disconnect();
  }, []);

  // Show back-to-top FAB after scrolling down
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    function onScroll() {
      setShowTop(window.scrollY > 600);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const registerCard = useCallback((slug: string, el: HTMLButtonElement | null) => {
    if (el) {
      elementMap.current.set(el, slug);
      observerRef.current?.observe(el);
    }
  }, []);

  const registerVideo = useCallback((slug: string, handle: GifVideoHandle | null) => {
    if (handle) videoHandles.current.set(slug, handle);
    else videoHandles.current.delete(slug);
  }, []);

  return (
    <div className="mx-auto max-w-4xl overflow-x-hidden">
      <PageHeader title="GIFs" backTo={{ label: 'Projects', path: '/projects' }} />

      <div className="mb-6 space-y-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name or tag..."
          label="Search GIFs by name or tag"
        />
        <TagFilter tags={gifTags} activeTag={activeTag} onTagChange={handleTagChange} />
      </div>

      <div className="columns-1 gap-4 sm:columns-2">
        {visible.map((gif) => {
          const ratio = gif.width && gif.height ? gif.width / gif.height : 4 / 3;
          return (
            <button
              key={gif.slug}
              ref={(el) => registerCard(gif.slug, el)}
              type="button"
              onClick={() => modal.open(gif)}
              aria-label={gif.alt}
              className="mb-4 block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-lg border border-border bg-card hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            >
              <GifVideo
                ref={(handle) => registerVideo(gif.slug, handle)}
                gif={gif}
                lazy
                className="w-full"
                style={{ aspectRatio: ratio }}
              />
            </button>
          );
        })}
      </div>

      {hasMore && <div ref={sentinelRef} className="h-px" />}

      {filtered.length === 0 && (
        <p className="mt-4 text-center text-sm text-muted-foreground">No GIFs match your search.</p>
      )}

      {modal.item && <GifDialog gif={modal.item} onClose={modal.close} />}

      {showTop && (
        <div className="fixed inset-x-0 bottom-6 z-40 mx-auto w-full max-w-4xl px-4">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            className="absolute -right-2 bottom-0 rounded-full border border-border bg-card p-3 text-muted-foreground shadow-lg transition-colors hover:bg-muted hover:text-foreground max-lg:right-4"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
