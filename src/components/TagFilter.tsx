import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TagFilterProps {
  tags: string[];
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
  /** Number of tags to show before collapsing. Defaults to 4. */
  visibleCount?: number;
}

export function TagFilter({ tags, activeTag, onTagChange, visibleCount = 4 }: TagFilterProps) {
  const [expanded, setExpanded] = useState(false);

  if (tags.length === 0) return null;

  const shown = expanded ? tags : tags.slice(0, visibleCount);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {shown.map((tag) => (
        <button
          key={tag}
          type="button"
          aria-pressed={activeTag === tag}
          onClick={() => onTagChange(activeTag === tag ? null : tag)}
          className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
            activeTag === tag
              ? 'border-foreground bg-foreground text-background'
              : 'border-border bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          {tag}
        </button>
      ))}
      {tags.length > visibleCount && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {expanded ? (
            <>
              Less <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              +{tags.length - visibleCount} more <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
