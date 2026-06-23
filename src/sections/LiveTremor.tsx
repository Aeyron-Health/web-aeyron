import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useTransform } from "framer-motion";
import { Section } from "../components/Section";
import { Reveal } from "../components/Reveal";
import { Button } from "../components/Button";
import { Magnetic } from "../components/Magnetic";
import { useDeviceMotion } from "../hooks/useDeviceMotion";
import { usePointerParallax } from "../hooks/usePointer";
import { disclaimer } from "../content/site";

/* =========================================================================
   LiveTremor - "See it on your own hand."
   A live, honest demo of the kind of motion signal Aeyron watches over time.
   Phone: reads the accelerometer (useDeviceMotion) and draws a flowing trace.
   Desktop / no sensor: an interactive pointer-driven trace so everyone gets a
   tactile taste. Reduced motion keeps the trace (it IS the point) but drops
   all decorative loops.
   ========================================================================= */

const SIGNAL_HI = "var(--color-signal-hi)";
const TRACE_LEN = 220; // ring-buffer length of the drawn waveform
const VIEW_W = 760;
const VIEW_H = 240;

type Mode = "sensor" | "pointer";

/* ----------------------------------------------------------------------- */
/* The live oscilloscope. Owns its own rAF loop and an internal ring buffer */
/* of trace heights so we never setState per frame. It pulls fresh "energy" */
/* from a getter the parent supplies (accel magnitude OR pointer speed).    */
/* ----------------------------------------------------------------------- */
function LiveTrace({
  running,
  reduced,
  readEnergy,
  onLevel,
}: {
  running: boolean;
  reduced: boolean;
  /** returns current normalized energy 0..~1.4 (shakiness) */
  readEnergy: () => number;
  /** called ~10x/s with smoothed level for the big readout */
  onLevel: (v: number) => void;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const bufRef = useRef<number[]>(new Array(TRACE_LEN).fill(VIEW_H / 2));
  const phaseRef = useRef(0);
  const smoothRef = useRef(0);
  const rafRef = useRef(0);
  const lastEmitRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const mid = VIEW_H / 2;
    const buf = bufRef.current;

    const build = () => {
      // Catmull-ish: just polyline, it's dense enough to read as smooth.
      let d = `M 0 ${buf[0].toFixed(1)}`;
      const step = VIEW_W / (TRACE_LEN - 1);
      for (let i = 1; i < TRACE_LEN; i++) {
        d += ` L ${(i * step).toFixed(1)} ${buf[i].toFixed(1)}`;
      }
      return d;
    };

    let prevTs = 0;
    const tick = (ts: number) => {
      const dt = prevTs ? Math.min(64, ts - prevTs) : 16;
      prevTs = ts;

      // smooth the incoming energy so the readout is calm, not twitchy
      const raw = readEnergy();
      const target = Math.min(1.4, raw);
      smoothRef.current += (target - smoothRef.current) * 0.12;
      const level = smoothRef.current;

      // advance an oscillator whose freq/amp track the energy: a real-ish
      // tremor sits ~3-7 Hz; we map energy into a believable band.
      phaseRef.current += (dt / 1000) * (5 + level * 9);
      const p = phaseRef.current;
      const amp = (mid - 14) * (0.06 + Math.min(1, level) * 0.82);
      const wobble =
        0.62 * Math.sin(p * 6.0) +
        0.26 * Math.sin(p * 11.3 + 1.1) +
        0.18 * Math.sin(p * 17.7 + 0.4);
      const next = mid - amp * wobble;

      // scroll the ring buffer left, push newest sample on the right
      buf.shift();
      buf.push(next);

      const d = build();
      if (pathRef.current) pathRef.current.setAttribute("d", d);
      if (glowRef.current) glowRef.current.setAttribute("d", d);

      if (ts - lastEmitRef.current > 90) {
        lastEmitRef.current = ts;
        onLevel(level);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, readEnergy, onLevel]);

  // Static, calm frame when not running (and the reduced-motion resting state).
  const restMid = VIEW_H / 2;
  const restD = (() => {
    let d = `M 0 ${restMid}`;
    const step = VIEW_W / (TRACE_LEN - 1);
    for (let i = 1; i < TRACE_LEN; i++) {
      const k = i / (TRACE_LEN - 1);
      const y = restMid - Math.sin(k * Math.PI) * 10 * Math.sin(k * 18);
      d += ` L ${(i * step).toFixed(1)} ${y.toFixed(1)}`;
    }
    return d;
  })();

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      height={VIEW_H}
      className="block"
      role="img"
      aria-label={
        running
          ? "Live trace of your motion as a flowing signal-blue line."
          : "A calm, resting motion trace."
      }
      preserveAspectRatio="none"
    >
      {/* faint baseline + center line */}
      <line
        x1="0"
        y1={VIEW_H / 2}
        x2={VIEW_W}
        y2={VIEW_H / 2}
        stroke="var(--color-line-dark)"
        strokeWidth="1"
      />
      {!reduced && running ? (
        <path
          ref={glowRef}
          d={restD}
          fill="none"
          stroke={SIGNAL_HI}
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.22"
          style={{ filter: "blur(6px)" }}
        />
      ) : null}
      <path
        ref={pathRef}
        d={running ? undefined : restD}
        fill="none"
        stroke={running ? SIGNAL_HI : "var(--color-mist-soft)"}
        strokeWidth={running ? 2.4 : 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={running ? 1 : 0.5}
      />
      {/* leading dot at the newest sample */}
      {running && !reduced ? (
        <LeadDot bufRef={bufRef} />
      ) : null}
    </svg>
  );
}

/** A small head-of-trace dot tracking the latest buffer value. */
function LeadDot({ bufRef }: { bufRef: React.RefObject<number[]> }) {
  const dotRef = useRef<SVGCircleElement>(null);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const buf = bufRef.current;
      if (dotRef.current && buf && buf.length) {
        dotRef.current.setAttribute("cy", buf[buf.length - 1].toFixed(1));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [bufRef]);
  return (
    <circle ref={dotRef} cx={VIEW_W - 2} cy={VIEW_H / 2} r="4.5" fill={SIGNAL_HI} />
  );
}

/* ----------------------------------------------------------------------- */
/* Main section                                                            */
/* ----------------------------------------------------------------------- */
export function LiveTremor() {
  const reduced = useReducedMotion();
  const { status, supported, start, stop, dataRef, readRms } = useDeviceMotion();

  // pointer-velocity energy source for the desktop / no-sensor fallback
  const pointerEnergyRef = useRef(0);
  const lastPtRef = useRef<{ x: number; y: number; t: number } | null>(null);

  // mode: do we have a usable sensor, or are we in the pointer fallback?
  const [mode, setMode] = useState<Mode>("pointer");
  const [pointerActive, setPointerActive] = useState(false);
  const [level, setLevel] = useState(0);

  const running = status === "running" || (mode === "pointer" && pointerActive);

  // ---- parallax for the card (decorative; skipped under reduced motion) ----
  const { x: px, y: py } = usePointerParallax(60);
  const cardRx = useTransform(py, (v) => v * -3);
  const cardRy = useTransform(px, (v) => v * 4);
  const glowX = useTransform(px, (v) => v * 26);
  const glowY = useTransform(py, (v) => v * 18);

  // detect a real device-motion sensor on mount to choose the default mode
  useEffect(() => {
    let cancelled = false;
    if (!supported) {
      setMode("pointer");
      return;
    }
    // If the device fires real (gravity-removed) motion events, it's a phone.
    const probe = (e: DeviceMotionEvent) => {
      const a = e.acceleration;
      if (!cancelled && a && (a.x != null || a.y != null || a.z != null)) {
        setMode("sensor");
      }
      window.removeEventListener("devicemotion", probe);
    };
    window.addEventListener("devicemotion", probe);
    const t = window.setTimeout(() => {
      window.removeEventListener("devicemotion", probe);
    }, 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
      window.removeEventListener("devicemotion", probe);
    };
  }, [supported]);

  // pointer-energy listener (only meaningful in pointer mode while active)
  useEffect(() => {
    if (mode !== "pointer" || !pointerActive) return;
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      const prev = lastPtRef.current;
      if (prev) {
        const dt = Math.max(8, now - prev.t);
        const dist = Math.hypot(e.clientX - prev.x, e.clientY - prev.y);
        const speed = dist / dt; // px per ms
        // map cursor speed into the same 0..~1.4 energy band the sensor uses
        const e01 = Math.min(1.4, speed * 0.55);
        pointerEnergyRef.current =
          pointerEnergyRef.current * 0.7 + e01 * 0.3;
      }
      lastPtRef.current = { x: e.clientX, y: e.clientY, t: now };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    // gentle decay so it settles when the cursor stops
    const decay = window.setInterval(() => {
      pointerEnergyRef.current *= 0.86;
    }, 80);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.clearInterval(decay);
    };
  }, [mode, pointerActive]);

  const readEnergy = useCallback(() => {
    if (status === "running") {
      // accel RMS (m/s^2) -> normalized energy band
      return Math.min(1.4, readRms() * 0.7);
    }
    return pointerEnergyRef.current;
  }, [status, readRms]);

  // map the smoothed level (0..1.4) to a friendly 0..100 "motion index"
  const motionIndex = Math.round(Math.min(100, level * 72));

  const handleStart = useCallback(() => {
    if (mode === "sensor") {
      void start();
    } else {
      setPointerActive(true);
    }
  }, [mode, start]);

  const handleStop = useCallback(() => {
    if (status === "running") stop();
    setPointerActive(false);
    pointerEnergyRef.current = 0;
    lastPtRef.current = null;
    setLevel(0);
  }, [status, stop]);

  const isDenied = status === "denied";

  // a human label for the index band (honest, calm)
  const indexBand =
    motionIndex < 22 ? "very steady" : motionIndex < 55 ? "moderate" : "active";

  return (
    <Section id="try-it" tone="night-deep" className="overflow-hidden">
      {/* atmospheric backdrop */}
      <div className="pointer-events-none absolute inset-0 grid-faint opacity-40" />
      {!reduced ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/3 h-[460px] w-[460px] -translate-x-1/2 rounded-full"
          style={{
            x: glowX,
            y: glowY,
            background:
              "radial-gradient(circle, var(--color-signal-tint-dark) 0%, transparent 68%)",
            opacity: 0.5,
          }}
        />
      ) : null}

      <div className="relative grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        {/* ---- Left: copy + controls ---- */}
        <div className="max-w-xl">
          <Reveal as="p" className="eyebrow text-signal-hi">
            Try it now
          </Reveal>
          <Reveal as="h2" className="mt-3 font-display text-h2 text-mist">
            See it on your own hand.
          </Reveal>
          <Reveal as="p" className="mt-5 text-lg leading-relaxed text-mist-soft" delay={0.05}>
            This is a live look at the kind of motion signal Aeyron watches over
            time. Hold still, then let your hand drift, and watch the trace
            respond. It is a wellness demo of the signal we capture, not a
            diagnosis and not a measurement of any condition.
          </Reveal>

          <Reveal className="mt-8 flex flex-wrap items-center gap-3" delay={0.1}>
            {!running ? (
              <Magnetic strength={0.25}>
                <Button variant="primary" onClick={handleStart}>
                  {mode === "sensor"
                    ? "Hold your phone and start"
                    : "Move or shake your cursor"}
                </Button>
              </Magnetic>
            ) : (
              <Button variant="secondary" tone="dark" onClick={handleStop}>
                Stop
              </Button>
            )}

            {/* contextual helper line */}
            <span className="text-sm text-mist-soft/80">
              {isDenied
                ? "Motion access was declined - no problem."
                : running
                  ? mode === "sensor"
                    ? "Hold the phone naturally."
                    : "Move your cursor to feed the trace."
                  : mode === "sensor"
                    ? "Your phone will ask for motion access."
                    : "Best experienced on your phone."}
            </span>
          </Reveal>

          {/* kindly handle denied / desktop-on-a-phone-site */}
          {isDenied ? (
            <Reveal className="mt-5 rounded-2xl border border-line-dark bg-night-raise/60 p-4 text-sm leading-relaxed text-mist-soft">
              No worries. You can still feel the idea below by moving your
              cursor, or reopen this page and allow motion access for the live
              version on your phone.
              <span className="mt-3 inline-block">
                <Button variant="ghost" tone="dark" onClick={() => setMode("pointer")}>
                  Use cursor instead
                </Button>
              </span>
            </Reveal>
          ) : null}

          {mode === "pointer" && !isDenied ? (
            <Reveal
              as="p"
              className="mt-5 flex items-start gap-2 text-sm leading-relaxed text-mist-soft/85"
              delay={0.12}
            >
              <span aria-hidden className="mt-0.5 text-signal-hi">
                {"▸"}
              </span>
              Open this page on your phone for the real thing - it reads your
              hand's actual micro-motion through the accelerometer.
            </Reveal>
          ) : null}
        </div>

        {/* ---- Right: the live instrument card ---- */}
        <Reveal delay={0.08}>
          <motion.div
            className="relative"
            style={
              reduced
                ? undefined
                : {
                    rotateX: cardRx,
                    rotateY: cardRy,
                    transformPerspective: 1200,
                  }
            }
          >
            <div className="overflow-hidden rounded-2xl border border-line-dark bg-night-raise/70 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)] backdrop-blur-[2px]">
              {/* card header */}
              <div className="flex items-center justify-between gap-4 border-b border-line-dark px-6 py-4">
                <span className="eyebrow text-mist-soft">Live motion signal</span>
                <span className="flex items-center gap-2">
                  <motion.span
                    aria-hidden
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: running ? SIGNAL_HI : "var(--color-line-dark)" }}
                    animate={
                      running && !reduced
                        ? { opacity: [1, 0.35, 1] }
                        : { opacity: 1 }
                    }
                    transition={
                      running && !reduced
                        ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                        : undefined
                    }
                  />
                  <span className="font-mono text-xs uppercase tracking-wide text-mist-soft">
                    {running ? "live" : "idle"}
                  </span>
                </span>
              </div>

              {/* the trace */}
              <div className="relative bg-night-deep/60 px-2 py-2">
                <LiveTrace
                  running={running}
                  reduced={!!reduced}
                  readEnergy={readEnergy}
                  onLevel={setLevel}
                />
                {!running ? (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="rounded-full border border-line-dark bg-night-deep/80 px-4 py-1.5 text-sm text-mist-soft">
                      {mode === "sensor"
                        ? "Press start, then move your hand"
                        : "Press start, then move your cursor"}
                    </span>
                  </div>
                ) : null}
              </div>

              {/* readout */}
              <div className="grid grid-cols-[1fr_auto] items-end gap-4 px-6 py-5">
                <div>
                  <div className="eyebrow text-mist-soft">Motion index</div>
                  <div className="mt-1 flex items-baseline gap-3">
                    <span
                      className="tnum font-display text-[2.75rem] leading-none text-signal-hi"
                      aria-hidden
                    >
                      {running ? motionIndex : "--"}
                    </span>
                    <span className="text-sm text-mist-soft">
                      {running ? indexBand : "waiting"}
                    </span>
                  </div>
                  {/* accessible live announcement, throttled by render cadence */}
                  <p className="sr-only" aria-live="polite">
                    {running
                      ? `Motion index ${motionIndex} of 100, ${indexBand}.`
                      : "Motion demo idle."}
                  </p>
                </div>

                {/* slim level meter */}
                <div className="flex h-12 items-end gap-1" aria-hidden>
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                    const threshold = ((i + 1) / 7) * 100;
                    const on = running && motionIndex >= threshold - 8;
                    return (
                      <span
                        key={i}
                        className="w-1.5 rounded-full transition-[height,background-color] duration-150"
                        style={{
                          height: `${22 + i * 10}%`,
                          backgroundColor: on
                            ? SIGNAL_HI
                            : "var(--color-line-dark)",
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* disclaimer pinned to the instrument */}
              <p className="border-t border-line-dark px-6 py-3.5 text-xs leading-relaxed text-mist-soft/80">
                {disclaimer.short}
              </p>
            </div>

            {/* soft floor reflection accent */}
            {!reduced ? (
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-6 left-1/2 h-10 w-3/4 -translate-x-1/2 rounded-full"
                style={{
                  background:
                    "radial-gradient(ellipse, var(--color-signal-tint-dark) 0%, transparent 70%)",
                  opacity: 0.4,
                }}
              />
            ) : null}
          </motion.div>
        </Reveal>
      </div>

      {/* unsupported note (rare: no DeviceMotionEvent at all) */}
      {!supported ? (
        <Reveal
          as="p"
          className="relative mt-8 text-sm text-mist-soft/80"
          delay={0.15}
        >
          Your browser does not expose motion sensors, so this shows the
          cursor-driven version. The full live demo runs on a modern phone.
        </Reveal>
      ) : null}
    </Section>
  );
}
