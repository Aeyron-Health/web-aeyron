import { useMemo, useRef, useState, useCallback } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import { Section } from "../components/Section";
import { Reveal } from "../components/Reveal";
import { CountUp } from "../components/CountUp";
import { easeOutExpo } from "../lib/motion";

/* ------------------------------------------------------------------ *
 * Geometry for the one-year timeline.
 * viewBox is a fixed 1000 x 420 design space; SVG scales responsively.
 * ------------------------------------------------------------------ */
const VB_W = 1000;
const VB_H = 420;
const PAD_X = 56;
const PLOT_W = VB_W - PAD_X * 2;
const MID_Y = 232; // baseline / "average" the clinic assumes
const AMP = 120; // visual amplitude of real fluctuation

/** Deterministic restless curve = slow seasonal drift + faster on/off swings. */
function symptomY(t: number): number {
  const x = t * Math.PI * 2;
  const drift = Math.sin(x * 0.5 + 0.4) * 0.45;
  const onOff = Math.sin(x * 5.2 + 1.1) * 0.62;
  const micro = Math.sin(x * 13.5 + 2.3) * 0.16;
  const dip = Math.sin(x * 2.1 + 0.9) * 0.22;
  const v = drift + onOff + micro + dip;
  return MID_Y - v * AMP;
}

/** Normalized symptom severity at t, 0 (best) -> 1 (worst). */
function symptomLevel(t: number): number {
  // symptomY: lower y = worse. Map [MID_Y-AMP, MID_Y+AMP] -> [1, 0].
  const y = symptomY(t);
  const lvl = (MID_Y + AMP - y) / (2 * AMP);
  return Math.min(1, Math.max(0, lvl));
}

/** Human label for a severity level. */
function levelWord(lvl: number): string {
  if (lvl >= 0.62) return "harder day";
  if (lvl >= 0.38) return "mixed day";
  return "easier day";
}

