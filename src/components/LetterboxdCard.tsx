import { useState } from 'react';
import type { LetterboxdEntry } from '@/lib/queries';
import { formatDate } from '@/lib/formatDate';
import { Film, Heart, RotateCcw } from 'lucide-react';
import { LetterboxdDialog } from '@/components/LetterboxdDialog';
import { FeedCard } from '@/components/FeedCard';

interface LetterboxdCardProps {
  entry: LetterboxdEntry;
}

function StarRating({ rating }: { rating: string }) {
  const num = parseFloat(rating);
  const fullStars = Math.floor(num);
  const halfStar = num % 1 >= 0.5;
  return (
    <span className="text-sm" aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(fullStars)}
      {halfStar && '½'}
    </span>
  );
}

const parser = new DOMParser();

function getReviewPreview(html: string): { previewHtml: string; hasMore: boolean } {
  const doc = parser.parseFromString(html, 'text/html');
  const topBlocks = doc.body.children;

  // Spoiler reviews: show only the spoiler warning line
  if (html.includes('may contain spoilers')) {
    for (const el of topBlocks) {
      if (el.tagName === 'P' && el.querySelector('em')?.textContent?.includes('spoilers')) {
        return { previewHtml: el.outerHTML, hasMore: topBlocks.length > 1 };
      }
    }
  }

  if (topBlocks.length === 0) return { previewHtml: html, hasMore: false };

  const preview: string[] = [];
  const limit = 3;
  for (let i = 0; i < Math.min(limit, topBlocks.length); i++) {
    preview.push(topBlocks[i].outerHTML);
  }
  return { previewHtml: preview.join(''), hasMore: topBlocks.length > limit };
}

export function LetterboxdCard({ entry }: LetterboxdCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FeedCard onClick={() => setOpen(true)}>
        {/* Top row: info + poster */}
        <div className="flex">
          <div className="min-w-0 flex-1 p-4">
            <div className="flex items-center gap-2">
              <Film className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                Letterboxd
              </span>
            </div>
            <h2 className="mt-2 font-semibold text-card-foreground">
              {entry.filmTitle}
              {entry.filmYear && (
                <span className="ml-1 font-normal text-muted-foreground">({entry.filmYear})</span>
              )}
            </h2>
            <div className="mt-1 flex h-5 items-center gap-2">
              {entry.rating && <StarRating rating={entry.rating} />}
              {entry.isLiked && (
                <Heart
                  className="h-3.5 w-3.5 fill-muted-foreground text-muted-foreground"
                  aria-label="Liked"
                />
              )}
              {entry.isRewatch && (
                <RotateCcw className="h-3 w-3 text-muted-foreground" aria-label="Rewatch" />
              )}
            </div>
            <time className="mt-2 block text-xs text-muted-foreground" dateTime={entry.publishedAt}>
              {formatDate(entry.publishedAt)}
            </time>
          </div>
          {entry.posterUrl && (
            <div className="aspect-[2/3] w-20 shrink-0">
              <img
                src={entry.posterUrl}
                alt={`${entry.filmTitle} poster`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          )}
        </div>

        {/* Review preview below */}
        {entry.reviewHtml &&
          (() => {
            const { previewHtml, hasMore } = getReviewPreview(entry.reviewHtml);
            return (
              <div className="border-t border-border px-4 py-3 text-sm text-card-foreground [&_blockquote]:border-l-2 [&_blockquote]:border-muted-foreground/30 [&_blockquote]:pl-3 [&_blockquote_p:first-child]:mt-0 [&_blockquote_p]:mt-1.5 [&_em]:italic [&_p:first-child]:mt-0 [&_p]:mt-1.5">
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                {hasMore && (
                  <span className="mt-1 block text-sm text-muted-foreground/60">...</span>
                )}
              </div>
            );
          })()}
      </FeedCard>

      {open && <LetterboxdDialog entry={entry} onClose={() => setOpen(false)} />}
    </>
  );
}
