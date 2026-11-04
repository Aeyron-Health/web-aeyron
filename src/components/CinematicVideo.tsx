import { type ReactNode, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

type CinematicVideoProps = {
  /** Base path under /video without extension, e.g. "/video/hero". Expects .webm + .mp4 + -poster.webp */
  src?: string;
  poster?: string;
  className?: string;
  /** Overlay tint for legibility of content above the video */
  overlayClassName?: string;
  /** Shown when no clip is available yet, or under reduced motion as the still */
  fallback?: ReactNode;
  /** object-position, defaults center */
  position?: string;
};

/**
 * Higgsfield cinematic clip wrapper. Poster-first (poster is the LCP image, not
 * the video). Muted-loop autoplay, plays only while on-screen. Under
 * prefers-reduced-motion it renders the poster/fallback still and never plays.
 * If `src` is omitted it renders the fallback (CSS/SVG) so the site ships
 * before any clip exists.
 */
export function CinematicVideo({
  src,
  poster,
  className = "",
  overlayClassName = "",
  fallback,
  position = "center",
}: CinematicVideoProps) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const [canPlay, setCanPlay] = useState(false);
  const [posterError, setPosterError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const posterSrc = poster ?? (src ? `${src}-poster.webp` : undefined);
  const showPoster = posterSrc && !posterError;

  // Play only while visible; pause off-screen (perf + battery).
  useEffect(() => {
    const v = ref.current;
    if (!v || reduced || !src) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.15 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduced, src]);

  const showVideo = src && !reduced && !videoError;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Base layer: the CSS/SVG fallback is ALWAYS present, so a missing poster
          or clip can never show a broken image - it just reveals this. */}
      {fallback && <div className="absolute inset-0">{fallback}</div>}

      {/* Poster overlays the fallback only if it actually loads. */}
      {showPoster && (
        <img
          src={posterSrc}
          alt=""
          aria-hidden="true"
          onError={() => setPosterError(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            canPlay ? "opacity-0" : "opacity-100"
          }`}
          style={{ objectPosition: position }}
        />
      )}

      {/* Video overlays everything once it can actually play. */}
      {showVideo && (
        <video
          ref={ref}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            canPlay ? "opacity-100" : "opacity-0"
          }`}
          style={{ objectPosition: position }}
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={() => setCanPlay(true)}
          onError={() => setVideoError(true)}
          aria-hidden="true"
        >
          <source src={`${src}.webm`} type="video/webm" />
          <source src={`${src}.mp4`} type="video/mp4" />
        </video>
      )}

      {overlayClassName && <div className={`absolute inset-0 ${overlayClassName}`} />}
    </div>
  );
}
