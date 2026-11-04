import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { reveal, inView } from "../lib/motion";

type RevealProps = {
  children: ReactNode;
  as?: "div" | "section" | "li" | "span" | "p" | "h2" | "h3";
  className?: string;
  delay?: number;
  /** override y travel */
  y?: number;
};

/**
 * Scroll-reveal wrapper. Fires once when 30% in view. Collapses to a plain,
 * instantly-visible element under prefers-reduced-motion.
 */
export function Reveal({ children, as = "div", className, delay = 0, y }: RevealProps) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as];

  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      variants={{
        hidden: { opacity: 0, y: y ?? 14, filter: "blur(6px)" },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay },
        },
      }}
    >
      {children}
    </MotionTag>
  );
}

export { reveal };
