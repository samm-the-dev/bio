import { useEffect, useRef, useState } from 'react';
import { X, Film, Heart, RotateCcw, ExternalLink } from 'lucide-react';
import type { LetterboxdEntry } from '@/lib/queries';
import { formatDate } from '@/lib/formatDate';
import { ImageLightbox } from '@/components/ImageLightbox';

interface LetterboxdDialogProps {
  entry: LetterboxdEntry;
  onClose: () => void;
}

function StarRating({ rating }: { rating: string }) {
  const num = parseFloat(rating);
  const fullStars = Math.floor(num);
  const halfStar = num % 1 >= 0.5;
  return (
    <span className="text-base" aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(fullStars)}
      {halfStar && '½'}
    </span>
  );
}

export function LetterboxdDialog({ entry, onClose }: LetterboxdDialogProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [showPoster, setShowPoster] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- keyboard close handled via useEffect
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${entry.filmTitle} on Letterboxd`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-card text-card-foreground outline-none"
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-2 top-2 z-10 rounded-full bg-black/60 p-1.5 text-white/80 transition-colors hover:bg-black/80 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex">
          {/* Poster flush to left edge */}
          {entry.posterUrl && (
            <button
              type="button"
              onClick={() => setShowPoster(true)}
              className="shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <img
                src={entry.posterUrl}
                alt={`${entry.filmTitle} poster`}
                className="h-full w-32 object-cover transition-opacity hover:opacity-80"
              />
            </button>
          )}
          <div className="min-w-0 flex-1 p-4">
            <div className="flex items-center gap-2">
              <Film className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Letterboxd</span>
            </div>
            <h2 className="mt-2 text-lg font-semibold text-card-foreground">
              {entry.filmTitle}
              {entry.filmYear && (
                <span className="ml-1 text-base font-normal text-muted-foreground">
                  ({entry.filmYear})
                </span>
              )}
            </h2>
            <div className="mt-1 flex h-6 items-center gap-2">
              {entry.rating && <StarRating rating={entry.rating} />}
              {entry.isLiked && (
                <Heart
                  className="h-4 w-4 fill-muted-foreground text-muted-foreground"
                  aria-label="Liked"
                />
              )}
              {entry.isRewatch && (
                <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" aria-label="Rewatch" />
              )}
            </div>
          </div>
        </div>

        {entry.reviewHtml && (
          <div
            className="border-t border-border px-4 py-3 text-sm leading-relaxed text-muted-foreground [&_blockquote]:border-l-2 [&_blockquote]:border-muted-foreground/30 [&_blockquote]:pl-3 [&_blockquote_p:first-child]:mt-0 [&_blockquote_p]:mt-2 [&_em]:italic [&_p:first-child]:mt-0 [&_p]:mt-2"
            dangerouslySetInnerHTML={{ __html: entry.reviewHtml }}
          />
        )}

        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <time dateTime={entry.publishedAt}>{formatDate(entry.publishedAt)}</time>
        </div>
        <a
          href={entry.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 border-t border-border py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          View on Letterboxd
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {showPoster && entry.posterUrl && (
        <ImageLightbox
          images={[{ src: entry.posterUrl, alt: `${entry.filmTitle} poster` }]}
          onClose={() => setShowPoster(false)}
        />
      )}
    </div>
  );
}
