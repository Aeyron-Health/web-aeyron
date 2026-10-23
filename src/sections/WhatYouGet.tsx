import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Section } from "../components/Section";
import { Reveal } from "../components/Reveal";
import { usePointerParallax } from "../hooks/usePointer";
import { easeOutExpo } from "../lib/motion";

/* ------------------------------------------------------------------ *
 * Small shared bits
 * ------------------------------------------------------------------ */

function OnTrackChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-vital-tint px-2.5 py-1 text-[0.7rem] font-medium text-ink">
      <span className="size-1.5 rounded-full bg-vital" aria-hidden="true" />
      {children}
    </span>
  );
}

/* A reusable line-draw animation for SVG trend paths. */
function useDraw() {
  const reduced = useReducedMotion();
  if (reduced) return {} as const;
  return {
    initial: { pathLength: 0, opacity: 0 },
    whileInView: { pathLength: 1, opacity: 1 },
    viewport: { once: true, amount: 0.4 },
    transition: { duration: 1.4, ease: easeOutExpo },
  } as const;
}

/* The end marker dot pops in once the line has drawn. */
function useDotIn(delay = 1.2) {
  const reduced = useReducedMotion();
  if (reduced) return {} as const;
  return {
    initial: { scale: 0, opacity: 0 },
    whileInView: { scale: 1, opacity: 1 },
    viewport: { once: true, amount: 0.4 },
    transition: { duration: 0.5, delay, ease: easeOutExpo },
  } as const;
}

/* A varied scroll-reveal so rows don't all fade-and-rise identically.
 * Techniques: "scale" (scale-from-0.94), "drift" (horizontal slide), "clip"
 * (masked wipe). Collapses to static under prefers-reduced-motion. */
function RevealVaried({
  children,
  variant,
  delay = 0,
  className,
}: {
  children: ReactNode;
  variant: "scale" | "drift" | "clip";
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  const hidden =
    variant === "scale"
      ? { opacity: 0, scale: 0.94, y: 10 }
      : variant === "drift"
        ? { opacity: 0, x: -28 }
        : { opacity: 0, clipPath: "inset(0 0 18% 0)", y: 12 };

  const show =
    variant === "scale"
      ? { opacity: 1, scale: 1, y: 0 }
      : variant === "drift"
        ? { opacity: 1, x: 0 }
        : { opacity: 1, clipPath: "inset(0 0 0% 0)", y: 0 };

  return (
    <motion.div
      className={className}
      initial={hidden}
      whileInView={show}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: easeOutExpo }}
    >
      {children}
    </motion.div>
  );
}

