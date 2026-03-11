import { useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TagFilterProps {
  tags: string[];
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
}

function getStepCount(containerW: number, total: number): number {
  if (containerW < 320) return Math.min(1, total);
  if (containerW < 480) return Math.min(2, total);
  if (containerW < 640) return Math.min(3, total);
  if (containerW < 800) return Math.min(5, total);
  return total;
}

export function TagFilter({ tags, activeTag, onTagChange }: TagFilterProps) {
  const [expanded, setExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(tags.length);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (expanded) {
      setVisibleCount(tags.length);
      return;
    }

    const calc = () => {
      if (!containerRef.current) return;
      setVisibleCount(getStepCount(containerRef.current.offsetWidth, tags.length));
    };

    calc();
    const ro = new ResizeObserver(calc);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [tags.length, expanded]);

  if (tags.length === 0) return null;

  const hiddenCount = expanded ? 0 : tags.length - visibleCount;

  return (
    <div ref={containerRef} className="flex flex-wrap items-center gap-1.5">
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
