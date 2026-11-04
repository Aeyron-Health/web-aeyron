import { useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { brand } from "../content/site";
import { easeOutExpo } from "../lib/motion";

/**
 * Brand tagline as a scroll-triggered, word-by-word reveal over a 3D "signal
 * field". Scroll POSITION reveals each word (not velocity-scrubbed); each word
 * then materializes over a fixed ~0.5s (opacity + 8px rise + 4px blur clearing,
 * cubic-bezier(0.16,1,0.3,1)) so it never drags or races. Upcoming words sit
 * faintly ghosted. Fully static under reduced motion; the 3D is gated behind
 * motion + WebGL + in-view and falls back to a CSS signal field.
 */
export function Tagline() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const words = brand.tagline.split(" ");
  const [revealed, setRevealed] = useState(reduced ? words.length : 0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reduced) return;
    // Reveal across the first ~65% of the scroll, then hold the full line.
    const frac = Math.min(1, p / 0.65);
    const n = Math.round(frac * words.length);
    setRevealed((prev) => (prev === n ? prev : n));
  });

  const allOut = revealed >= words.length;

  return (
    <section
      ref={sectionRef}
      aria-label={`${brand.tagline} ${brand.taglineSub}`}
      className="relative text-mist"
      style={{ height: "260vh" }}
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        {/* The persistent Signal Thread (App background) shows through here.
            A soft radial scrim keeps the words legible over it. */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, oklch(0.12 0.016 255 / 0.86) 0%, oklch(0.12 0.016 255 / 0.5) 36%, transparent 64%), radial-gradient(120% 120% at 50% 50%, transparent 55%, oklch(0.12 0.016 255 / 0.45) 100%)",
          }}
        />

        {/* Foreground copy */}
        <div className="shell relative z-10 w-full">
          <p className="eyebrow mb-7 text-signal-hi">Our promise</p>

          <h2 className="max-w-5xl font-display text-[clamp(2.4rem,6.5vw,5.25rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
            {words.map((w, i) => (
              <Word key={i} on={reduced || i < revealed} reduced={!!reduced}>
                {w}
              </Word>
            ))}
          </h2>

          <motion.p
            className="mt-8 max-w-xl text-lg text-mist-soft sm:text-xl"
            initial={false}
            animate={{
              opacity: reduced || allOut ? 1 : 0,
              y: reduced || allOut ? 0 : 10,
            }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
          >
            {brand.taglineSub}
          </motion.p>
        </div>
      </div>
    </section>
  );
}

function Word({
  children,
  on,
  reduced,
}: {
  children: string;
  on: boolean;
  reduced: boolean;
}) {
  return (
    <span className="mr-[0.28em] inline-block">
      <motion.span
        className="inline-block"
        initial={false}
        animate={
          on
            ? { opacity: 1, y: 0, filter: "blur(0px)" }
            : { opacity: 0.14, y: 8, filter: "blur(4px)" }
        }
        transition={
          reduced ? { duration: 0 } : { duration: 0.5, ease: easeOutExpo }
        }
      >
        {children}
      </motion.span>
    </span>
  );
}
