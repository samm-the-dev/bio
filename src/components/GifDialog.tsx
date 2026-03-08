import { useEffect, useRef, useCallback } from 'react';
import { X, Download, Share2 } from 'lucide-react';
import type { Gif } from '@/lib/queries';

interface GifDialogProps {
  gif: Gif;
  onClose: () => void;
}

const SWIPE_THRESHOLD = 80;

export function GifDialog({ gif, onClose }: GifDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ y: number; time: number } | null>(null);
  const translateY = useRef(0);
  const canShare = typeof navigator.share === 'function';
  const ext = gif.src.split('.').pop() || 'gif';

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

  // Close on scroll-wheel over the backdrop (not the panel)
  const backdropRef = useRef<HTMLDivElement>(null);
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

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { y: e.touches[0]!.clientY, time: Date.now() };
    translateY.current = 0;
    const panel = panelRef.current;
    if (panel) panel.style.transition = 'none';
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dy = e.touches[0]!.clientY - touchStart.current.y;
    translateY.current = dy;
    const panel = panelRef.current;
    if (panel) {
      panel.style.transform = `translateY(${dy}px)`;
      panel.style.opacity = `${Math.max(0.2, 1 - Math.abs(dy) / 400)}`;
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    const panel = panelRef.current;
    const dy = translateY.current;
    const absDy = Math.abs(dy);
    const elapsed = touchStart.current ? Date.now() - touchStart.current.time : 1000;
    const velocity = absDy / Math.max(elapsed, 1);
    touchStart.current = null;

    if (absDy > SWIPE_THRESHOLD || velocity > 0.5) {
      const direction = dy > 0 ? '100vh' : '-100vh';
      if (panel) {
        panel.style.transition = 'transform 200ms ease-out, opacity 200ms ease-out';
        panel.style.transform = `translateY(${direction})`;
        panel.style.opacity = '0';
      }
      setTimeout(onClose, 200);
    } else if (panel) {
      panel.style.transition = 'transform 200ms ease-out, opacity 200ms ease-out';
      panel.style.transform = '';
      panel.style.opacity = '';
    }
  }, [onClose]);

  async function handleDownload() {
    try {
      const res = await fetch(gif.src);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${gif.slug}.${ext}`;
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
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-label={gif.alt}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground outline-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-2 top-2 z-10 rounded-full bg-black/60 p-1.5 text-white/80 transition-colors hover:bg-black/80 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="overflow-auto">
          <img src={gif.src} alt={gif.alt} className="w-full" />
        </div>
        <div className="flex items-center justify-end gap-2 px-3 py-2">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
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
  );
}
