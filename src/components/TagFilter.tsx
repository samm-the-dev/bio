import { useLayoutEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SCREENS } from '@/lib/screens';

interface TagFilterProps {
  tags: string[];
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
}

function getStepCount(total: number): number {
  const w = window.innerWidth;
  if (w < SCREENS.sm) return Math.min(3, total);
  if (w < SCREENS.lg) return Math.min(6, total);
  return total;
}

export function TagFilter({ tags, activeTag, onTagChange }: TagFilterProps) {
  const [expanded, setExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(() =>
    expanded ? tags.length : getStepCount(tags.length),
  );

  useLayoutEffect(() => {
    if (expanded) {
      setVisibleCount(tags.length);
      return;
    }

    const calc = () => setVisibleCount(getStepCount(tags.length));
    calc();

    // Fire exactly when CSS breakpoints change — same thresholds as tailwind.config.ts
    const queries = [
      window.matchMedia(`(min-width: ${SCREENS.sm}px)`),
      window.matchMedia(`(min-width: ${SCREENS.lg}px)`),
    ];
    queries.forEach((q) => q.addEventListener('change', calc));
    return () => queries.forEach((q) => q.removeEventListener('change', calc));
  }, [tags.length, expanded]);

  if (tags.length === 0) return null;

  const hiddenCount = expanded ? 0 : tags.length - visibleCount;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag, i) => (
        <button
          key={tag}
          type="button"
          hidden={!expanded && i >= visibleCount}
          aria-pressed={activeTag === tag}
          onClick={() => onTagChange(activeTag === tag ? null : tag)}
          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs transition-colors ${
            activeTag === tag
              ? 'border-foreground bg-foreground text-background'
              : 'border-border bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          {tag}
        </button>
      ))}
      {(hiddenCount > 0 || expanded) && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((e) => !e)}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {expanded ? (
            <>
              Less <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              +{hiddenCount} more <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
