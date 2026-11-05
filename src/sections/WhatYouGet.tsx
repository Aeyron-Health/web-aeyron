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
import { Magnetic } from "../components/Magnetic";
import { CountUp } from "../components/CountUp";
import { PhoneFrame } from "../components/PhoneFrame";
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

// Tremor index trending down, then steadying. Lower is calmer/better.
const PHONE_W = 260;
const CHART_W = 228;
const CHART_H = 92;
const trendPts = [62, 58, 60, 51, 44, 40, 33, 31, 29, 30, 28, 27];

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
      aria-label="Aeyron patient app: Tremor index 27, on track, down 18 percent versus last month. The trend settles and stays steady."
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
              Tremor index
            </span>
            <OnTrackChip>On track</OnTrackChip>
          </div>

          <div className="mt-1.5 flex items-end gap-2">
            <CountUp
              to={27}
              className="tnum text-3xl font-semibold leading-none text-ink"
            />
            <span className="tnum mb-0.5 inline-flex items-center gap-0.5 text-[0.72rem] font-medium text-vital">
              <span aria-hidden="true">↓</span>
              <CountUp to={18} suffix="%" /> vs. last month
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
                Your shake has settled and stayed steady. Morning mobility looks a
                little better than last month.
              </p>
            </motion.div>
          ) : (
            <div className="mt-3 rounded-xl bg-signal-tint p-3">
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-signal-deep">
                This week
              </span>
              <p className="mt-1 text-[0.78rem] leading-snug text-ink">
                Your shake has settled and stayed steady. Morning mobility looks a
                little better than last month.
              </p>
            </div>
          )}
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
              No charts to decode alone. Aeyron shows whether your shake is
              settling or stirring over weeks, then writes the takeaway in words
              anyone can read - the same words you can hand to your care team.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "A personal trend you actually own, not a once-a-year snapshot",
                "A plain-English weekly summary, ready to share with your neurologist",
                "Quiet by design: it tracks so you don't have to",
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
          No charts to decode alone. Aeyron shows whether your shake is settling
          or stirring over weeks, then writes the takeaway in words anyone can
          read - the same words you can hand to your care team.
        </p>
        <ul className="mt-6 space-y-3">
          {[
            "A personal trend you actually own, not a once-a-year snapshot",
            "A plain-English weekly summary, ready to share with your neurologist",
            "Quiet by design: it tracks so you don't have to",
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
 * 2) Clinician dashboard mockup - browser panel, longitudinal trend, KPIs
 * ------------------------------------------------------------------ */

const DASH_W = 360;
const DASH_H = 130;
// Longitudinal motor-score trend (clinician view), gently improving with variance.
const dashPts = [54, 57, 52, 49, 53, 47, 44, 46, 41, 39, 42, 38, 36, 37, 34];

type Kpi = {
  label: string;
  value: number;
  decimals?: number;
  unit: string;
  trend: string;
  good: boolean;
};
const kpis: Kpi[] = [
  { label: "Tremor index", value: 27, unit: "/100", trend: "−18%", good: true },
  { label: "Gait speed", value: 1.18, decimals: 2, unit: "m/s", trend: "+6%", good: true },
  { label: "Typing rhythm", value: 0.92, decimals: 2, unit: "var.", trend: "stable", good: true },
  { label: "Med adherence", value: 94, unit: "%", trend: "+3 days", good: true },
];

function ClinicianMockup() {
  const draw = useDraw();
  const line = trendPath(dashPts, DASH_W, DASH_H, 6);

  return (
    <div
      className="overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_30px_70px_-40px_oklch(0.21_0.04_255/0.4)]"
      role="img"
      aria-label="Aeyron clinician dashboard: 90-day longitudinal motor and non-motor trend, UPDRS-aligned and improving, with KPI tiles for tremor index, gait speed, typing rhythm, and medication adherence."
    >
      {/* browser chrome (generic, not a real OS) */}
      <div className="flex items-center gap-2 border-b border-line bg-canvas-sunk px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="ml-3 flex-1 truncate rounded-md bg-paper px-3 py-1 font-mono text-[0.62rem] text-ink-soft ring-1 ring-line">
          clinic.aeyron.health / patient / longitudinal
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-soft">
              Motor & non-motor trend
            </span>
            <p className="mt-0.5 text-sm font-medium text-ink">
              90-day longitudinal view, UPDRS-aligned
            </p>
          </div>
          <OnTrackChip>Stable, improving</OnTrackChip>
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
          {kpis.map((k) => (
            <div key={k.label} className="rounded-lg border border-line bg-canvas-sunk p-3">
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.08em] text-ink-soft">
                {k.label}
              </p>
              <p className="mt-1.5 flex items-baseline gap-0.5">
                <CountUp
                  to={k.value}
                  decimals={k.decimals ?? 0}
                  className="tnum text-xl font-semibold leading-none text-ink"
                />
                <span className="tnum text-[0.6rem] text-ink-faint">{k.unit}</span>
              </p>
              <p
                className={`tnum mt-1 text-[0.62rem] font-medium ${
                  k.good ? "text-vital" : "text-attention"
                }`}
              >
                {k.trend}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 3) Interactive device gallery - the 4 REAL app screenshots
 * ------------------------------------------------------------------ */

type Shot = { src: string; alt: string; label: string; fit: "cover" | "contain" };
const shots: Shot[] = [
  {
    src: "/screens/app-vitals.webp",
    alt: "Aeyron app vitals screen showing daily health signals",
    label: "Daily vitals",
    fit: "cover",
  },
  {
    src: "/screens/app-telemetry.webp",
    alt: "Aeyron app telemetry screen showing motion-sensor signal capture",
    label: "Live telemetry",
    fit: "cover",
  },
  {
    src: "/screens/app-fidelity.webp",
    alt: "Aeyron app signal-fidelity screen",
    label: "Signal fidelity",
    fit: "cover",
  },
  {
    src: "/screens/app-impact.webp",
    alt: "Aeyron app impact summary screen",
    label: "Your impact",
    fit: "contain",
  },
];

/** Layered, fannable stack of real screenshots. Click a card to bring it to
 * front. Cursor parallax tilts the whole stack. Reduced motion -> a calm,
 * static, evenly-spread fan with no parallax and instant selection. */
function useNarrowViewport() {
  const query = "(max-width: 639px)";
  const [narrow, setNarrow] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setNarrow(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  return narrow;
}

function DeviceGallery() {
  const reduced = useReducedMotion();
  const { x, y } = usePointerParallax(60);
  const [active, setActive] = useState(0);

  // parallax: tilt the stack toward the cursor (skipped when reduced)
  const tilt = useTransform(x, (v) => v * 4);
  const lift = useTransform(y, (v) => v * -10);

  const n = shots.length;
  // Phones are ~210px wide: at 86px per card the back of the fan reaches 260px
  // right of centre and pushes the page sideways. Fan tighter below `sm`.
  const narrow = useNarrowViewport();
  const fanStep = narrow ? 22 : 86;

  return (
    <motion.div
      className="relative mx-auto h-[420px] w-full max-w-[560px] sm:h-[480px]"
      style={reduced ? undefined : { rotateY: tilt as unknown as MotionValue<number>, y: lift }}
    >
      {/* soft ground shadow */}
      <div
        className="absolute bottom-6 left-1/2 h-10 w-[62%] -translate-x-1/2 rounded-[50%] bg-night-deep/15 blur-2xl"
        aria-hidden="true"
      />
      {shots.map((shot, i) => {
        // position relative to the active card -> classic fanned deck
        const rel = ((i - active) % n + n) % n;
        // map rel index to a 0..1 depth where 0 = front
        const depth = rel;
        const offset = depth * fanStep; // horizontal fan spacing
        const drop = depth * 14; // vertical descent
        const rot = depth * -5; // fan rotation
        const scale = 1 - depth * 0.06;
        const isFront = rel === 0;

        return (
          <Magnetic
            key={shot.src}
            strength={isFront ? 0.18 : 0.1}
            className="absolute inset-x-0 top-0"
          >
            <motion.button
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show ${shot.label} screen`}
              aria-pressed={isFront}
              className="mx-auto block cursor-pointer rounded-[2.4rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-4 focus-visible:ring-offset-canvas-sunk"
              initial={false}
              animate={{
                // The wrapper spans the gallery and the card is centred in it with
                // mx-auto, so only the fan offset moves it sideways.
                x: offset,
                y: drop,
                rotate: reduced ? 0 : rot,
                scale,
                zIndex: n - depth,
                opacity: depth > 3 ? 0 : 1,
              }}
              transition={{ duration: 0.6, ease: easeOutExpo }}
              style={{ width: 188, zIndex: n - depth }}
              whileHover={isFront || reduced ? undefined : { y: drop - 8 }}
            >
              <PhoneFrame
                className="w-[188px]"
                screenClassName="bg-night-deep"
              >
                <img
                  src={shot.src}
                  alt={shot.alt}
                  loading="lazy"
                  draggable={false}
                  className={`absolute inset-0 h-full w-full ${
                    shot.fit === "cover"
                      ? "object-cover object-top"
                      : "object-contain"
                  }`}
                />
                {/* dim non-front cards so the active one reads clearly */}
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[1.7rem] bg-night-deep"
                  animate={{ opacity: isFront ? 0 : 0.42 }}
                  transition={{ duration: 0.5, ease: easeOutExpo }}
                />
              </PhoneFrame>
            </motion.button>
          </Magnetic>
        );
      })}

      {/* front-card caption + controls */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3">
        <div className="text-center">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-faint">
            From the Aeyron app
          </p>
          <motion.p
            key={active}
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOutExpo }}
            className="mt-1 text-sm font-medium text-ink"
          >
            {shots[active].label}
          </motion.p>
        </div>
        {/* dot controls - 44px tap targets */}
        <div className="flex items-center gap-1" role="tablist" aria-label="App screens">
          {shots.map((shot, i) => (
            <button
              key={shot.src}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={shot.label}
              onClick={() => setActive(i)}
              className="grid size-11 place-items-center"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? "w-6 bg-signal" : "w-1.5 bg-line-strong"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
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
            Months of real life, turned into something you can act on.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">
            Passive signals become three things: a personal trend you own, a
            plain-English summary for your neurologist, and a clinician
            dashboard that puts it all in context.
          </p>
        </Reveal>
      </div>

      {/* FEATURED row 01: the phone hero.
          lg + motion -> PINNED scale journey (the signature moment).
          mobile / reduced motion -> calm static row. */}
      {usePin ? <PinnedPhoneHero /> : <StaticPhoneRow />}

      {/* SECOND row: clinician dashboard, full-bleed-ish panel */}
      <div className="mt-20 grid grid-cols-[minmax(0,1fr)] gap-10 lg:mt-28 lg:grid-cols-12 lg:gap-12">
        <RevealVaried className="lg:col-span-4" variant="drift">
          <span className="eyebrow text-ink-soft">02 / For the clinic</span>
          <h3 className="mt-3 text-2xl font-semibold text-ink sm:text-3xl">
            A clinician dashboard, aligned to measures they already use.
          </h3>
          <p className="mt-4 leading-relaxed text-ink-soft">
            Your neurologist sees the same story at clinical altitude:
            longitudinal trends and UPDRS-style indices for tremor, gait,
            typing rhythm, and medication adherence - so titration rests on more
            than one morning's exam.
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
            Shared only with your permission. Raw content, like what you type,
            never leaves the rhythm of the keystroke.
          </p>
        </RevealVaried>

        <RevealVaried className="lg:col-span-8" variant="clip" delay={0.1}>
          <ParallaxFloat invert depth={22}>
            <ClinicianMockup />
          </ParallaxFloat>
        </RevealVaried>
      </div>

      {/* SECONDARY PROOF: real app screenshots, interactive device gallery */}
      <div className="mt-20 border-t border-line pt-12 lg:mt-28">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow text-ink-soft">03 / The real thing</span>
              <h3 className="mt-3 max-w-md text-xl font-semibold text-ink sm:text-2xl">
                Polished mockups above. Below, the actual app.
              </h3>
            </div>
            <p className="max-w-xs text-sm leading-snug text-ink-soft">
              Live screens from Aeyron today - dark UI, built for glanceable,
              everyday tracking. Tap a card to bring it forward.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12">
            <DeviceGallery />
          </div>
        </Reveal>
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
