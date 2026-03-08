import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Gif } from '@/lib/queries';

export function GifCarousel({ gifs }: { gifs: Gif[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  function scroll(direction: 'left' | 'right') {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  }

  if (gifs.length === 0) return null;

  return (
    <div className="group/carousel relative min-w-0">
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-card/90 p-1.5 text-muted-foreground opacity-0 backdrop-blur-sm transition-opacity hover:text-foreground group-hover/carousel:opacity-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <div ref={scrollRef} className="gif-carousel flex w-full gap-4 overflow-x-auto pb-2">
        {gifs.map((gif) => (
          <a
            key={gif.slug}
            href={gif.tenor}
            target="_blank"
            rel="noopener noreferrer"
            className="gif-card flex-none overflow-hidden rounded-lg border border-border bg-card transition-transform hover:scale-[1.02]"
          >
            <img
              src={gif.src}
              alt={gif.alt}
              loading="lazy"
              className="h-48 w-auto object-cover sm:h-56"
            />
          </a>
        ))}
      </div>
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-card/90 p-1.5 text-muted-foreground opacity-0 backdrop-blur-sm transition-opacity hover:text-foreground group-hover/carousel:opacity-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
