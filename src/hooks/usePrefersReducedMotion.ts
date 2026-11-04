import { useEffect, useState } from "react";

/**
 * True when the user has requested reduced motion. SSR-safe-ish (defaults false).
 * Framer Motion also exposes useReducedMotion(); this is for non-motion logic
 * (e.g. skipping canvas/RAF animation loops).
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
