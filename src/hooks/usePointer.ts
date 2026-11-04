import { useEffect } from "react";
import { useMotionValue, useSpring, type MotionValue } from "framer-motion";

/**
 * Normalized, spring-smoothed pointer position in [-1, 1] for both axes
 * (0,0 = center of viewport). For cursor-reactive parallax. Listeners are
 * passive and cheap; consumers read MotionValues (no re-render per move).
 */
export function usePointerParallax(stiffness = 70): {
  x: MotionValue<number>;
  y: MotionValue<number>;
} {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness, damping: 22, mass: 0.4 });
  const sy = useSpring(y, { stiffness, damping: 22, mass: 0.4 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      x.set((e.clientX / window.innerWidth) * 2 - 1);
      y.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);

  return { x: sx, y: sy };
}
