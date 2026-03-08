import { useEffect } from 'react';
import { X, Download, Share2 } from 'lucide-react';
import type { Gif } from '@/lib/queries';

interface GifDialogProps {
  gif: Gif;
  onClose: () => void;
}

export function GifDialog({ gif, onClose }: GifDialogProps) {
  const canShare = typeof navigator.share === 'function';
  const ext = gif.src.split('.').pop() || 'gif';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  async function handleDownload() {
    const res = await fetch(gif.src);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${gif.slug}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
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
    <div
      role="dialog"
      aria-label={gif.alt}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
        <div className="flex items-center justify-between gap-4 px-4 pb-2 pt-4">
          <div className="flex items-center gap-2">
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
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-auto px-4 pb-4">
          <img src={gif.src} alt={gif.alt} className="w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}
