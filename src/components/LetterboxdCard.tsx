import type { LetterboxdEntry } from '@/lib/queries';
import { formatDate } from '@/lib/formatDate';
import { Film } from 'lucide-react';

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

export function LetterboxdCard({ entry }: LetterboxdCardProps) {
  return (
    <a
      href={entry.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-lg border border-border bg-card p-4"
    >
      <div className="flex items-center gap-2">
        <Film className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Letterboxd</span>
      </div>
      <div className="mt-2 flex gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-card-foreground group-hover:text-primary">
            {entry.filmTitle}
            {entry.filmYear && (
              <span className="ml-1 font-normal text-muted-foreground">({entry.filmYear})</span>
            )}
          </h2>
          <div className="mt-1 flex items-center gap-2">
            {entry.rating && <StarRating rating={entry.rating} />}
            {entry.isRewatch && <span className="text-xs text-muted-foreground">rewatch</span>}
          </div>
          {entry.review && (
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{entry.review}</p>
          )}
          <time className="mt-1 block text-xs text-muted-foreground" dateTime={entry.publishedAt}>
            {formatDate(entry.publishedAt)}
          </time>
        </div>
        {entry.posterUrl && (
          <img
            src={entry.posterUrl}
            alt={`${entry.filmTitle} poster`}
            className="h-24 w-16 shrink-0 rounded object-cover"
          />
        )}
      </div>
    </a>
  );
}