/** Build a smooth-ish polyline path across the year. */
function buildCurvePath(samples = 220): string {
  let d = "";
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const x = PAD_X + t * PLOT_W;
    const y = symptomY(t);
    d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

/* ------------------------------------------------------------------ *
 * A wide, restless "banner" version of the same signal, used as the
 * cinematic backdrop behind the big scrubbed number. Same DNA as the
 * timeline curve so the moment reads as one continuous idea.
 * ------------------------------------------------------------------ */
const BAN_W = 1200;
const BAN_H = 360;
function bannerY(t: number): number {
  const x = t * Math.PI * 2;
  const drift = Math.sin(x * 0.5 + 0.4) * 0.42;
  const onOff = Math.sin(x * 5.2 + 1.1) * 0.6;
  const micro = Math.sin(x * 13.5 + 2.3) * 0.18;
  const dip = Math.sin(x * 2.1 + 0.9) * 0.2;
  const v = drift + onOff + micro + dip;
  return BAN_H / 2 - v * (BAN_H / 2 - 24);
}
function buildBannerPath(samples = 320): string {
  let d = "";
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const x = t * BAN_W;
    const y = bannerY(t);
    d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

/** Three clinic visits, spaced across the year (in normalized t). */
const VISITS = [
  { t: 0.14, label: "Spring visit" },
  { t: 0.5, label: "Summer visit" },
  { t: 0.86, label: "Autumn visit" },
].map((v) => ({
  ...v,
  x: PAD_X + v.t * PLOT_W,
  y: symptomY(v.t),
  level: symptomLevel(v.t),
}));

// Only the two endpoints, so month ticks never collide with the clinic-visit labels.
const MONTHS = ["Jan", "", "", "", "", "", "Dec"];

/** Convert a normalized year position to a readable month/day-ish label. */
function dateLabel(t: number): string {
  const names = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const dayOfYear = t * 364;
  const month = Math.min(11, Math.floor((dayOfYear / 364) * 12));
  const day = Math.max(1, Math.min(28, Math.round(((dayOfYear / 364) * 12 - month) * 28) + 1));
  return `${names[month]} ${day}`;
}

type Scrub = { t: number; x: number; y: number };

export function Gap() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const inView = useInView(svgRef, { once: true, amount: 0.4 });
  const active = reduced || inView;

  // --- Scroll-linked depth -----------------------------------------
  // Track the whole section's pass through the viewport. The header copy
  // and the chart figure ride this progress at different rates, so they
  // separate gently in depth as you scroll (continuity, not decoration).
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const prog = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.4,
  });
  // Header drifts up a touch faster; the figure trails, lagging slightly
  // behind it. Subtle deltas only (<= 40px), transform-only.
  const headerYRaw = useTransform(prog, [0, 1], [26, -26]);
  const figureYRaw = useTransform(prog, [0, 1], [40, -8]);
  const headerY = reduced ? 0 : headerYRaw;
  const figureY = reduced ? 0 : figureYRaw;

  // A faint scroll-tied progress overlay on the true curve: a second copy
  // of the path whose visible length follows scroll, drawing forward and
  // back as the section moves through view. Layered ON TOP of the existing
  // one-shot in-view draw, which stays fully intact.
  const overlayOffsetRaw = useTransform(prog, [0.1, 0.62], [3600, 0]);
  const overlayOffset = reduced ? 0 : overlayOffsetRaw;
  const overlayOpacityRaw = useTransform(
    prog,
    [0.08, 0.2, 0.6, 0.78],
    [0, 0.32, 0.32, 0],
  );
  const overlayOpacity = reduced ? 0 : overlayOpacityRaw;

  const curvePath = useMemo(() => buildCurvePath(), []);
  // Long enough to cover the path; exact length not needed for visual draw.
  const dashLen = 3600;

  // --- Interactive scrubber state -----------------------------------
  const [scrub, setScrub] = useState<Scrub | null>(null);

  const updateScrub = useCallback((clientX: number) => {
    const el = plotRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return;
    // Map client x -> viewBox x -> normalized t inside the plot area.
    const vbX = ((clientX - rect.left) / rect.width) * VB_W;
    const t = Math.min(1, Math.max(0, (vbX - PAD_X) / PLOT_W));
    setScrub({ t, x: PAD_X + t * PLOT_W, y: symptomY(t) });
  }, []);

  const clearScrub = useCallback(() => setScrub(null), []);

  // Nearest recorded clinic sample to the hovered moment.
  const nearestVisit = useMemo(() => {
    if (!scrub) return null;
    let best = VISITS[0];
    let bestD = Infinity;
    for (const v of VISITS) {
      const d = Math.abs(v.t - scrub.t);
      if (d < bestD) {
        bestD = d;
        best = v;
      }
    }
    return best;
  }, [scrub]);

  const curLevel = scrub ? symptomLevel(scrub.t) : 0;
  // How far off the nearest recorded snapshot is from this moment's reality.
  const drift =
    scrub && nearestVisit ? Math.round(Math.abs(curLevel - nearestVisit.level) * 100) : 0;

  // Tooltip horizontal placement as a % of the plot, clamped so it never clips.
  const tipLeftPct = scrub ? Math.min(82, Math.max(18, (scrub.x / VB_W) * 100)) : 50;

  return (
    <Section id="gap" tone="light">
      <div ref={sectionRef}>
      {/* Header */}
      <motion.div className="max-w-3xl" style={{ y: headerY }}>
        <Reveal>
          <p className="eyebrow text-signal">The gap</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-4 text-h2 text-ink text-balance">
            A few visits a year. Everyday life happens in between.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-6 max-w-[60ch] text-lg text-ink-soft">
            Most people with Parkinson's see their neurologist a few times a
            year. Everyday life happens in the months between those visits, and
            much of it is hard to remember once you are in the room. Aeyron helps
            you keep your own record of those days, to review with your
            clinician.
          </p>
        </Reveal>
      </motion.div>

      {/* Centerpiece: the one-year timeline */}
      <Reveal delay={0.16} className="mt-14 sm:mt-16">
        <motion.figure
          className="rounded-2xl border border-line bg-paper p-5 sm:p-8"
          style={{ y: figureY }}
        >
          {/* Legend */}
          <figcaption className="mb-6 flex flex-wrap items-center gap-x-7 gap-y-3">
            <span className="flex items-center gap-2.5">
              <svg width="34" height="10" viewBox="0 0 34 10" aria-hidden="true">
                <path
                  d="M1 7 C 6 1, 11 9, 16 4 S 28 1, 33 6"
                  fill="none"
                  stroke="var(--color-signal)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-sm font-medium text-ink">
                Everyday life (illustration)
              </span>
            </span>
            <span className="flex items-center gap-2.5">
              <span
                className="block h-3 w-3 rounded-full border-2 border-ink bg-paper"
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-ink-soft">
                Clinic visit
              </span>
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
              Illustration only, not real data
            </span>
            {/* Hover affordance, calm and quiet. */}
            <span className="hidden items-center gap-2 text-sm text-ink-faint sm:flex">
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path
                  d="M7 1 v12 M1 7 h12"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                />
              </svg>
              Hover the chart to compare any moment
            </span>
          </figcaption>

          <div
            ref={plotRef}
            className="relative w-full touch-pan-y select-none"
            onPointerMove={(e) => updateScrub(e.clientX)}
            onPointerDown={(e) => updateScrub(e.clientX)}
            onPointerLeave={clearScrub}
            onPointerCancel={clearScrub}
          >
            <svg
              ref={svgRef}
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              className="block w-full"
              role="img"
              aria-label="Illustration only, not real data. A one-year timeline: a wavy line stands for everyday life across the year, with three clinic visits marked as dots."
            >
              {/* y-axis intent labels (left-anchored so they never clip) */}
              <text
                x={2}
                y={MID_Y - AMP - 8}
                textAnchor="start"
                className="fill-ink-faint"
                style={{ fontSize: 15, fontFamily: "var(--font-mono)" }}
              >
                Harder days
              </text>
              <text
                x={2}
                y={MID_Y + AMP + 20}
                textAnchor="start"
                className="fill-ink-faint"
                style={{ fontSize: 15, fontFamily: "var(--font-mono)" }}
              >
                Easier days
              </text>

              {/* Faint horizontal guide lines */}
              {[MID_Y - AMP, MID_Y, MID_Y + AMP].map((y, i) => (
                <line
                  key={y}
                  x1={PAD_X}
                  x2={VB_W - PAD_X}
                  y1={y}
                  y2={y}
                  stroke="var(--color-line)"
                  strokeWidth={1}
                  strokeDasharray={i === 1 ? "0" : "2 6"}
                />
              ))}

              {/* What the clinic "sees": flat line connecting only the 3 visits.
                  This is the impoverished picture sparse sampling produces. */}
              <motion.polyline
                points={VISITS.map((v) => `${v.x},${v.y}`).join(" ")}
                fill="none"
                stroke="var(--color-ink)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="2 9"
                initial={reduced ? false : { opacity: 0 }}
                animate={active ? { opacity: 0.55 } : { opacity: 0 }}
                transition={{ duration: 0.6, ease: "linear", delay: 1.05 }}
              />

              {/* The true continuous signal, drawn in via stroke-dash. */}
              <motion.path
                d={curvePath}
                fill="none"
                stroke="var(--color-signal)"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ strokeDasharray: dashLen }}
                initial={reduced ? false : { strokeDashoffset: dashLen }}
                animate={active ? { strokeDashoffset: 0 } : { strokeDashoffset: dashLen }}
                transition={{ duration: 1.6, ease: easeOutExpo }}
              />

              {/* Scroll-tied accent: a faint second pass of the true curve
                  whose drawn length follows scroll progress, reinforcing the
                  continuity of the signal as the section moves through view.
                  Purely additive; the one-shot draw above is untouched. */}
              {!reduced && (
                <motion.path
                  d={curvePath}
                  fill="none"
                  stroke="var(--color-signal)"
                  strokeWidth={4.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: dashLen,
                    strokeDashoffset: overlayOffset,
                    opacity: overlayOpacity,
                  }}
                />
              )}

              {/* Vertical "gap" droplines from each visit down to the axis,
                  plus the clinic markers. */}
              {VISITS.map((v, i) => {
                const isNear = !!scrub && nearestVisit?.label === v.label;
                return (
                  <motion.g
                    key={v.label}
                    initial={reduced ? false : { opacity: 0, scale: 0.6 }}
                    animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
                    transition={{
                      duration: 0.45,
                      ease: easeOutExpo,
                      delay: 1.0 + i * 0.18,
                    }}
                    style={{ transformOrigin: `${v.x}px ${v.y}px` }}
                  >
                    <line
                      x1={v.x}
                      x2={v.x}
                      y1={v.y}
                      y2={VB_H - 44}
                      stroke="var(--color-line-strong)"
                      strokeWidth={1.5}
                    />
                    {/* halo so the marker reads against the blue curve */}
                    <circle cx={v.x} cy={v.y} r={11} fill="var(--color-paper)" />
                    {/* emphasis ring on the nearest recorded sample while scrubbing */}
                    {isNear && (
                      <circle
                        cx={v.x}
                        cy={v.y}
                        r={13}
                        fill="none"
                        stroke="var(--color-ink)"
                        strokeWidth={1.25}
                        opacity={0.4}
                      />
                    )}
                    <circle
                      cx={v.x}
                      cy={v.y}
                      r={7}
                      fill="var(--color-paper)"
                      stroke="var(--color-ink)"
                      strokeWidth={3}
                    />
                  </motion.g>
                );
              })}

              {/* --- Interactive scrubber overlay --------------------- */}
              {scrub && (
                <g aria-hidden="true">
                  {/* connector from nearest recorded sample to this moment,
                      visualizing how far the snapshot drifts from reality */}
                  {nearestVisit && (
                    <line
                      x1={nearestVisit.x}
                      y1={nearestVisit.y}
                      x2={scrub.x}
                      y2={scrub.y}
                      stroke="var(--color-ink)"
                      strokeWidth={1.25}
                      strokeDasharray="3 5"
                      opacity={0.4}
                    />
                  )}
                  {/* vertical scrubber line following the cursor */}
                  <line
                    x1={scrub.x}
                    x2={scrub.x}
                    y1={MID_Y - AMP - 6}
                    y2={VB_H - 44}
                    stroke="var(--color-signal)"
                    strokeWidth={1.5}
                    opacity={0.55}
                  />
                  {/* dot on the true curve at this moment */}
                  <circle cx={scrub.x} cy={scrub.y} r={10} fill="var(--color-paper)" />
                  <circle
                    cx={scrub.x}
                    cy={scrub.y}
                    r={5.5}
                    fill="var(--color-signal)"
                    stroke="var(--color-paper)"
                    strokeWidth={2}
                  />
                </g>
              )}

              {/* Month ticks along the baseline */}
              {MONTHS.map((m, i) => {
                const x = PAD_X + (i / (MONTHS.length - 1)) * PLOT_W;
                return (
                  <text
                    key={i}
                    x={x}
                    y={VB_H - 18}
                    textAnchor="middle"
                    className="fill-ink-faint"
                    style={{ fontSize: 16, fontFamily: "var(--font-mono)" }}
                  >
                    {m}
                  </text>
                );
              })}
            </svg>

            {/* HTML labels for the visits, positioned over the SVG.
                Kept out of the SVG for crisp, responsive type. */}
            {VISITS.map((v, i) => (
              <motion.span
                key={v.label}
                className="pointer-events-none absolute -translate-x-1/2 text-center font-mono text-[11px] uppercase tracking-wider text-ink-soft sm:text-xs"
                style={{
                  left: `${(v.x / VB_W) * 100}%`,
                  top: `${((VB_H - 38) / VB_H) * 100}%`,
                }}
                initial={reduced ? false : { opacity: 0, y: 4 }}
                animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
                transition={{ duration: 0.4, ease: easeOutExpo, delay: 1.2 + i * 0.18 }}
              >
                Clinic
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>visit
              </motion.span>
            ))}

            {/* Floating tooltip that reads this moment vs the nearest visit. */}
            {scrub && nearestVisit && (
              <motion.div
                className="pointer-events-none absolute z-10 -translate-x-1/2"
                style={{ left: `${tipLeftPct}%`, top: "-6px" }}
                initial={reduced ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: easeOutExpo }}
              >
                <div className="w-[15rem] max-w-[78vw] rounded-2xl border border-line-strong bg-paper p-3.5 shadow-sm">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                    {dateLabel(scrub.t)}
                  </p>
                  <p className="mt-2 flex items-baseline justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 text-ink-soft">
                      <span
                        className="block h-2 w-2 rounded-full bg-signal"
                        aria-hidden="true"
                      />
                      Everyday life (illustration)
                    </span>
                    <span className="font-medium text-signal-deep">
                      {levelWord(curLevel)}
                    </span>
                  </p>
                  <p className="mt-1.5 flex items-baseline justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 text-ink-soft">
                      <span
                        className="block h-2 w-2 rounded-full border-2 border-ink bg-paper"
                        aria-hidden="true"
                      />
                      Nearest clinic visit
                    </span>
                    <span className="font-medium text-ink">
                      {levelWord(nearestVisit.level)}
                    </span>
                  </p>
                  <p className="mt-2.5 border-t border-line pt-2 text-[13px] leading-snug text-ink-soft">
                    Illustration only, not real data.
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Read-out under the chart drives the point home. */}
          <div className="mt-7 grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
            <Stat unit="clinic visits / year" tone="ink">
              <CountUp to={3} duration={1.1} />
            </Stat>
            <Stat unit="hours between them" tone="signal">
              <CountUp to={8757} duration={1.7} />
            </Stat>
          </div>
        </motion.figure>
      </Reveal>

      {/* ================================================================ *
       * SIGNATURE MOMENT: the unseen-hours scrub.
       * A tall pinned beat (lg+ only) where the figure "8,757" scrubs up
       * from zero as the section passes through view, growing and gaining
       * weight while the restless signal sweeps behind it, dramatizing how
       * much reality goes unrecorded between three clinic visits.
       * On mobile + reduced-motion: a large, fully static statement.
       * ================================================================ */}
      <UnseenHours reduced={!!reduced} />

      <Reveal delay={0.1} className="mt-6">
        <p className="max-w-[60ch] text-sm text-ink-soft">
          Illustration only, not real data. The line stands for everyday life;
          the dots are clinic visits. Aeyron helps you keep your own record of
          the days in between.
        </p>
      </Reveal>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ *
 * UnseenHours: the big cinematic scrubbed-number beat.
 * Desktop (lg+, motion on): a 280vh pinned stage. As scroll progresses,
 * "8,757" scrubs from 0, scales up, and clears blur while the signal
 * banner sweeps and breathes in opacity behind it.
 * Mobile / reduced-motion: stacked, static, the full number shown plainly.
 * ------------------------------------------------------------------ */
