import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';
import { shareUrl } from './share';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('shareUrl', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Default: no navigator.share, working clipboard
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it('uses navigator.share when available', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { share: shareMock, clipboard: { writeText: vi.fn() } });

    await shareUrl('https://example.com', 'Example');

    expect(shareMock).toHaveBeenCalledWith({ title: 'Example', url: 'https://example.com' });
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it('falls back to clipboard when navigator.share throws non-abort error', async () => {
    const shareMock = vi.fn().mockRejectedValue(new Error('not supported'));
    vi.stubGlobal('navigator', {
      share: shareMock,
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    await shareUrl('https://example.com');

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com');
    expect(toast.success).toHaveBeenCalledWith('Link copied!');
  });

  it('silently returns when navigator.share is aborted by user', async () => {
    const abort = new DOMException('Aborted', 'AbortError');
    vi.stubGlobal('navigator', {
      share: vi.fn().mockRejectedValue(abort),
      clipboard: { writeText: vi.fn() },
    });

    await shareUrl('https://example.com');

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('copies to clipboard and shows success toast', async () => {
    await shareUrl('https://example.com');

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com');
    expect(toast.success).toHaveBeenCalledWith('Link copied!');
  });

  it('shows error toast when clipboard fails', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });

    await shareUrl('https://example.com');

    expect(toast.error).toHaveBeenCalledWith('Could not copy link');
  });
});
