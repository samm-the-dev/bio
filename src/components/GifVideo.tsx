import { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { Gif } from '@/lib/queries';

export interface GifVideoHandle {
  play: () => void;
  pause: () => void;
}

interface GifVideoProps {
  gif: Gif;
  className?: string;
  style?: React.CSSProperties;
  /** Defer loading until play() is called via the imperative handle. */
  lazy?: boolean;
}

export const GifVideo = forwardRef<GifVideoHandle, GifVideoProps>(function GifVideo(
  { gif, className, style, lazy },
  ref,
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [activated, setActivated] = useState(!lazy);
  const reduced = usePrefersReducedMotion();

  useImperativeHandle(ref, () => ({
    play: () => {
      if (!activated) setActivated(true);
      videoRef.current?.play().catch(() => {});
    },
    pause: () => {
      videoRef.current?.pause();
    },
  }));

  if (failed || !gif.srcMp4) {
    return <img src={gif.src} alt={gif.alt} className={className} style={style} />;
  }

  return (
    <video
      ref={videoRef}
      src={activated ? gif.srcMp4 : undefined}
      autoPlay={!reduced && activated}
      loop
      muted
      playsInline
      onError={() => setFailed(true)}
      className={className}
      style={style}
      aria-label={gif.alt}
    />
  );
});