function UnseenHours({ reduced }: { reduced: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const bannerPath = useMemo(() => buildBannerPath(), []);
  const bannerDash = 4200;

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end end"],
  });
  // Smooth the scrub so the number reads as weighty momentum, not jitter.
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 28, mass: 0.5 });

  // The scrubbed value: 0 -> 8757, settling by ~70% through the pin so the
  // full figure dominates for a beat before release.
  const TARGET = 8757;
  const countRaw = useTransform(p, [0.06, 0.72], [0, TARGET], { clamp: true });
  const [shown, setShown] = useState(0);
  useMotionValueEvent(countRaw, "change", (v) => {
    setShown(Math.round(v));
  });

  // Number presence: rises from depth, scales up, clears blur, then holds.
  const numScale = useTransform(p, [0.06, 0.46, 0.86, 1], [0.78, 1, 1, 1.04]);
  const numY = useTransform(p, [0.06, 0.46], [54, 0]);
  const numBlur = useTransform(p, [0.06, 0.4], [10, 0]);
  const numFilter = useTransform(numBlur, (b) => `blur(${b}px)`);
  const numOpacity = useTransform(p, [0.04, 0.22, 0.92, 1], [0, 1, 1, 0.9]);

  // Supporting copy fades up slightly after the number lands.
  const labelOpacity = useTransform(p, [0.34, 0.5], [0, 1]);
  const labelY = useTransform(p, [0.34, 0.5], [22, 0]);

  // Eyebrow leads in first.
  const eyebrowOpacity = useTransform(p, [0.02, 0.16], [0, 1]);

  // Banner signal: draws in across the first half, then sweeps horizontally
  // (parallax) and breathes opacity. Transform/opacity/dash only.
  const bannerDraw = useTransform(p, [0.05, 0.55], [bannerDash, 0]);
  const bannerX = useTransform(p, [0, 1], ["-6%", "6%"]);
  const bannerOpacity = useTransform(
    p,
    [0.05, 0.3, 0.8, 1],
    [0, 0.5, 0.5, 0.22],
  );
  // A second, deeper banner layer moving at a different rate for depth.
  const banner2X = useTransform(p, [0, 1], ["4%", "-5%"]);
  const banner2Opacity = useTransform(p, [0.1, 0.4, 0.85, 1], [0, 0.18, 0.18, 0.08]);

  const grouped = shown.toLocaleString();

  // ---- Reduced-motion / mobile-friendly STATIC fallback -------------
  // Mobile never pins; we render the static block on small screens regardless,
  // and the lg+ pinned stage only mounts on large viewports.
  const Static = (
    <Reveal delay={0.04} className="mt-16">
      <div className="relative overflow-hidden rounded-2xl border border-line bg-paper px-6 py-12 sm:px-10 sm:py-16">
        {/* calm static signal motif behind, fully visible content */}
        <svg
          viewBox={`0 0 ${BAN_W} ${BAN_H}`}
          preserveAspectRatio="xMidYMid slice"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.4]"
          aria-hidden="true"
        >
          <path
            d={bannerPath}
            fill="none"
            stroke="var(--color-signal)"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="relative">
          <p className="eyebrow text-signal">Between the three visits</p>
          <p className="mt-4 leading-none">
            <span className="tnum block text-[clamp(3.5rem,16vw,11rem)] font-semibold text-signal">
              8,757
            </span>
          </p>
          <p className="mt-4 max-w-[44ch] text-lg text-ink sm:text-xl">
            hours of everyday life happen between three clinic visits. Aeyron
            helps you keep them organized.
          </p>
        </div>
      </div>
    </Reveal>
  );

  if (reduced) {
    return Static;
  }

  return (
    <>
      {/* Mobile + tablet (< lg): static statement, no pin, no scrub. */}
      <div className="lg:hidden">{Static}</div>

      {/* Desktop (lg+): pinned cinematic scrub. */}
      <div ref={stageRef} className="relative mt-20 hidden h-[280vh] lg:block">
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
          <div className="relative w-full">
            {/* Restless signal banner layers (parallax depth) */}
            <motion.svg
              viewBox={`0 0 ${BAN_W} ${BAN_H}`}
              preserveAspectRatio="xMidYMid slice"
              className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[130%] -translate-x-1/2 -translate-y-1/2"
              style={{ x: banner2X, opacity: banner2Opacity }}
              aria-hidden="true"
            >
              <path
                d={bannerPath}
                fill="none"
                stroke="var(--color-signal)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
            <motion.svg
              viewBox={`0 0 ${BAN_W} ${BAN_H}`}
              preserveAspectRatio="xMidYMid slice"
              className="pointer-events-none absolute left-1/2 top-1/2 h-[110%] w-[120%] -translate-x-1/2 -translate-y-1/2"
              style={{ x: bannerX, opacity: bannerOpacity }}
              aria-hidden="true"
            >
              <motion.path
                d={bannerPath}
                fill="none"
                stroke="var(--color-signal)"
                strokeWidth={4.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ strokeDasharray: bannerDash, strokeDashoffset: bannerDraw }}
              />
            </motion.svg>

            {/* The big scrubbed figure */}
            <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
              <motion.p
                className="eyebrow text-signal"
                style={{ opacity: eyebrowOpacity }}
              >
                Between the three visits
              </motion.p>

              <motion.div
                className="tnum mt-4 font-semibold leading-[0.86] text-signal"
                style={{
                  scale: numScale,
                  y: numY,
                  filter: numFilter,
                  opacity: numOpacity,
                  fontSize: "clamp(7rem, 22vw, 20rem)",
                }}
                aria-hidden="true"
              >
                {grouped}
              </motion.div>

              {/* Accessible, non-animated statement of the same fact. */}
              <span className="sr-only">
                8,757 hours of everyday life happen between three clinic visits.
              </span>

              <motion.p
                className="mt-6 max-w-[42ch] text-balance text-xl text-ink sm:text-2xl"
                style={{ opacity: labelOpacity, y: labelY }}
              >
                hours of everyday life happen between three clinic visits.
                <span className="text-signal-deep"> Aeyron helps you keep them organized.</span>
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({
  children,
  unit,
  tone,
}: {
  children: React.ReactNode;
  unit: string;
  tone: "ink" | "signal";
}) {
  return (
    <div>
      <div
        className={`tnum text-3xl font-semibold sm:text-4xl ${
          tone === "signal" ? "text-signal" : "text-ink"
        }`}
      >
        {children}
      </div>
      <div className="mt-1.5 text-sm text-ink-soft">{unit}</div>
    </div>
  );
}
