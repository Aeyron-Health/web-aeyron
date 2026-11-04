import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { Section } from "../components/Section";
import { Reveal } from "../components/Reveal";
import { WaveMark } from "../components/WaveMark";
import { easeOutExpo } from "../lib/motion";
import { roadmap, type RoadmapPhase } from "../content/site";

type Status = RoadmapPhase["status"];

const statusMeta: Record<Status, { label: string; dotClass: string }> = {
  now: { label: "Available now", dotClass: "bg-signal-hi" },
  next: { label: "In progress", dotClass: "bg-mist-soft" },
  horizon: { label: "The destination", dotClass: "bg-signal-hi" },
};

/**
 * A single timeline node. As the scroll reaches it the node "pops" in once
 * (scale-from-0 dot + a single accent ring expanding outward), echoing the spine
 * drawing past it. No looping pulse (that breaks the calm-clinical tone and the
 * reduced-motion contract). Static dot under reduced motion.
 */
function Node({ status, reduced }: { status: Status; reduced: boolean | null }) {
  const accent = status === "now" || status === "horizon";

  return (
    <span
      className="relative grid h-7 w-7 shrink-0 place-items-center"
      aria-hidden="true"
    >
      {accent && !reduced && (
        <motion.span
          className="absolute inset-0 rounded-full bg-signal-hi/30"
          initial={{ scale: 0.6, opacity: 0 }}
          whileInView={{ scale: [0.6, 1.9], opacity: [0.55, 0] }}
          viewport={{ once: true, amount: 0.9 }}
          transition={{ duration: 0.9, ease: easeOutExpo, delay: 0.05 }}
        />
      )}
      <motion.span
        className={`relative h-3.5 w-3.5 rounded-full ring-4 ring-night ${
          accent ? "bg-signal-hi" : "bg-night-raise"
        } ${status === "next" ? "border border-line-dark" : ""}`}
        initial={reduced ? false : { scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.9 }}
        transition={{ duration: 0.4, ease: easeOutExpo }}
      />
    </span>
  );
}

function PhaseCard({
  phase,
  index,
  reduced,
}: {
  phase: RoadmapPhase;
  index: number;
  reduced: boolean | null;
}) {
  const isStar = phase.status === "horizon";
  const meta = statusMeta[phase.status];

  return (
    <Reveal
      as="li"
      delay={Math.min(index * 0.08, 0.32)}
      className="relative flex gap-5 sm:gap-7"
    >
      {/* node column */}
      <div className="relative flex flex-col items-center pt-1.5">
        <Node status={phase.status} reduced={reduced} />
      </div>

      {/* content */}
      <div className="min-w-0 flex-1 pb-12 last:pb-0 sm:pb-16">
        <div
          className={`rounded-2xl border p-6 sm:p-8 ${
            isStar
              ? "border-signal-hi/30 bg-signal-tint-dark/40"
              : phase.status === "now"
                ? "border-line-dark bg-night-raise/70"
                : "border-line-dark bg-night-raise/40"
          }`}
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="eyebrow tnum text-signal-hi">{phase.phase}</span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-medium ${
                phase.status === "now" || isStar
                  ? "bg-signal-tint-dark text-mist"
                  : "bg-white/6 text-mist-soft"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
              {meta.label}
            </span>
          </div>

          {isStar && (
            <WaveMark className="mt-4 h-7 w-7 text-mist-soft" />
          )}

          <h3
            className={`mt-3 font-display tracking-tight text-mist ${
              isStar
                ? "text-3xl sm:text-[2.25rem] sm:leading-[1.05]"
                : "text-2xl sm:text-[1.75rem]"
            }`}
          >
            {phase.title}
          </h3>

          <p className="mt-3 max-w-xl text-[0.975rem] leading-relaxed text-mist-soft">
            {phase.body}
          </p>
        </div>
      </div>
    </Reveal>
  );
}

export function Roadmap() {
  const reduced = useReducedMotion();
  const railRef = useRef<HTMLDivElement>(null);

  // Scrub the spine "draw-in" against the timeline's scroll progress. A soft
  // spring keeps the fill from feeling mechanically locked to the wheel.
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start 0.85", "end 0.4"],
  });
  const spineScale = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1]),
    { stiffness: 90, damping: 26, mass: 0.4 },
  );
  // A faint "draw head" rides the leading edge of the fill as it advances.
  const headTop = useTransform(spineScale, (v) => `${v * 100}%`);
  const headOpacity = useTransform(scrollYProgress, [0, 0.04, 0.96, 1], [
    0, 1, 1, 0,
  ]);

  return (
    <Section id="roadmap" tone="dark" className="overflow-hidden">
      {/* faint engineering grid for depth, sparse */}
      <div
        className="grid-faint pointer-events-none absolute inset-0 opacity-50"
        aria-hidden="true"
      />

      <div className="relative">
        <header className="max-w-2xl">
          <Reveal>
            <p className="eyebrow text-signal-hi">Where we are going</p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-4 text-h2 font-display text-mist">
              A direction, set honestly.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 text-lg leading-relaxed text-mist-soft">
              Aeyron starts as a research-grounded companion you can use today,
              then earns its way toward clinical validation and regulatory
              review. This is the path ahead, stated as a plan, not a present
              claim.
            </p>
          </Reveal>
        </header>

        {/* TIMELINE */}
        <div ref={railRef} className="relative mt-14 sm:mt-20">
          {/* the spine: runs through the node column. Node column is w-7 (28px),
              its dot centers at 14px from the content's left edge. */}
          <div
            className="pointer-events-none absolute bottom-8 left-[13.5px] top-2 w-px"
            aria-hidden="true"
          >
            {/* faint full-height track */}
            <div className="absolute inset-0 bg-line-dark" />
            {/* animated drawn, signal-colored fill */}
            {reduced ? (
              <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-signal-hi via-signal to-signal-hi/0" />
            ) : (
              <>
                <motion.div
                  className="absolute inset-x-0 top-0 h-full origin-top bg-gradient-to-b from-signal-hi via-signal to-signal-hi/0"
                  style={{ scaleY: spineScale }}
                />
                {/* draw head: a soft point of light riding the leading edge */}
                <motion.span
                  className="absolute left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal-hi shadow-[0_0_10px_2px_var(--color-signal-hi)]"
                  style={{ top: headTop, opacity: headOpacity }}
                />
              </>
            )}
          </div>

          <ol className="relative">
            {roadmap.map((phase, i) => (
              <PhaseCard
                key={phase.phase}
                phase={phase}
                index={i}
                reduced={reduced}
              />
            ))}
          </ol>
        </div>

        {/* closing tease toward the North Star section */}
        <Reveal delay={0.1}>
          <p className="mt-2 max-w-xl pl-12 text-sm leading-relaxed text-mist-soft sm:pl-[3.25rem]">
            Software in your pocket today.{" "}
            <span className="text-mist">
              Ambient monitoring in your home tomorrow.
            </span>{" "}
            That is the endpoint of the same mission.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
