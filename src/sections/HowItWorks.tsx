import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useMotionValueEvent,
  useTransform,
  useSpring,
} from "framer-motion";
import { Section } from "../components/Section";
import { Reveal } from "../components/Reveal";
import { SignalWave } from "../components/SignalWave";
import { PhoneFrame } from "../components/PhoneFrame";
import { usePointerParallax } from "../hooks/usePointer";
import { measurements, type Measurement } from "../content/site";
import { research } from "../content/research";
import { easeOutExpo } from "../lib/motion";

/* =========================================================================
   How It Works - the showpiece.

   A sticky cinematic stage: a central phone device sits at the heart of the
   left panel, its SCREEN showing the active measurement's signal LIVE. Each
   signal EMANATES from the device - concentric rings, particles, and traces
   that flow out past the phone edges into the surrounding panel. Subtle
   pointer parallax separates the device from its background field. The active
   signal crossfades cinematically (scale/opacity/blur) as the scroll index
   changes.

   All motion is transform/opacity (+ SVG pathLength). Everything degrades to a
   calm static frame under prefers-reduced-motion: no rAF, no loops, no
   parallax.
   ========================================================================= */

const SIGNAL = "var(--color-signal)";
const SIGNAL_HI = "var(--color-signal-hi)";

type VizProps = { active: boolean; reduced: boolean };

/* -------------------------------------------------------------------------
   ON-SCREEN signal views (drawn INSIDE the phone screen).
   Compact, dark-surface versions tuned to read at phone scale.
   ------------------------------------------------------------------------- */

/* Phone motion: a calm decorative trace on screen (illustration, not data). */
function ScreenTremor({ active, reduced }: VizProps) {
  return (
    <div className="flex h-full w-full flex-col">
      <ScreenHeader label="Phone motion" unit="day to day" />
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          <SignalWave
            color={SIGNAL_HI}
            height={140}
            intensity={active && !reduced ? 0.95 : 0.5}
            strokeWidth={2}
            speed={2.2}
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-40">
          <SignalWave color={SIGNAL} height={90} intensity={0.4} strokeWidth={1} speed={4.5} />
        </div>
      </div>
      <ScreenFooter>While you hold the phone</ScreenFooter>
    </div>
  );
}

/* Gait: cadence pulses walking across a baseline. */
function ScreenGait({ active, reduced }: VizProps) {
  const steps = [0, 1, 2, 3, 4];
  return (
    <div className="flex h-full w-full flex-col">
      <ScreenHeader label="Walking" unit="Apple Health" />
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <svg viewBox="0 0 240 130" className="w-[88%]" role="img" aria-label="Walking pattern illustration">
          <line x1="0" y1="98" x2="240" y2="98" stroke={SIGNAL_HI} strokeOpacity="0.2" strokeWidth="1" />
          {steps.map((s) => {
            const x = 26 + s * 48;
            return (
              <g key={s}>
                <motion.line
                  x1={x}
                  y1={98}
                  x2={x}
                  y2={48}
                  stroke={SIGNAL_HI}
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={false}
                  animate={
                    active && !reduced
                      ? { opacity: [0.12, 0.85, 0.12], scaleY: [0.4, 1, 0.4] }
                      : { opacity: 0.4, scaleY: 1 }
                  }
                  style={{ transformOrigin: `${x}px 98px` }}
                  transition={{
                    duration: 1.05,
                    repeat: active && !reduced ? Infinity : 0,
                    ease: "easeInOut",
                    delay: s * 0.18,
                  }}
                />
                <motion.circle
                  cx={x}
                  cy={98}
                  r="4"
                  fill={SIGNAL_HI}
                  initial={false}
                  animate={
                    active && !reduced ? { opacity: [0.3, 1, 0.3], y: [0, -2, 0] } : { opacity: 0.6, y: 0 }
                  }
                  transition={{
                    duration: 1.05,
                    repeat: active && !reduced ? Infinity : 0,
                    ease: "easeInOut",
                    delay: s * 0.18,
                  }}
                />
              </g>
            );
          })}
        </svg>
      </div>
      <ScreenFooter>Walking pattern from Apple Health</ScreenFooter>
    </div>
  );
}

