import Hls from 'hls.js';
import { CSSProperties, useEffect, useRef } from 'react';

import { cn } from '../../lib/utils';

interface HlsVideoProps {
  src: string;
  className?: string;
  style?: CSSProperties;
}

export function HlsVideo({ src, className, style }: HlsVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    let hls: Hls | null = null;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      className={cn('absolute inset-0 h-full w-full object-cover', className)}
      style={style}
    />
  );
}
