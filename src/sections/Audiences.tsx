import { useId, useRef, useState, type KeyboardEvent } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { Section } from "../components/Section";
import { Reveal } from "../components/Reveal";
import { SignalWave } from "../components/SignalWave";
import { usePointerParallax } from "../hooks/usePointer";
import { easeOutExpo } from "../lib/motion";
import { audiences } from "../content/site";

/**
 * WHO IT'S FOR - accessible tabbed switcher (WAI-ARIA tabs pattern with
 * roving tabindex + arrow-key navigation). Each audience carries a distinct
 * accent treatment and supporting label so the three never read as identical
 * cards: patients get reassurance, clinicians get rigor, partners get scale.
 *
 * BIG MOMENT: the panel arrives from depth on scroll (a clip-reveal that lifts
 * the card up out of the page), and switching audiences is theatrical - the
 * outgoing panel scales/blurs away while the incoming content flies in from
 * depth in a confident staggered cascade, the accent signal wave sweeping
 * across underneath. All of it collapses to an instant, static layout under
 * prefers-reduced-motion.
 */

type Treatment = {
  /** css color for the active accent (signal vs vital) */
  accent: string;
  /** faint wash behind the active panel art */
  wash: string;
  /** small framing word shown above the headline */
  kicker: string;
  /** intensity of the brand signal motif (calm -> active) */
  intensity: number;
};

const treatments: Record<string, Treatment> = {
  patients: {
    accent: "var(--color-vital)",
    wash: "oklch(0.74 0.16 150 / 0.10)",
    kicker: "Reassurance",
    intensity: 0.22,
  },
  clinicians: {
    accent: "var(--color-signal-hi)",
    wash: "oklch(0.705 0.165 255 / 0.12)",
    kicker: "Rigor",
    intensity: 0.62,
  },
  partners: {
    accent: "var(--color-signal-hi)",
    wash: "oklch(0.705 0.165 255 / 0.10)",
    kicker: "Scale",
    intensity: 0.9,
  },
};

/**
 * A staggered child of the active panel. On enter it flies in from depth -
 * rising, scaling up slightly, and clearing a small blur - then slips out
 * faster and shallower on exit (continuity, not a fade-rise on everything).
 * Collapses to a plain swap under reduced motion.
 */
function panelChild(
  reduced: boolean | null,
  from: { x?: number; y?: number } = { y: 18 },
) {
  if (reduced) {
    return {
      initial: { opacity: 1 },
      enter: { opacity: 1, x: 0, y: 0 },
      exit: { opacity: 1 },
    };
  }
  return {
    initial: {
      opacity: 0,
      x: from.x ?? 0,
      y: from.y ?? 0,
      scale: 0.965,
      filter: "blur(6px)",
    },
    enter: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.62, ease: easeOutExpo },
    },
    exit: {
      opacity: 0,
      x: (from.x ?? 0) * 0.5,
      y: (from.y ?? 0) * -0.45,
      scale: 0.99,
      filter: "blur(3px)",
      transition: { duration: 0.22, ease: easeOutExpo },
    },
  };
}

