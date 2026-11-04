import { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Section } from "../components/Section";
import { Reveal } from "../components/Reveal";
import { research, validationAnchors } from "../content/research";
import type { Citation, ResearchTopic } from "../content/research";
import { disclaimer } from "../content/site";
import { easeOutExpo } from "../lib/motion";

/* -------------------------------------------------------------------------- */
/* Kinetic headline                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Big cinematic entrance for the section heading. Each word rises from depth
 * with a slight scale-up and a blur that clears, staggered left to right, so
 * the line assembles with presence instead of a flat fade. Under reduced
 * motion it renders as plain, fully-visible text.
 */
function KineticHeading({ text, className }: { text: string; className?: string }) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  if (reduced) {
    return <h2 className={className}>{text}</h2>;
  }

  return (
    <motion.h2
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.55 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
      }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-flex"
          aria-hidden="true"
        >
          <span className="inline-block overflow-hidden pb-[0.14em]">
            <motion.span
              className="inline-block origin-bottom will-change-transform"
              variants={{
                hidden: {
                  opacity: 0,
                  y: "0.7em",
                  scale: 0.86,
                  filter: "blur(10px)",
                },
                show: {
                  opacity: 1,
                  y: "0em",
                  scale: 1,
                  filter: "blur(0px)",
                  transition: { duration: 0.78, ease: easeOutExpo },
                },
              }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? <span>&nbsp;</span> : null}
        </span>
      ))}
    </motion.h2>
  );
}

/* -------------------------------------------------------------------------- */
/* Citation row                                                               */
/* -------------------------------------------------------------------------- */

function CitationRow({ c, index }: { c: Citation; index: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.li
      className="grid gap-4 py-5 will-change-transform sm:grid-cols-[1fr_auto] sm:items-start"
      initial={
        reduced
          ? false
          : { opacity: 0, y: 26, scale: 0.96, filter: "blur(8px)" }
      }
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{
        duration: 0.66,
        ease: easeOutExpo,
        delay: reduced ? 0 : Math.min(index, 5) * 0.08,
      }}
    >
      <div className="max-w-[58ch]">
        <p className="text-[0.98rem] leading-relaxed text-ink">{c.finding}</p>
        <p className="mt-2 text-sm text-ink-soft">
          <span className="font-medium text-ink">{c.authors}</span>
          <span className="text-ink-faint">{"  ·  "}</span>
          <span className="italic">{c.venue}</span>
          <span className="text-ink-faint">{"  ·  "}</span>
          <span className="tnum">{c.year}</span>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
        <span className="inline-flex items-center rounded-md bg-canvas-sunk px-2.5 py-1 font-mono text-[0.72rem] tracking-tight text-ink-soft tnum">
          n = {c.n}
        </span>
        <a
          href={"https://doi.org/" + c.doi}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md px-1 font-mono text-[0.72rem] uppercase tracking-widest text-signal transition-colors hover:text-signal-deep focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-label={`View source: ${c.authors}, ${c.venue} ${c.year} (opens in a new tab)`}
        >
          DOI
          <svg
            width="11"
            height="11"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3.5 8.5 8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </motion.li>
  );
}

/* -------------------------------------------------------------------------- */
/* Topic accordion item                                                       */
/* -------------------------------------------------------------------------- */