/* Detect lg+ viewport (mirrors the HowItWorks pinning gate). */
function useIsLarge() {
  const [isLarge, setIsLarge] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsLarge(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isLarge;
}

/* ------------------------------------------------------------------ *
 * 1) Phone mockup - personal trend + plain-English summary
 * ------------------------------------------------------------------ */

const PHONE_W = 260;
const CHART_W = 228;
const CHART_H = 92;
// Illustration only: a flat, wandering line so it never reads as real symptom data.
const trendPts = [44, 47, 43, 46, 45, 42, 46, 44, 45, 43, 46, 44];

function trendPath(values: number[], w: number, h: number, pad = 4) {
  const max = 70;
  const min = 18;
  const step = (w - pad * 2) / (values.length - 1);
  return values
    .map((v, i) => {
      const x = pad + i * step;
      const y = pad + (1 - (v - min) / (max - min)) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

/**
 * The patient phone. Two animation modes:
 * - default (static / fallback): the trend self-draws on scroll-into-view, the
 *   summary settles via its own transition. This is the calm baseline used on
 *   mobile and under reduced motion.
 * - `scrub` mode (pinned hero): callers pass scroll-driven MotionValues so the
 *   line draws, the dot pops, and the summary card settles in lock-step with
 *   the pinned scroll journey. Pure transform / opacity / pathLength.
 */
function PhoneMockup({
  lineLength,
  dotScale,
  summaryProgress,
}: {
  lineLength?: MotionValue<number>;
  dotScale?: MotionValue<number>;
  summaryProgress?: MotionValue<number>;
} = {}) {
  const draw = useDraw();
  const dotIn = useDotIn(1.25);
  const scrub = !!lineLength;
  const line = trendPath(trendPts, CHART_W, CHART_H);
  const area = `${line} L${CHART_W - 4},${CHART_H - 4} L4,${CHART_H - 4} Z`;
  const endY =
    4 + (1 - (trendPts[trendPts.length - 1] - 18) / (70 - 18)) * (CHART_H - 8);

  // Summary card settle, derived from scrub progress when pinned. A stable
  // fallback MotionValue (held at 1 = fully settled) keeps hook order constant
  // when no scrub source is supplied (static / mobile mode).
  const settled = useMotionValue(1);
  const summarySource = summaryProgress ?? settled;
  const summaryOpacity = useTransform(summarySource, [0, 1], [0, 1]);
  const summaryY = useTransform(summarySource, [0, 1], [14, 0]);

  return (
    <div
      className="relative mx-auto w-full max-w-[280px] rounded-[34px] border border-line bg-paper p-2.5 shadow-[0_30px_60px_-30px_oklch(0.21_0.04_255/0.45)]"
      style={{ width: PHONE_W + 20 }}
      role="img"
      aria-label="Illustration of the Aeyron app, not real data: a phone motion trend described as similar to your past, with a short weekly summary."
    >
      {/* device inner screen */}
      <div className="overflow-hidden rounded-[26px] bg-canvas-sunk">
        {/* status row (no faked iOS chrome) */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <span className="tnum text-[0.65rem] font-medium text-ink-soft">9:41</span>
          <div className="flex items-center gap-1">
            <span className="block h-1.5 w-1.5 rounded-full bg-ink-faint/60" />
            <span className="block h-1.5 w-1.5 rounded-full bg-ink-faint/60" />
            <span className="block h-1.5 w-3.5 rounded-[2px] border border-ink-faint/60" />
          </div>
        </div>

        <div className="px-4 pb-4">
          {/* header */}
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-soft">
              Phone motion
            </span>
            <OnTrackChip>Illustration</OnTrackChip>
          </div>

          <div className="mt-1.5">
            <span className="text-lg font-semibold leading-tight text-ink">
              Similar to your past
            </span>
          </div>

          {/* trend chart */}
          <div className="mt-3 rounded-xl bg-paper p-2.5 ring-1 ring-line">
            <svg
              viewBox={`0 0 ${CHART_W} ${CHART_H}`}
              width="100%"
              height={CHART_H}
              fill="none"
              className="block"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="phoneArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="oklch(0.565 0.188 255)" stopOpacity="0.16" />
                  <stop offset="1" stopColor="oklch(0.565 0.188 255)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* faint gridlines */}
              {[0.25, 0.5, 0.75].map((g) => (
                <line
                  key={g}
                  x1="4"
                  x2={CHART_W - 4}
                  y1={4 + g * (CHART_H - 8)}
                  y2={4 + g * (CHART_H - 8)}
                  stroke="oklch(0.85 0.012 255)"
                  strokeWidth="1"
                  strokeDasharray="2 4"
                />
              ))}
              <path d={area} fill="url(#phoneArea)" />
              {scrub ? (
                <motion.path
                  d={line}
                  stroke="oklch(0.565 0.188 255)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ pathLength: lineLength, opacity: 1 }}
                />
              ) : (
                <motion.path
                  d={line}
                  stroke="oklch(0.565 0.188 255)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  {...draw}
                />
              )}
              {/* end marker, where it steadies */}
              {scrub ? (
                <motion.circle
                  cx={CHART_W - 4}
                  cy={endY}
                  r="3.5"
                  fill="oklch(0.565 0.188 255)"
                  stroke="oklch(1 0 0)"
                  strokeWidth="2"
                  style={{ scale: dotScale, opacity: dotScale }}
                />
              ) : (
                <motion.circle
                  cx={CHART_W - 4}
                  cy={endY}
                  r="3.5"
                  fill="oklch(0.565 0.188 255)"
                  stroke="oklch(1 0 0)"
                  strokeWidth="2"
                  {...dotIn}
                />
              )}
            </svg>
            <div className="mt-1.5 flex justify-between font-mono text-[0.55rem] text-ink-faint">
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
            </div>
          </div>

          {/* plain-English summary card */}
          {scrub ? (
            <motion.div
              className="mt-3 rounded-xl bg-signal-tint p-3"
              style={{ opacity: summaryOpacity, y: summaryY }}
            >
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-signal-deep">
                This week
              </span>
              <p className="mt-1 text-[0.78rem] leading-snug text-ink">
                Phone motion and walking pattern were similar to your past few
                weeks. You logged 5 check-ins.
              </p>
            </motion.div>
          ) : (
            <div className="mt-3 rounded-xl bg-signal-tint p-3">
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-signal-deep">
                This week
              </span>
              <p className="mt-1 text-[0.78rem] leading-snug text-ink">
                Phone motion and walking pattern were similar to your past few
                weeks. You logged 5 check-ins.
              </p>
            </div>
          )}
          <p className="mt-2 text-center font-mono text-[0.55rem] uppercase tracking-[0.1em] text-ink-faint">
            Illustration only, not real data
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 1b) PINNED phone hero (lg+, motion enabled) - the signature moment.
 *
 * A tall scroll region whose centerpiece is `position: sticky`. As the user
 * scrolls through, the phone scales up from page-flow size toward a dominant,
 * near-full-bleed presence at center, while its screen "comes alive": the
 * trend line draws, the end dot pops, the summary settles. Then it releases
 * back down as the region scrolls past, handing off to the dashboard below.
 * The supporting copy fades back as the phone takes the stage.
 * ------------------------------------------------------------------ */
function PinnedPhoneHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { x, y } = usePointerParallax(55);

  // Progress across the whole pinned region.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  // Smooth the raw progress so the scale journey reads silky, not steppy.
  const p = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 26,
    mass: 0.5,
  });

  // The grow journey: small in flow -> dominant at center -> ease off.
  // Peaks around mid-scroll, then settles to a held large state.
  const scale = useTransform(p, [0, 0.42, 0.72, 1], [1, 1.62, 1.62, 1.5]);
  // Lift the device to true viewport center as it grows.
  const yLift = useTransform(p, [0, 0.42], [0, -8]);
  // Pointer parallax depth (kept subtle so it never fights the scale).
  const px = useTransform(x, (v) => v * 14);
  const py = useTransform(y, (v) => v * 10);
  // Compose scroll lift + pointer depth into one vertical value.
  const phoneY = useTransform([yLift, py], ([l, pp]: number[]) => l + pp);

  // Ambient signal glow behind the device intensifies as it takes the stage.
  const glowOpacity = useTransform(p, [0, 0.3, 0.85, 1], [0, 0.55, 0.55, 0.32]);
  const glowScale = useTransform(p, [0, 0.5], [0.7, 1.05]);

  // Screen-comes-alive choreography, sequenced after the grow has begun.
  const lineLength = useTransform(p, [0.18, 0.6], [0, 1]);
  const dotScale = useTransform(p, [0.58, 0.72], [0, 1]);
  const summaryProgress = useTransform(p, [0.68, 0.9], [0, 1]);

  // Side copy parts away as the phone dominates, returns as it releases.
  const copyOpacity = useTransform(p, [0, 0.28, 0.8, 1], [1, 0.12, 0.12, 0.85]);
  const copyX = useTransform(p, [0, 0.3], [0, -40]);

  return (
    <div ref={ref} className="relative mt-14 lg:mt-16" style={{ height: "260vh" }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="grid w-full grid-cols-12 items-center gap-12">
          {/* Supporting copy (recedes as the phone takes over) */}
          <motion.div
            className="col-span-7"
            style={{ opacity: copyOpacity, x: copyX }}
          >
            <span className="eyebrow text-ink-soft">01 / For the patient</span>
            <h3 className="mt-3 text-2xl font-semibold text-ink sm:text-3xl">
              A clear personal trend, and a summary in plain English.
            </h3>
            <p className="mt-4 max-w-xl leading-relaxed text-ink-soft">
              No charts to decode alone. Aeyron shows how your phone motion,
              walking pattern and typing timing compare with your own past, then
              writes a short summary in plain words you can bring to your next
              appointment.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "A personal trend you own, compared with your own past",
                "A plain-English weekly summary to review with your clinician",
                "Quiet by design: it organizes so you don't have to",
              ].map((point) => (
                <li
                  key={point}
                  className="flex gap-3 text-[0.95rem] leading-snug text-ink"
                >
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-signal"
                    aria-hidden="true"
                  />
                  {point}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Stage: glow + the growing phone */}
          <div className="relative col-span-5 flex items-center justify-center">
            {/* ambient signal glow */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                opacity: glowOpacity,
                scale: glowScale,
                background:
                  "radial-gradient(closest-side, oklch(0.62 0.16 255 / 0.22) 0%, transparent 72%)",
              }}
            />
            <motion.div
              className="relative z-10 will-change-transform"
              style={{ scale, x: px, y: phoneY }}
            >
              <PhoneMockup
                lineLength={lineLength}
                dotScale={dotScale}
                summaryProgress={summaryProgress}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* The calm, static / mobile version of row 01 (no pin, no scale journey).
 * Identical content to the original baseline. */
function StaticPhoneRow() {
  return (
    <div className="mt-14 grid items-center gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-12">
      <Reveal className="order-2 lg:order-1 lg:col-span-7" y={20}>
        <span className="eyebrow text-ink-soft">01 / For the patient</span>
        <h3 className="mt-3 text-2xl font-semibold text-ink sm:text-3xl">
          A clear personal trend, and a summary in plain English.
        </h3>
        <p className="mt-4 max-w-xl leading-relaxed text-ink-soft">
          No charts to decode alone. Aeyron shows how your phone motion, walking
          pattern and typing timing compare with your own past, then writes a
          short summary in plain words you can bring to your next appointment.
        </p>
        <ul className="mt-6 space-y-3">
          {[
            "A personal trend you own, compared with your own past",
            "A plain-English weekly summary to review with your clinician",
            "Quiet by design: it organizes so you don't have to",
          ].map((point) => (
            <li
              key={point}
              className="flex gap-3 text-[0.95rem] leading-snug text-ink"
            >
              <span
                className="mt-2 size-1.5 shrink-0 rounded-full bg-signal"
                aria-hidden="true"
              />
              {point}
            </li>
          ))}
        </ul>
      </Reveal>

      <RevealVaried
        className="order-1 lg:order-2 lg:col-span-5"
        variant="scale"
        delay={0.1}
      >
        <ParallaxFloat depth={38}>
          <PhoneMockup />
        </ParallaxFloat>
      </RevealVaried>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 2) Visit summary mockup - illustration only, not real data
 * ------------------------------------------------------------------ */

const DASH_W = 360;
const DASH_H = 130;
// Illustration only: a flat, wandering line with no direction implied.
const dashPts = [46, 48, 44, 47, 45, 49, 46, 44, 47, 45, 48, 46, 44, 47, 45];

type SummaryTile = { label: string; value: string };
const summaryTiles: SummaryTile[] = [
  { label: "Phone motion", value: "Similar to your past" },
  { label: "Walking pattern", value: "Similar to your past" },
  { label: "Typing timing", value: "Similar to your past" },
  { label: "Check-ins logged", value: "5 this week" },
];

function SummaryMockup() {
  const draw = useDraw();
  const line = trendPath(dashPts, DASH_W, DASH_H, 6);

  return (
    <div
      className="overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_30px_70px_-40px_oklch(0.21_0.04_255/0.4)]"
      role="img"
      aria-label="Illustration of an Aeyron visit summary, not real data: a 90-day trend line and tiles for phone motion, walking pattern and typing timing, each described as similar to your past, plus check-ins logged."
    >
      {/* browser chrome (generic, not a real OS) */}
      <div className="flex items-center gap-2 border-b border-line bg-canvas-sunk px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="ml-3 flex-1 truncate rounded-md bg-paper px-3 py-1 font-mono text-[0.62rem] text-ink-soft ring-1 ring-line">
          Aeyron / visit summary
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-soft">
              Your trends, last 90 days
            </span>
            <p className="mt-0.5 text-sm font-medium text-ink">
              Compared with your own past
            </p>
          </div>
          <OnTrackChip>Illustration only, not real data</OnTrackChip>
        </div>

        {/* longitudinal chart */}
        <div className="mt-4 rounded-xl bg-canvas-sunk p-3 ring-1 ring-line">
          <svg
            viewBox={`0 0 ${DASH_W} ${DASH_H}`}
            width="100%"
            height={DASH_H}
            fill="none"
            className="block"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="dashArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="oklch(0.565 0.188 255)" stopOpacity="0.14" />
                <stop offset="1" stopColor="oklch(0.565 0.188 255)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.2, 0.4, 0.6, 0.8].map((g) => (
              <line
                key={g}
                x1="6"
                x2={DASH_W - 6}
                y1={6 + g * (DASH_H - 12)}
                y2={6 + g * (DASH_H - 12)}
                stroke="oklch(0.905 0.008 255)"
                strokeWidth="1"
              />
            ))}
            <path
              d={`${line} L${DASH_W - 6},${DASH_H - 6} L6,${DASH_H - 6} Z`}
              fill="url(#dashArea)"
            />
            <motion.path
              d={line}
              stroke="oklch(0.565 0.188 255)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              {...draw}
            />
          </svg>
        </div>

        {/* KPI tiles */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {summaryTiles.map((k) => (
            <div key={k.label} className="rounded-lg border border-line bg-canvas-sunk p-3">
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.08em] text-ink-soft">
                {k.label}
              </p>
              <p className="mt-1.5 text-sm font-semibold leading-snug text-ink">
                {k.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


/* ------------------------------------------------------------------ *
 * Section
 * ------------------------------------------------------------------ */

export function WhatYouGet() {
  const reduced = useReducedMotion();
  const isLarge = useIsLarge();
  // Pin only on large screens with motion allowed; otherwise stack statically.
  const usePin = isLarge && !reduced;

  return (
    <Section id="what-you-get" tone="sunk">
      {/* heading */}
      <div className="max-w-2xl">
        <Reveal>
          <p className="eyebrow text-signal-deep">What it all rolls into</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 text-h2 text-ink">
            Months of everyday life, organized into something you can review.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">
            Your everyday signals and check-ins become two things: a personal
            trend compared with your own past, and a plain-English summary to
            review with your clinician.
          </p>
        </Reveal>
      </div>

      {/* FEATURED row 01: the phone hero.
          lg + motion -> PINNED scale journey (the signature moment).
          mobile / reduced motion -> calm static row. */}
      {usePin ? <PinnedPhoneHero /> : <StaticPhoneRow />}

      {/* SECOND row: visit summary (illustration only) */}
      <div className="mt-20 grid gap-10 lg:mt-28 lg:grid-cols-12 lg:gap-12">
        <RevealVaried className="lg:col-span-4" variant="drift">
          <span className="eyebrow text-ink-soft">02 / For your appointment</span>
          <h3 className="mt-3 text-2xl font-semibold text-ink sm:text-3xl">
            A simple summary to bring to your clinician.
          </h3>
          <p className="mt-4 leading-relaxed text-ink-soft">
            Bring a short summary of your trends and the check-ins you logged to
            your next visit, so the conversation can start from more than one
            morning. Aeyron does not interpret results or suggest treatment
            changes. Your clinician decides what matters.
          </p>
          <p className="mt-5 inline-flex items-start gap-2 text-[0.82rem] leading-snug text-ink-soft">
            <svg
              viewBox="0 0 24 24"
              className="mt-px size-4 shrink-0 text-signal"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 2.5l7 3v5.5c0 4.4-3 8.2-7 9.5-4-1.3-7-5.1-7-9.5V5.5l7-3z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M9 12l2 2 4-4.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Shared only when you choose to share it. Aeyron records typing
            timing, never what you type.
          </p>
        </RevealVaried>

        <RevealVaried className="lg:col-span-8" variant="clip" delay={0.1}>
          <ParallaxFloat invert depth={22}>
            <SummaryMockup />
          </ParallaxFloat>
        </RevealVaried>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ *
 * Cursor parallax float wrapper (reduced-motion safe)
 * ------------------------------------------------------------------ */

function ParallaxFloat({
  children,
  invert = false,
  depth = 40,
}: {
  children: ReactNode;
  invert?: boolean;
  /** Scroll-linked vertical travel in px. Larger = nearer/faster (more depth). */
  depth?: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { x, y } = usePointerParallax(55);
  const dir = invert ? -1 : 1;

  // pointer depth (subtle tilt toward cursor)
  const px = useTransform(x, (v) => v * 12 * dir);
  const py = useTransform(y, (v) => v * 10 * dir);

  // scroll depth: element drifts vertically as the section passes through view.
  // Different `depth` values on phone vs dashboard => layered parallax.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const rawScrollY = useTransform(
    scrollYProgress,
    [0, 1],
    [depth * dir, -depth * dir],
  );
  const scrollY = useSpring(rawScrollY, {
    stiffness: 90,
    damping: 28,
    mass: 0.4,
  });

  if (reduced) return <>{children}</>;

  return (
    <motion.div ref={ref} style={{ x: px, y: py }}>
      <motion.div style={{ y: scrollY }}>{children}</motion.div>
    </motion.div>
  );
}
