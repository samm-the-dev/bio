import { createRef } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { GifVideo, type GifVideoHandle } from './GifVideo';
import type { Gif } from '@/lib/queries';

vi.mock('@/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: vi.fn(() => false),
}));

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
const mockReduced = vi.mocked(usePrefersReducedMotion);

const gif: Gif = {
  slug: 'test-gif',
  alt: 'test gif alt',
  src: '/gifs/test.gif',
  srcMp4: '/gifs/mp4/test.mp4',
  srcWebp: '/gifs/webp/test.webp',
  srcGif: '/gifs/test.gif',
  width: 480,
  height: 360,
  tags: ['Test'],
  featured: false,
};

describe('GifVideo', () => {
  beforeEach(() => {
    mockReduced.mockReturnValue(false);
  });

  it('renders a video element with mp4 src', () => {
    render(<GifVideo gif={gif} />);
    const video = screen.getByLabelText('test gif alt');
    expect(video.tagName).toBe('VIDEO');
    expect(video).toHaveAttribute('src', '/gifs/mp4/test.mp4');
  });

  it('renders fallback img when srcMp4 is null', () => {
    const noMp4 = { ...gif, srcMp4: null };
    render(<GifVideo gif={noMp4} />);
    const img = screen.getByAltText('test gif alt');
    expect(img.tagName).toBe('IMG');
    expect(img).toHaveAttribute('src', '/gifs/test.gif');
  });

  it('uses srcGif for fallback img when available', () => {
    const noMp4 = { ...gif, srcMp4: null, src: '/gifs/test.webp', srcGif: '/gifs/gif/test.gif' };
    render(<GifVideo gif={noMp4} />);
    const img = screen.getByAltText('test gif alt');
    expect(img).toHaveAttribute('src', '/gifs/gif/test.gif');
  });

  it('defers src when lazy', () => {
    render(<GifVideo gif={gif} lazy />);
    const video = screen.getByLabelText('test gif alt');
    expect(video).not.toHaveAttribute('src');
  });

  it('activates src when play() is called on lazy video', () => {
    const ref = createRef<GifVideoHandle>();
    render(<GifVideo ref={ref} gif={gif} lazy />);

    // jsdom doesn't implement HTMLMediaElement.play()
    const video = screen.getByLabelText('test gif alt') as HTMLVideoElement;
    video.play = vi.fn().mockResolvedValue(undefined);

    act(() => ref.current!.play());

    expect(video).toHaveAttribute('src', '/gifs/mp4/test.mp4');
  });

  it('does not autoPlay when prefers-reduced-motion is active', () => {
    mockReduced.mockReturnValue(true);
    render(<GifVideo gif={gif} />);
    const video = screen.getByLabelText('test gif alt');
    expect(video).not.toHaveAttribute('autoplay');
  });

  it('does not call video.play() when reduced motion is active', () => {
    mockReduced.mockReturnValue(true);
    const ref = createRef<GifVideoHandle>();
    render(<GifVideo ref={ref} gif={gif} lazy />);

    const playSpy = vi.fn().mockResolvedValue(undefined);
    const video = screen.getByLabelText('test gif alt') as HTMLVideoElement;
    video.play = playSpy;

    act(() => ref.current!.play());

    // src should be activated (to show first frame) but play() should not be called
    expect(video).toHaveAttribute('src', '/gifs/mp4/test.mp4');
    expect(playSpy).not.toHaveBeenCalled();
  });

  it('falls back to img when video fires error', () => {
    render(<GifVideo gif={gif} />);
    const video = screen.getByLabelText('test gif alt');
    expect(video.tagName).toBe('VIDEO');

    fireEvent.error(video);

    const img = screen.getByAltText('test gif alt');
    expect(img.tagName).toBe('IMG');
    expect(img).toHaveAttribute('src', '/gifs/test.gif');
  });

  it('falls back to srcGif on error when src is WebP', () => {
    const webpGif = { ...gif, src: '/gifs/test.webp', srcGif: '/gifs/gif/test.gif' };
    render(<GifVideo gif={webpGif} />);

    fireEvent.error(screen.getByLabelText('test gif alt'));

    const img = screen.getByAltText('test gif alt');
    expect(img).toHaveAttribute('src', '/gifs/gif/test.gif');
  });
});