function TopicItem({
  topic,
  index,
  open,
  onToggle,
}: {
  topic: ResearchTopic;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const reduced = useReducedMotion();
  const panelId = `science-panel-${topic.key}`;
  const btnId = `science-trigger-${topic.key}`;

  return (
    <div className="border-t border-line first:border-t-0">
      <h3 className="m-0">
        <button
          id={btnId}
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="group flex min-h-[64px] w-full items-center gap-4 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 sm:gap-6"
        >
          <span className="font-mono text-[0.78rem] tabular-nums text-ink-faint tnum">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="flex-1 font-display text-lg leading-snug text-ink sm:text-xl">
            {topic.label}
          </span>
          <span className="hidden font-mono text-[0.72rem] uppercase tracking-widest text-ink-soft sm:inline tnum">
            {topic.citations.length}{" "}
            {topic.citations.length === 1 ? "study" : "studies"}
          </span>
          <span
            aria-hidden="true"
            className={`grid size-9 shrink-0 place-items-center rounded-full border border-line-strong text-ink-soft transition-colors group-hover:border-signal group-hover:text-signal ${
              open ? "border-signal text-signal" : ""
            }`}
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1.5v11M1.5 7h11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className={`origin-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  open ? "rotate-45" : ""
                }`}
              />
            </svg>
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={btnId}
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.42, ease: easeOutExpo }}
            className="overflow-hidden"
          >
            <ul className="ml-0 divide-y divide-line pb-3 sm:ml-[calc(0.78rem+1.5rem)]">
              {topic.citations.map((c, ci) => (
                <CitationRow key={c.doi} c={c} index={ci} />
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Privacy callout                                                            */
/* -------------------------------------------------------------------------- */

function PrivacyCallout() {
  const points = [
    {
      title: "Biomarkers extracted on-device",
      body: "Signals are computed on the phone, smart watch, and smart speaker you already hold. Raw data stays with you, not on a server by default.",
    },
    {
      title: "You stay in control",
      body: "Every source is opt-in, your trend is yours to keep, and you decide what to share with your clinician.",
    },
    {
      title: "Rhythm, never content",
      body: "Typing analysis reads the timing of keystrokes only. It never sees, stores, or transmits the words you write.",
    },
  ];

  return (
    <div className="rounded-2xl border border-line bg-paper p-7 sm:p-9">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-10 place-items-center rounded-xl bg-vital-tint text-vital"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <rect
              x="3.5"
              y="8.5"
              width="13"
              height="9"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M6.5 8.5V6a3.5 3.5 0 0 1 7 0v2.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="10" cy="13" r="1.3" fill="currentColor" />
          </svg>
        </span>
        <div>
          <p className="eyebrow text-vital">Privacy first</p>
          <p className="mt-0.5 font-display text-lg text-ink">
            Your data never leaves your hands by default.
          </p>
        </div>
      </div>

      <dl className="mt-7 grid gap-x-8 gap-y-6 sm:grid-cols-3">
        {points.map((p) => (
          <div key={p.title}>
            <dt className="text-[0.95rem] font-medium text-ink">{p.title}</dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              {p.body}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Honest framing                                                             */
/* -------------------------------------------------------------------------- */

function HonestFraming() {
  return (
    <div className="grid gap-8 rounded-2xl border border-line-strong bg-night p-8 text-mist sm:grid-cols-[1.1fr_1fr] sm:p-11">
      <div>
        <p className="eyebrow text-signal-hi">Honest framing</p>
        <p className="mt-4 max-w-[34ch] font-display text-2xl leading-tight text-mist sm:text-[1.7rem]">
          Aeyron is a research-grade companion to clinical care, not a diagnosis
          and not a replacement for your doctor.
        </p>
      </div>
      <div className="flex flex-col justify-center gap-5">
        <p className="text-[0.98rem] leading-relaxed text-mist-soft">
          Today, Aeyron is a wellness and personal-tracking tool grounded in
          published digital-biomarker research. Clinical validation against
          MDS-UPDRS and FDA review are on our roadmap, not a claim we make now.
        </p>
        <div className="rounded-xl border border-line-dark bg-white/[0.04] px-4 py-3">
          <p className="text-sm leading-relaxed text-mist-soft">
            {disclaimer.short}
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Section                                                                    */
/* -------------------------------------------------------------------------- */

export function Science() {
  const reduced = useReducedMotion();
  const [openKey, setOpenKey] = useState<string | null>(
    research[0]?.key ?? null
  );

  // Scroll-linked drift for the sticky heading block: a gentle, slow upward
  // glide + fade as the research list scrolls past, giving the column depth
  // and signalling continuity without competing with the list.
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const headY = useTransform(scrollYProgress, [0, 1], [0, -34]);
  const headOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 1, 0.72]);

  return (
    <Section id="science" tone="light">
      <div
        ref={sectionRef}
        className="grid gap-10 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:gap-16"
      >
        {/* Heading column */}
        <motion.div
          className="lg:sticky lg:top-28 lg:self-start"
          style={reduced ? undefined : { y: headY, opacity: headOpacity }}
        >
          <Reveal>
            <p className="eyebrow text-signal">The science</p>
          </Reveal>
          <KineticHeading
            text="Grounded in published research."
            className="mt-4 text-h2 text-ink"
          />
          <Reveal delay={0.06}>
            <p className="mt-5 max-w-[42ch] text-lg leading-relaxed text-ink-soft">
              Every signal Aeyron tracks traces to peer-reviewed work and aligns
              with the MDS-UPDRS measures clinicians already use. The numbers
              below are reported as the studies found them, with their sample
              sizes and sources in plain view.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-8 border-t border-line pt-6">
              <p className="eyebrow text-ink-soft">Grounded in</p>
              <motion.ul
                className="mt-3 flex flex-wrap gap-2"
                initial={reduced ? false : "hidden"}
                whileInView="show"
                viewport={{ once: true, amount: 0.5 }}
                variants={{
                  hidden: {},
                  show: {
                    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
                  },
                }}
              >
                {validationAnchors.map((a) => (
                  <motion.li
                    key={a}
                    className="rounded-full border border-line bg-canvas-sunk px-3 py-1.5 text-[0.78rem] leading-snug text-ink-soft will-change-transform"
                    variants={{
                      hidden: {
                        opacity: 0,
                        y: 18,
                        scale: 0.82,
                        filter: "blur(6px)",
                      },
                      show: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        filter: "blur(0px)",
                        transition: { duration: 0.6, ease: easeOutExpo },
                      },
                    }}
                  >
                    {a}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </Reveal>
        </motion.div>

        {/* Research list column */}
        <Reveal delay={0.12} className="min-w-0">
          <div className="rounded-2xl border border-line bg-paper px-5 sm:px-8">
            {research.map((topic, i) => (
              <TopicItem
                key={topic.key}
                topic={topic}
                index={i}
                open={openKey === topic.key}
                onToggle={() =>
                  setOpenKey((cur) => (cur === topic.key ? null : topic.key))
                }
              />
            ))}
          </div>
          <p className="mt-3 px-1 text-sm leading-relaxed text-ink-soft">
            {disclaimer.short}
          </p>
        </Reveal>
      </div>

      <div className="mt-16 space-y-10 sm:mt-20">
        <Reveal>
          <PrivacyCallout />
        </Reveal>
        <Reveal delay={0.06}>
          <HonestFraming />
        </Reveal>
      </div>
    </Section>
  );
}