export function Audiences() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId().replace(/:/g, "");

  const current = audiences[active];
  const t = treatments[current.id] ?? treatments.clinicians;

  // Pointer-driven depth: the wash/grid and the signal motif sit at different
  // depths so the active panel header breathes as the cursor moves. Disabled
  // entirely (static) under reduced motion.
  const { x: px, y: py } = usePointerParallax(60);
  const washX = useTransform(px, [-1, 1], [-14, 14]);
  const washY = useTransform(py, [-1, 1], [-9, 9]);
  const waveX = useTransform(px, [-1, 1], [18, -18]);

  // BIG MOMENT - scroll entrance. As the panel column scrolls up into view it
  // lifts out of the page from depth: scaling from 0.9 -> 1, rising, and
  // un-clipping from the bottom so it reads like the card is emerging. Driven
  // purely by useScroll/useTransform (+ a spring to keep it silky); never a
  // scroll listener. Fully static under reduced motion.
  const panelRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: panelRef,
    offset: ["start 0.95", "start 0.45"],
  });
  const ease = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.5,
  });
  const arriveScale = useTransform(ease, [0, 1], [0.9, 1]);
  const arriveY = useTransform(ease, [0, 1], [56, 0]);
  const arriveOpacity = useTransform(ease, [0, 1], [0, 1]);
  // Clip from the bottom edge so the card appears to rise into existence.
  const arriveClip = useTransform(
    ease,
    [0, 1],
    ["inset(0% 0% 30% 0% round 16px)", "inset(0% 0% 0% 0% round 16px)"],
  );

  const entranceStyle = reduced
    ? undefined
    : {
        scale: arriveScale,
        y: arriveY,
        opacity: arriveOpacity,
        clipPath: arriveClip,
        transformOrigin: "50% 100%" as const,
      };

  function focusTab(i: number) {
    const next = (i + audiences.length) % audiences.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        focusTab(i + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        focusTab(i - 1);
        break;
      case "Home":
        e.preventDefault();
        focusTab(0);
        break;
      case "End":
        e.preventDefault();
        focusTab(audiences.length - 1);
        break;
    }
  }

  return (
    <Section id="audiences" tone="dark">
      <Reveal as="div" className="max-w-2xl">
        <p className="eyebrow text-signal-hi">Who it&apos;s for</p>
        <h2 className="mt-4 text-h2 text-mist">
          One quiet signal, read three different ways.
        </h2>
        <p className="mt-5 text-lg text-mist-soft">
          The same passive monitoring serves very different people. Choose who
          you are - the picture changes to match.
        </p>
      </Reveal>

      <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-8 lg:mt-16 lg:grid-cols-[minmax(0,21rem)_1fr] lg:gap-14">
        {/* Tab list: scrollable row on mobile, vertical on desktop */}
        <Reveal as="div" delay={0.05}>
          <div
            role="tablist"
            aria-label="Audiences"
            aria-orientation="vertical"
            className="flex w-full flex-row gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-3 lg:overflow-visible lg:pb-0"
          >
            {audiences.map((a, i) => {
              const isActive = i === active;
              const at = treatments[a.id] ?? treatments.clinicians;
              return (
                <button
                  key={a.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  role="tab"
                  id={`${baseId}-tab-${a.id}`}
                  aria-selected={isActive}
                  aria-controls={`${baseId}-panel-${a.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActive(i)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={`group relative flex min-h-[64px] min-w-[15rem] flex-1 items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition-[background-color,border-color] duration-200 lg:min-w-0 ${
                    isActive
                      ? "border-line-dark bg-night-raise"
                      : "border-transparent bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
                >
                  {/* active accent rail */}
                  <span
                    aria-hidden="true"
                    className="mt-0.5 h-9 w-[3px] flex-none rounded-full transition-opacity duration-200"
                    style={{
                      backgroundColor: at.accent,
                      opacity: isActive ? 1 : 0.25,
                    }}
                  />
                  <span className="min-w-0">
                    <span
                      className="eyebrow block text-[0.66rem]"
                      style={{ color: isActive ? at.accent : undefined }}
                    >
                      <span className={isActive ? "" : "text-mist-soft/70"}>
                        {at.kicker}
                      </span>
                    </span>
                    <span
                      className={`mt-1 block text-[0.98rem] font-medium leading-snug ${
                        isActive ? "text-mist" : "text-mist-soft"
                      }`}
                    >
                      {a.who}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Panels - the scroll-entrance container. The clip/scale/lift is driven
            by scroll progress; the inner AnimatePresence owns the tab swap. */}
        <motion.div
          ref={panelRef}
          className="relative"
          style={entranceStyle}
        >
          {audiences.map((a, i) => {
            const isActive = i === active;
            return (
              <div
                key={a.id}
                role="tabpanel"
                id={`${baseId}-panel-${a.id}`}
                aria-labelledby={`${baseId}-tab-${a.id}`}
                hidden={!isActive}
              >
                {isActive && (
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={a.id}
                      variants={{
                        initial: reduced
                          ? {}
                          : {
                              opacity: 0,
                              scale: 0.94,
                              filter: "blur(8px)",
                            },
                        enter: {
                          opacity: 1,
                          scale: 1,
                          filter: "blur(0px)",
                          transition: reduced
                            ? {}
                            : {
                                duration: 0.55,
                                ease: easeOutExpo,
                                staggerChildren: 0.07,
                                delayChildren: 0.12,
                              },
                        },
                        exit: {
                          opacity: 0,
                          scale: 1.03,
                          filter: "blur(8px)",
                          transition: reduced
                            ? {}
                            : {
                                duration: 0.28,
                                ease: easeOutExpo,
                                staggerChildren: 0.03,
                                staggerDirection: -1,
                              },
                        },
                      }}
                      initial="initial"
                      animate="enter"
                      exit="exit"
                      className="relative overflow-hidden rounded-2xl border border-line-dark bg-night-raise"
                    >
                      {/* accent wash + signal motif header. The wash/grid and the
                          signal wave drift at different rates with the pointer for
                          a shallow sense of depth (static under reduced motion). */}
                      <div
                        className="relative h-28 overflow-hidden sm:h-32"
                        style={{ backgroundColor: t.wash }}
                      >
                        <motion.div
                          className="grid-faint absolute inset-[-8%] opacity-60"
                          style={reduced ? undefined : { x: washX, y: washY }}
                        />
                        {/* The accent wave sweeps in from the side and settles -
                            a confident horizontal swipe across the header. */}
                        <motion.div
                          className="absolute inset-x-0 bottom-0"
                          style={reduced ? undefined : { x: waveX }}
                          variants={{
                            initial: reduced
                              ? { opacity: 1, x: 0, scale: 1 }
                              : { opacity: 0, x: 64, scale: 0.97 },
                            enter: {
                              opacity: 1,
                              x: 0,
                              scale: 1,
                              transition: reduced
                                ? { duration: 0 }
                                : {
                                    duration: 0.72,
                                    ease: easeOutExpo,
                                    delay: 0.06,
                                  },
                            },
                            exit: {
                              opacity: 0,
                              x: -48,
                              scale: 0.985,
                              transition: { duration: 0.24, ease: easeOutExpo },
                            },
                          }}
                        >
                          <SignalWave
                            className="w-full"
                            color={t.accent}
                            height={96}
                            intensity={t.intensity}
                            strokeWidth={1.75}
                            speed={current.id === "patients" ? 11 : 7}
                          />
                        </motion.div>
                        <motion.span
                          className="eyebrow absolute left-6 top-5 text-[0.7rem]"
                          style={{ color: t.accent }}
                          variants={panelChild(reduced, { x: -14 })}
                        >
                          {t.kicker}
                        </motion.span>
                      </div>

                      <div className="px-6 py-8 sm:px-10 sm:py-10">
                        <motion.p
                          className="text-sm text-mist-soft"
                          variants={panelChild(reduced)}
                        >
                          {a.who}
                        </motion.p>
                        <motion.h3
                          className="mt-2 text-2xl text-mist sm:text-[2rem] sm:leading-[1.08]"
                          variants={panelChild(reduced, { y: 24 })}
                        >
                          {a.headline}
                        </motion.h3>
                        <motion.p
                          className="mt-5 max-w-xl text-[1.02rem] leading-relaxed text-mist-soft"
                          variants={panelChild(reduced)}
                        >
                          {a.body}
                        </motion.p>

                        <ul className="mt-8 grid gap-px overflow-hidden rounded-xl border border-line-dark">
                          {a.points.map((point) => (
                            <motion.li
                              key={point}
                              variants={panelChild(reduced, { x: -12 })}
                              className="flex items-start gap-3 bg-white/[0.02] px-5 py-4"
                            >
                              <span
                                aria-hidden="true"
                                className="mt-[0.45rem] h-1.5 w-1.5 flex-none rounded-full"
                                style={{ backgroundColor: t.accent }}
                              />
                              <span className="text-[0.97rem] leading-snug text-mist">
                                {point}
                              </span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </motion.div>
      </div>
    </Section>
  );
}
