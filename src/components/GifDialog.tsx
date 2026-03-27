import { useEffect, useRef } from 'react';
import { X, Download, Share2 } from 'lucide-react';
import type { Gif } from '@/lib/queries';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useSwipeToDismiss } from '@/hooks/useSwipeToDismiss';

interface GifDialogProps {
  gif: Gif;
  onClose: () => void;
}

export function GifDialog({ gif, onClose }: GifDialogProps) {
  const trapRef = useFocusTrap<HTMLDivElement>();
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const swipe = useSwipeToDismiss(panelRef, onClose, { checkScrollLimits: true, scrollRef });
  const canShare = typeof navigator.share === 'function';
  const ext = gif.src.split('.').pop() || 'gif';
  const formatOptions = [
    gif.srcMp4 ? { label: 'MP4', src: gif.srcMp4, ext: 'mp4' } : null,
    gif.srcWebp ? { label: 'WebP', src: gif.srcWebp, ext: 'webp' } : null,
    gif.srcGif ? { label: 'GIF', src: gif.srcGif, ext: 'gif' } : null,
  ].filter(Boolean) as { label: string; src: string; ext: string }[];
  const downloadFormats =
    formatOptions.length > 0 ? formatOptions : [{ label: ext.toUpperCase(), src: gif.src, ext }];

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
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

  // Close on scroll-wheel over the backdrop (not the panel)
  useEffect(() => {
    const backdrop = backdropRef.current;
    if (!backdrop) return;
    function onWheel(e: WheelEvent) {
      if (e.target === backdrop) {
        e.preventDefault();
        onClose();
      }
    }
    backdrop.addEventListener('wheel', onWheel, { passive: false });
    return () => backdrop.removeEventListener('wheel', onWheel);
  }, [onClose]);

  async function handleDownload(src: string, dlExt: string) {
    try {
      const res = await fetch(src);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${gif.slug}.${dlExt}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      // Network error
    }
  }

  async function handleShare() {
    try {
      const res = await fetch(gif.src);
      const blob = await res.blob();
      const file = new File([blob], `${gif.slug}.${ext}`, { type: blob.type });
      await navigator.share({ files: [file] });
    } catch {
      // User cancelled or share failed
    }
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- keyboard close handled via useEffect keydown listener
    <div
      ref={(el) => {
        trapRef.current = el;
        backdropRef.current = el;
      }}
      role="dialog"
      aria-modal="true"
      aria-label={gif.alt}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 outline-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground"
        onTouchStart={swipe.onTouchStart}
        onTouchMove={swipe.onTouchMove}
        onTouchEnd={swipe.onTouchEnd}
        onTouchCancel={swipe.onTouchCancel}
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-2 top-2 z-10 rounded-full bg-black/60 p-1.5 text-white/80 transition-colors hover:bg-black/80 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
        <div ref={scrollRef} className="overflow-auto">
          <img src={gif.src} alt={gif.alt} className="w-full" />
        </div>
        <div className="px-3 py-2">
          <div className="flex flex-wrap gap-1">
            {gif.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-1.5 flex items-center justify-end gap-2">
            {downloadFormats.map((fmt) => (
              <button
                key={fmt.ext}
                onClick={() => handleDownload(fmt.src, fmt.ext)}
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Download className="h-3.5 w-3.5" />
                {fmt.label}
              </button>
            ))}
            {canShare && (
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
