import { useRef, useEffect, useMemo, useCallback } from 'react';
import { GifDialog } from './GifDialog';
import { GifVideo, type GifVideoHandle } from './GifVideo';
import { useModalState } from '@/hooks/useModalState';
import type { Gif } from '@/lib/queries';

const AUTO_SCROLL_PX_PER_SEC = 30;

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

export function GifCarousel({ gifs }: { gifs: Gif[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const modal = useModalState<Gif>();
  const videoRefs = useRef<Map<number, GifVideoHandle>>(new Map());

  const shuffled = useMemo(() => shuffle(gifs), [gifs]);

  // Render items twice for seamless looping
  const loopItems = useMemo(() => {
    if (shuffled.length === 0) return [];
    return [...shuffled, ...shuffled];
  }, [shuffled]);

  // Shared IntersectionObserver to play/pause videos based on visibility
  const observerRef = useRef<IntersectionObserver | null>(null);
  const buttonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const buttonIndexMap = useRef<WeakMap<Element, number>>(new WeakMap());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = buttonIndexMap.current.get(entry.target);
          if (idx == null) continue;
          const handle = videoRefs.current.get(idx);
          if (!handle) continue;
          if (entry.isIntersecting) {
            handle.play();
          } else {
            handle.pause();
          }
        }
      },
      { root: scrollRef.current, rootMargin: '200px' },
    );
    observerRef.current = observer;

    // Observe all current buttons
    for (const [idx, el] of buttonRefs.current) {
      buttonIndexMap.current.set(el, idx);
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [loopItems.length]);

  const setButtonRef = useCallback((idx: number, el: HTMLButtonElement | null) => {
    if (el) {
      buttonRefs.current.set(idx, el);
      buttonIndexMap.current.set(el, idx);
      observerRef.current?.observe(el);
    } else {
      const prev = buttonRefs.current.get(idx);
      if (prev) {
        observerRef.current?.unobserve(prev);
        buttonIndexMap.current.delete(prev);
      }
      buttonRefs.current.delete(idx);
    }
  }, []);

  const setVideoRef = useCallback((idx: number, handle: GifVideoHandle | null) => {
    if (handle) {
      videoRefs.current.set(idx, handle);
    } else {
      videoRefs.current.delete(idx);
    }
  }, []);

  // Auto-scroll with infinite loop — when we reach the halfway point
  // (end of first copy), silently jump back to the start.
  // Respects prefers-reduced-motion by not auto-scrolling.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || shuffled.length === 0) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    let prev: number | null = null;
    let accum = 0;
    let raf: number;

    function step(time: number) {
      if (prev !== null && !paused.current) {
        const dt = (time - prev) / 1000;
        accum += AUTO_SCROLL_PX_PER_SEC * dt;
        const px = Math.floor(accum);
        if (px >= 1) {
          accum -= px;
          el!.scrollLeft += px;
          // When past the first set of items, jump back seamlessly
          const halfWidth = el!.scrollWidth / 2;
          if (el!.scrollLeft >= halfWidth) {
            el!.scrollLeft -= halfWidth;
          }
        }
      }
      prev = time;
      raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [shuffled.length]);

  function pause() {
    paused.current = true;
  }
  function resume() {
    paused.current = false;
  }

  if (shuffled.length === 0) return null;

  return (
    <div
      className="group/carousel relative min-w-0"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- scrollable region needs keyboard access (axe: scrollable-region-focusable) */}
      <div
        ref={scrollRef}
        tabIndex={0}
        role="region"
        aria-label="Featured GIFs"
        className="gif-carousel flex w-full gap-4 overflow-x-auto pb-2 focus:outline-none"
      >
        {loopItems.map((gif, i) => (
          <button
            key={`${gif.slug}-${i}`}
            ref={(el) => setButtonRef(i, el)}
            type="button"
            tabIndex={-1}
            onClick={() => modal.open(gif)}
            className="gif-card h-48 flex-none cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-transform hover:scale-[1.02] focus:outline-none sm:h-56"
            style={{ aspectRatio: `${gif.width}/${gif.height}` }}
          >
            <GifVideo
              ref={(handle) => setVideoRef(i, handle)}
              gif={gif}
              lazy
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
      {modal.item && <GifDialog gif={modal.item} onClose={modal.close} />}
    </div>
  );
}
