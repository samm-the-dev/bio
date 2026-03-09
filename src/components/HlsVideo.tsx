import { useEffect, useRef } from 'react';

interface HlsVideoProps {
  src: string;
  poster?: string;
  className?: string;
  ariaLabel?: string;
}

export function HlsVideo({ src, poster, className, ariaLabel }: HlsVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Safari handles HLS natively
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }

    // Lazy-load hls.js for Chrome/Firefox
    let hls: import('hls.js').default | null = null;
    let cancelled = false;

    import('hls.js')
      .then((mod) => {
        if (cancelled) return;
        const Hls = mod.default;
        if (!Hls.isSupported()) {
          video.src = src;
          return;
        }
        hls = new Hls({ enableWorker: false });
        if (cancelled) {
          hls.destroy();
          hls = null;
          return;
        }
        hls.loadSource(src);
        hls.attachMedia(video);
      })
      .catch(() => {
        if (!cancelled) video.src = src;
      });

    return () => {
      cancelled = true;
      if (hls) {
        hls.destroy();
        hls = null;
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      poster={poster}
      autoPlay
      loop
      muted
      playsInline
      controls={false}
      className={className}
      aria-label={ariaLabel}
    />
  );
}
