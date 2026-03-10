import { toast } from 'sonner';

export async function shareUrl(url: string, title?: string) {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return;
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    toast.success('Link copied!');
  } catch {
    toast.error('Could not copy link');
  }
}