/* Finger tapping: rhythmic bars with slight variability. */
function ScreenTap({ active, reduced }: VizProps) {
  const bars = Array.from({ length: 7 });
  const jitter = [0, 0.05, -0.03, 0.06, -0.02, 0.04, 0];
  return (
    <div className="flex h-full w-full flex-col">
      <ScreenHeader label="Tapping" unit="interval" />
      <div className="flex flex-1 items-end justify-center gap-2 overflow-hidden px-6 pb-6 pt-2">
        {bars.map((_, i) => (
          <motion.span
            key={i}
            className="h-full w-3 rounded-full"
            style={{ background: SIGNAL_HI, transformOrigin: "bottom" }}
            initial={false}
            animate={
              active && !reduced
                ? { scaleY: [0.18, 1, 0.18], opacity: [0.45, 1, 0.45] }
                : { scaleY: 0.55, opacity: 0.6 }
            }
            transition={{
              duration: 0.62 + jitter[i],
              repeat: active && !reduced ? Infinity : 0,
              ease: "easeInOut",
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
      <ScreenFooter>Rhythm and variability</ScreenFooter>
    </div>
  );
}

/* Typing: keycaps lighting in cadence - timing, never words. */
function ScreenTyping({ active, reduced }: VizProps) {
  const rows = [Array(5).fill(0), Array(5).fill(0), Array(4).fill(0)];
  let idx = 0;
  return (
    <div className="flex h-full w-full flex-col">
      <ScreenHeader label="Typing" unit="timing" />
      <div className="flex flex-1 flex-col items-center justify-center gap-1.5 overflow-hidden px-3">
        {rows.map((row, r) => (
          <div key={r} className="flex gap-1.5" style={{ marginLeft: r * 10 }}>
            {row.map((_: number, c: number) => {
              const myIdx = idx++;
              return (
                <motion.span
                  key={c}
                  className="h-5 w-6 rounded-[5px] border border-line-dark"
                  initial={false}
                  animate={
                    active && !reduced
                      ? {
                          backgroundColor: [
                            "var(--color-night-raise)",
                            SIGNAL,
                            "var(--color-night-raise)",
                          ],
                        }
                      : { backgroundColor: "var(--color-night-raise)" }
                  }
                  transition={{
                    duration: 0.5,
                    repeat: active && !reduced ? Infinity : 0,
                    repeatDelay: 1.6,
                    ease: "easeInOut",
                    delay: (myIdx % 11) * 0.17,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <ScreenFooter>Timing, never the words</ScreenFooter>
    </div>
  );
}

/* Voice: mirrored jitter/shimmer bars. */
function ScreenVoice({ active, reduced }: VizProps) {
  const bars = Array.from({ length: 15 });
  const profile = bars.map((_, i) => {
    const k = i / (bars.length - 1);
    return 0.3 + Math.sin(k * Math.PI) * 0.7;
  });
  return (
    <div className="flex h-full w-full flex-col">
      <ScreenHeader label="Voice" unit="jitter" />
      <div className="flex flex-1 items-center justify-center gap-1 overflow-hidden px-5">
        {bars.map((_, i) => {
          const h = profile[i];
          return (
            <motion.span
              key={i}
              className="w-1 rounded-full"
              style={{ background: SIGNAL_HI, height: `${h * 84}px`, transformOrigin: "center" }}
              initial={false}
              animate={
                active && !reduced
                  ? { scaleY: [h * 0.45, 1, h * 0.6, 0.9, h * 0.45], opacity: [0.5, 1, 0.7, 1, 0.5] }
                  : { scaleY: 0.7, opacity: 0.6 }
              }
              transition={{
                duration: 1.6,
                repeat: active && !reduced ? Infinity : 0,
                ease: "easeInOut",
                delay: i * 0.05,
              }}
            />
          );
        })}
      </div>
      <ScreenFooter>A few seconds at a time</ScreenFooter>
    </div>
  );
}

/* Non-motor: small-multiple sparkline tiles. */
function ScreenNonMotor({ active, reduced }: VizProps) {
  const tiles: { label: string; pts: number[] }[] = [
    { label: "sleep", pts: [6, 5, 7, 6, 8, 7, 8] },
    { label: "energy", pts: [4, 5, 4, 6, 5, 4, 5] },
    { label: "mood", pts: [3, 4, 4, 5, 4, 6, 5] },
    { label: "meds", pts: [7, 7, 6, 7, 7, 7, 8] },
  ];
  return (
    <div className="flex h-full w-full flex-col">
      <ScreenHeader label="Check-ins" unit="you log" />
      <div className="grid flex-1 grid-cols-2 content-center gap-2 overflow-hidden px-3 py-2">
        {tiles.map((t, ti) => {
          const max = Math.max(...t.pts);
          const min = Math.min(...t.pts);
          const span = Math.max(1, max - min);
          const w = 100;
          const h = 30;
          const d = t.pts
            .map((p, i) => {
              const x = (i / (t.pts.length - 1)) * w;
              const y = h - ((p - min) / span) * (h - 6) - 3;
              return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
            })
            .join(" ");
          return (
            <div key={t.label} className="rounded-[10px] border border-line-dark bg-night-raise/60 p-2">
              <p className="eyebrow mb-1 text-[0.55rem] text-mist-soft">{t.label}</p>
              <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label={`${t.label} trend`}>
                <motion.path
                  d={d}
                  fill="none"
                  stroke={SIGNAL_HI}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={false}
                  animate={active && !reduced ? { pathLength: [0, 1] } : { pathLength: 1 }}
                  transition={{
                    duration: 1.1,
                    ease: easeOutExpo,
                    delay: ti * 0.18,
                    repeat: active && !reduced ? Infinity : 0,
                    repeatDelay: 2.4,
                  }}
                />
              </svg>
            </div>
          );
        })}
      </div>
      <ScreenFooter>Check-ins you log yourself</ScreenFooter>
    </div>
  );
}

/* Deep tests: spiral drawing trace. */
function ScreenDeepTests({ active, reduced }: VizProps) {
  const cx = 90;
  const cy = 90;
  const turns = 3.2;
  const segs = 220;
  const pts: string[] = [];
  for (let i = 0; i <= segs; i++) {
    const t = (i / segs) * turns * Math.PI * 2;
    const r = (i / segs) * 70;
    const x = cx + r * Math.cos(t);
    const y = cy + r * Math.sin(t);
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  const spiral = pts.join(" ");
  return (
    <div className="flex h-full w-full flex-col">
      <ScreenHeader label="Deep tests" unit="spiral" />
      <div className="flex flex-1 items-center justify-center overflow-hidden">
        <svg viewBox="0 0 180 180" className="h-[88%]" role="img" aria-label="Spiral drawing trace">
          <path d={spiral} fill="none" stroke={SIGNAL_HI} strokeOpacity="0.16" strokeWidth="2" />
          <motion.path
            d={spiral}
            fill="none"
            stroke={SIGNAL_HI}
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={false}
            animate={active && !reduced ? { pathLength: [0, 1] } : { pathLength: 1 }}
            transition={{
              duration: 2.6,
              ease: "easeInOut",
              repeat: active && !reduced ? Infinity : 0,
              repeatDelay: 1.2,
            }}
          />
        </svg>
      </div>
      <ScreenFooter>Spiral, reaction, memory</ScreenFooter>
    </div>
  );
}

/* Small chrome helpers for the phone screen. */
function ScreenHeader({ label, unit }: { label: string; unit: string }) {
  return (
    <div className="flex items-center justify-between px-4 pt-7">
      <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-mist">{label}</span>
      <span className="tnum font-mono text-[0.62rem] text-signal-hi">{unit}</span>
    </div>
  );
}
function ScreenFooter({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pb-5 pt-1 text-center font-mono text-[0.6rem] leading-snug text-mist-soft">
      {children}
    </p>
  );
}

type ScreenComp = (p: VizProps) => React.ReactNode;
const SCREENS: Record<Measurement["viz"], ScreenComp> = {
  tremor: ScreenTremor,
  gait: ScreenGait,
  tap: ScreenTap,
  typing: ScreenTyping,
  voice: ScreenVoice,
  nonmotor: ScreenNonMotor,
  deeptests: ScreenDeepTests,
};

/* -------------------------------------------------------------------------
   EMANATION layer - the signal flowing OUT past the phone into the panel.
   Per-viz variants give each measurement its own texture. Pure
   transform/opacity + pathLength; nothing animates under reduced motion.
   ------------------------------------------------------------------------- */
function Emanation({ m, active, reduced }: { m: Measurement; active: boolean; reduced: boolean }) {
  const on = active && !reduced;

  // Concentric "broadcast" rings - shared across continuous signals.
  const rings = (count: number, color: string) =>
    Array.from({ length: count }).map((_, i) => (
      <motion.span
        key={i}
        aria-hidden
        className="absolute left-1/2 top-1/2 rounded-full border"
        style={{
          width: 220 + i * 150,
          height: 220 + i * 150,
          marginLeft: -(110 + i * 75),
          marginTop: -(110 + i * 75),
          borderColor: color,
        }}
        initial={false}
        animate={
          on
            ? { opacity: [0, 0.22, 0], scale: [0.85, 1.12, 1.28] }
            : { opacity: reduced ? 0.1 : 0, scale: 1 }
        }
        transition={{
          duration: 3.6,
          repeat: on ? Infinity : 0,
          ease: "easeOut",
          delay: i * 0.9,
        }}
      />
    ));

  // A horizontal trace continuing left + right past the device edges.
  const lateralTrace = (color: string) => (
    <>
      <div className="pointer-events-none absolute left-0 top-1/2 hidden w-[34%] -translate-y-1/2 opacity-50 lg:block">
        <SignalWave color={color} height={70} intensity={0.4} strokeWidth={1.25} speed={3.2} />
      </div>
      <div className="pointer-events-none absolute right-0 top-1/2 hidden w-[34%] -translate-y-1/2 opacity-50 lg:block">
        <SignalWave color={color} height={70} intensity={0.4} strokeWidth={1.25} speed={3.2} />
      </div>
    </>
  );

  switch (m.viz) {
    case "tremor":
      return (
        <>
          {rings(3, SIGNAL)}
          {lateralTrace(SIGNAL)}
        </>
      );
    case "gait":
      return (
        <div className="pointer-events-none absolute inset-x-0 top-[62%] hidden -translate-y-1/2 lg:block">
          <svg viewBox="0 0 600 60" className="w-full" preserveAspectRatio="none" role="presentation">
            <line x1="0" y1="40" x2="600" y2="40" stroke={SIGNAL} strokeOpacity="0.14" strokeWidth="1" />
            {Array.from({ length: 11 }).map((_, i) => {
              const x = 30 + i * 54;
              return (
                <motion.circle
                  key={i}
                  cx={x}
                  cy={40}
                  r="3.5"
                  fill={SIGNAL}
                  initial={false}
                  animate={on ? { opacity: [0.1, 0.6, 0.1], cy: [40, 36, 40] } : { opacity: reduced ? 0.25 : 0 }}
                  transition={{ duration: 1.1, repeat: on ? Infinity : 0, ease: "easeInOut", delay: i * 0.12 }}
                />
              );
            })}
          </svg>
        </div>
      );
    case "voice":
      return rings(3, SIGNAL);
    case "deeptests":
      return rings(2, SIGNAL);
    case "tap":
    case "typing":
    case "nonmotor":
    default:
      return lateralTrace(SIGNAL);
  }
}

const hasResearch = (key?: string) => !!key && research.some((r) => r.key === key);

/* =========================================================================
   Item copy block (shared between sticky + stacked layouts)
   ========================================================================= */
function ItemCopy({ m, index }: { m: Measurement; index: number }) {
  return (
    <div className="max-w-xl">
      <div className="mb-4 flex items-center gap-3">
        <span className="tnum text-[0.78rem] font-medium text-signal">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="h-px w-8 bg-line-strong" />
        {hasResearch(m.researchKey) && (
          <span className="eyebrow inline-flex items-center gap-1.5 rounded-full bg-signal-tint px-2.5 py-1 text-signal-deep">
            <span className="block h-1.5 w-1.5 rounded-full bg-signal" aria-hidden />
            Background research
          </span>
        )}
      </div>
      <h3 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">{m.name}</h3>
      <p className="mt-4 text-lg leading-relaxed text-ink">{m.what}</p>
      <p className="mt-3 text-base leading-relaxed text-ink-soft">{m.how}</p>
      <div className="mt-6 flex items-start gap-3 border-l-2 border-signal/40 pl-4">
        <p className="text-[0.95rem] leading-relaxed text-ink-soft">{m.signal}</p>
      </div>
    </div>
  );
}

/* =========================================================================
   Sticky / scroll-driven layout (lg+, motion enabled)
   ========================================================================= */
function StickyExperience() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const parallax = usePointerParallax(60);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const n = measurements.length;
    const i = Math.min(n - 1, Math.max(0, Math.floor(p * n - 0.0001)));
    setActive((prev) => (prev === i ? prev : i));
  });

  // Scroll-linked depth: the background field drifts up a touch faster than the
  // device as you travel through the section, deepening the parallax. Spring-
  // smoothed so index snaps never read as jitter on the field.
  const scrollDrift = useSpring(scrollYProgress, { stiffness: 60, damping: 26, mass: 0.5 });
  const bgScrollY = useTransform(scrollDrift, [0, 1], [22, -22]);
  const devScrollY = useTransform(scrollDrift, [0, 1], [-8, 8]);

  // parallax depths (pointer) composed with scroll drift
  const bgX = useTransform(parallax.x, (v) => v * 26);
  const bgY = useTransform([parallax.y, bgScrollY], ([p, s]: number[]) => p * 20 + s);
  const devX = useTransform(parallax.x, (v) => v * -10);
  const devY = useTransform([parallax.y, devScrollY], ([p, s]: number[]) => p * -8 + s);

  return (
    <div ref={sectionRef} className="relative">
      <div className="grid grid-cols-12 gap-12">
        {/* Sticky left stage - column must stretch full height so the sticky
            element sticks across the whole scroll (not just one screen). */}
        <div className="col-span-5">
          <div className="sticky top-0 flex h-screen flex-col justify-center py-20">
            <div
              className="relative mx-auto aspect-[4/5] max-h-[70vh] w-full overflow-hidden rounded-2xl border border-line bg-night-deep grid-faint"
            >
              {/* soft signal glow */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  x: bgX,
                  y: bgY,
                  background:
                    "radial-gradient(closest-side, oklch(0.62 0.16 255 / 0.18) 0%, transparent 72%)",
                }}
              />

              {/* Emanation field (behind device), crossfaded per active signal */}
              <motion.div aria-hidden className="absolute inset-0" style={{ x: bgX, y: bgY }}>
                {measurements.map((m, i) => (
                  <motion.div
                    key={m.id}
                    className="absolute inset-0"
                    initial={false}
                    animate={{ opacity: active === i ? 1 : 0 }}
                    transition={{ duration: active === i ? 0.6 : 0.32, ease: easeOutExpo }}
                  >
                    <Emanation m={m} active={active === i} reduced={false} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Watch element beside the phone */}
              <motion.div
                aria-hidden
                className="absolute left-[14%] top-1/2 z-10 hidden h-[18%] w-[15%] -translate-y-1/2 rounded-[1.1rem] border border-line-dark bg-night-raise shadow-[0_18px_40px_-18px_oklch(0.13_0.016_255/0.7)] xl:block"
                style={{ x: devX, y: devY }}
              >
                <div className="absolute inset-1.5 overflow-hidden rounded-[0.8rem] bg-night-deep">
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
                    <SignalWave color={SIGNAL_HI} height={44} intensity={0.85} strokeWidth={1.25} speed={2} />
                  </div>
                </div>
              </motion.div>

              {/* The device - phone with crossfading live screens */}
              <motion.div
                className="absolute left-1/2 top-1/2 z-20 w-[54%] max-w-[230px] -translate-x-1/2 -translate-y-1/2"
                style={{ x: devX, y: devY }}
              >
                <PhoneFrame>
                  <div className="relative h-full w-full">
                    {measurements.map((m, i) => {
                      const Screen = SCREENS[m.viz];
                      return (
                        <motion.div
                          key={m.id}
                          className="absolute inset-0"
                          initial={false}
                          animate={{
                            opacity: active === i ? 1 : 0,
                            scale: active === i ? 1 : 1.04,
                            filter: active === i ? "blur(0px)" : "blur(8px)",
                          }}
                          transition={{ duration: 0.5, ease: easeOutExpo }}
                          style={{ pointerEvents: active === i ? "auto" : "none" }}
                          aria-hidden={active !== i}
                        >
                          {Screen({ active: active === i, reduced: false })}
                        </motion.div>
                      );
                    })}
                  </div>
                </PhoneFrame>
              </motion.div>
            </div>

            {/* Narrative footer: index + name + progress rail */}
            <div className="mt-6 flex items-center gap-4">
              <div className="relative h-7 min-w-[3.2rem] overflow-hidden">
                {measurements.map((m, i) => (
                  <motion.span
                    key={m.id}
                    className="tnum absolute inset-0 font-mono text-[0.95rem] text-signal-deep"
                    initial={false}
                    animate={{
                      opacity: active === i ? 1 : 0,
                      y: active === i ? 0 : active > i ? -10 : 10,
                    }}
                    transition={{ duration: 0.4, ease: easeOutExpo }}
                    aria-hidden={active !== i}
                  >
                    {String(i + 1).padStart(2, "0")} / {String(measurements.length).padStart(2, "0")}
                  </motion.span>
                ))}
              </div>
              <div className="flex flex-1 items-center gap-2" aria-hidden>
                {measurements.map((m, i) => (
                  <span
                    key={m.id}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      active === i ? "w-8 bg-signal" : "w-3 bg-line-strong"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scrolling right list */}
        <div className="col-span-7">
          {measurements.map((m, i) => (
            <div key={m.id} className="flex min-h-screen flex-col justify-center">
              <motion.div
                initial={false}
                animate={{
                  opacity: active === i ? 1 : 0.32,
                  x: active === i ? 0 : 8,
                  // Active copy settles up from a touch lower for a more
                  // expressive arrival; inactive rests flat and calm.
                  y: active === i ? 0 : 14,
                  scale: active === i ? 1 : 0.985,
                }}
                transition={{
                  duration: active === i ? 0.6 : 0.32,
                  ease: easeOutExpo,
                }}
                style={{ transformOrigin: "left center" }}
              >
                <ItemCopy m={m} index={i} />
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Stacked layout (mobile + reduced motion): live device above each copy.
   ========================================================================= */
function StackedExperience({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-20">
      {measurements.map((m, i) => {
        const Screen = SCREENS[m.viz];
        return (
          <Reveal key={m.id} className="flex flex-col gap-8">
            <div className="relative mx-auto w-full max-w-[440px] overflow-hidden rounded-2xl border border-line bg-night-deep grid-faint p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-[55%] w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  background:
                    "radial-gradient(closest-side, oklch(0.62 0.16 255 / 0.16) 0%, transparent 72%)",
                }}
              />
              <div className="absolute inset-0">
                <Emanation m={m} active={!reduced} reduced={reduced} />
              </div>
              <div className="relative z-10 mx-auto w-[58%] max-w-[200px]">
                <PhoneFrame>
                  <div className="h-full w-full">{Screen({ active: !reduced, reduced })}</div>
                </PhoneFrame>
              </div>
            </div>
            <ItemCopy m={m} index={i} />
          </Reveal>
        );
      })}
    </div>
  );
}

/* =========================================================================
   Section
   ========================================================================= */
export function HowItWorks() {
  const reduced = useReducedMotion();
  const [isLarge, setIsLarge] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsLarge(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const useSticky = isLarge && !reduced;

  return (
    <Section id="how-it-works" tone="light" pad="default">
      {/* Header */}
      <div className="mb-16 max-w-2xl lg:mb-24">
        <Reveal>
          <p className="eyebrow text-signal-deep">How it works</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-5 text-h2 text-ink">Four everyday inputs, organized for you</h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-6 text-lg leading-relaxed text-ink-soft">
            Aeyron uses the phone you already own to organize your walking
            pattern, phone motion, typing timing and check-ins into simple
            trends, compared with your own past. No new hardware. Here is what
            it uses, and how.
          </p>
        </Reveal>
      </div>

      {useSticky ? <StickyExperience /> : <StackedExperience reduced={!!reduced} />}
    </Section>
  );
}
