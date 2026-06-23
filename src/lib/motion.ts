/**
 * Shared motion tokens for the whole site.
 * Rules: animate transform/opacity only, no bounce/elastic, exits ~75% of enter,
 * everything degrades to instant under prefers-reduced-motion (handled by callers
 * via useReducedMotion / the Reveal component).
 */
import type { Variants, Transition } from "framer-motion";

// Easings (mirror the CSS custom props in index.css)
export const easeOutExpo = [0.16, 1, 0.3, 1] as const;
export const easeOutQuint = [0.22, 1, 0.36, 1] as const;
export const easeOutQuart = [0.25, 1, 0.5, 1] as const;

// Durations (seconds)
export const dur = {
  feedback: 0.12,
  state: 0.24,
  layout: 0.4,
  entrance: 0.7,
} as const;

export const springSoft: Transition = {
  type: "spring",
  duration: 0.45,
  bounce: 0,
};

/** Standard scroll-reveal: fade + small rise + subtle blur clearing (Jakub recipe). */
export const reveal: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: dur.entrance, ease: easeOutExpo },
  },
};

/** Container that staggers its children's reveals. */
export const revealStagger = (stagger = 0.06, delayChildren = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/** A single staggered child (pair with revealStagger on the parent). */
export const revealChild: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(5px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: easeOutExpo },
  },
};

/** Default viewport config for whileInView reveals. */
export const inView = { once: true, amount: 0.3 } as const;
