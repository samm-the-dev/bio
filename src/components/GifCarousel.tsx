import { useRef, useEffect, useMemo } from 'react';
import { GifDialog } from './GifDialog';
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

  const shuffled = useMemo(() => shuffle(gifs), [gifs]);

  // Render items twice for seamless looping
  const loopItems = useMemo(() => {
    if (shuffled.length === 0) return [];
    return [...shuffled, ...shuffled];
  }, [shuffled]);

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
      <div ref={scrollRef} className="gif-carousel flex w-full gap-4 overflow-x-auto pb-2">
        {loopItems.map((gif, i) => (
          <button
            key={`${gif.slug}-${i}`}
            type="button"
            onClick={() => modal.open(gif)}
            className="gif-card flex-none cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-transform hover:scale-[1.02]"
          >
            <img
              src={gif.src}
              alt={gif.alt}
              loading="lazy"
              className="h-48 w-auto object-cover sm:h-56"
            />
          </button>
        ))}
      </div>
      {modal.item && <GifDialog gif={modal.item} onClose={modal.close} />}
    </div>
  );
}
