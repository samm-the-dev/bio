import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TagFilterProps {
  tags: string[];
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
}

// Matches SCREENS in src/lib/screens.ts — visible tier per breakpoint: mobile=3, sm=5, md=7, lg+=all
function getVisibilityClass(i: number): string {
  if (i < 3) return '';
  if (i < 5) return 'hidden sm:inline-flex';
  if (i < 7) return 'hidden md:inline-flex';
  return 'hidden lg:inline-flex';
}

// Hide the More button once all tags are CSS-visible at the current breakpoint
function getMoreButtonHideClass(total: number): string {
  if (total <= 5) return 'sm:hidden';
  if (total <= 7) return 'md:hidden';
  return 'lg:hidden';
}

export function TagFilter({ tags, activeTag, onTagChange }: TagFilterProps) {
  const [expanded, setExpanded] = useState(false);

  if (tags.length === 0) return null;

  const hasHidden = tags.length > 3;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag, i) => (
        <button
          key={tag}
          type="button"
          aria-pressed={activeTag === tag}
          onClick={() => onTagChange(activeTag === tag ? null : tag)}
          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs transition-colors ${
            activeTag === tag
              ? 'border-foreground bg-foreground text-background'
              : 'border-border bg-card text-muted-foreground hover:text-foreground'
          } ${expanded ? '' : getVisibilityClass(i)}`}
        >
          {tag}
        </button>
      ))}
      {(hasHidden || expanded) && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((e) => !e)}
          className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground${!expanded ? ` ${getMoreButtonHideClass(tags.length)}` : ''}`}
        >
          {expanded ? (
            <>
              Less <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              More <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
