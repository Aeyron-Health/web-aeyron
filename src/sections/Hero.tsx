import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Section } from "../components/Section";
import { Button } from "../components/Button";
import { CinematicVideo } from "../components/CinematicVideo";
import { SignalWave } from "../components/SignalWave";
import { Magnetic } from "../components/Magnetic";
import { usePointerParallax } from "../hooks/usePointer";
import { easeOutExpo, dur } from "../lib/motion";

/**
 * Cinematic dark hero. Background cinematic clip (poster-first) with a layered
 * CSS/SVG fallback (night field + drifting SignalWave + faint grid + vignette)
 * whose layers drift at DIFFERENT depths with the pointer for real parallax.
 * Content is a single orchestrated mount entrance (eyebrow -> h1 -> sub -> ctas),
 * dropped to a static layout under reduced motion. All cursor reactivity, the
 * live-reading pulse, and the SignalWave drift are disabled under reduced motion.
 */
export function Hero() {
  const reduced = useReducedMotion();
  const { x, y } = usePointerParallax(60);

  // Scroll-linked cinematic exit (camera pull-back). As the hero scrolls out the
  // WHOLE stage scales down, blurs, and fades while the background parallaxes far
  // faster than the content (it recedes into depth) - departing the hero feels
  // like the camera dollies back off the scene. Fully neutralized under reduced
  // motion (no scale journey, no blur, no parallax).
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const contentBlurMv = useTransform(scrollYProgress, [0, 0.55], [0, 10]);
  const contentBlur = useTransform(contentBlurMv, (v) => `blur(${v}px)`);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const contentStyle = reduced
    ? undefined
    : {
        y: contentY,
        opacity: contentOpacity,
        scale: contentScale,
        filter: contentBlur,
        transformOrigin: "50% 30%",
      };
  const bgStyle = reduced ? undefined : { y: bgY, scale: bgScale };

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.1, delayChildren: 0.15 },
    },
  };

  const item = reduced
    ? { hidden: {}, show: {} }
    : {
        hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: dur.entrance, ease: easeOutExpo },
        },
      };

  // Kinetic headline: each word rises + scales up from 0.92 + clears blur with a
  // tight stagger so the line ASSEMBLES with presence instead of fading flat.
  // The words live in the same staggered timeline as the rest of the content,
  // but stagger inside themselves at a faster cadence.
  const headlineGroup = reduced
    ? { hidden: {}, show: {} }
    : {
        hidden: {},
        show: { transition: { staggerChildren: 0.045 } },
      };
  const word = reduced
    ? { hidden: {}, show: {} }
    : {
        hidden: { opacity: 0, y: "0.5em", scale: 0.92, filter: "blur(10px)" },
        show: {
          opacity: 1,
          y: "0em",
          scale: 1,
          filter: "blur(0px)",
          transition: { duration: dur.entrance, ease: easeOutExpo },
        },
      };

  // Headline tokens. `accent` words render in signal-hi. Kept as data so the
  // visible kinetic spans and the visually-hidden accessible string stay in sync.
  const headlineWords: { text: string; accent?: boolean }[] = [
    { text: "Your" },
    { text: "neurologist" },
    { text: "sees" },
    { text: "you" },
    { text: "a" },
    { text: "few" },
    { text: "times" },
    { text: "a" },
    { text: "year." },
    { text: "Life" },
    { text: "happens" },
    { text: "every", accent: true },
    { text: "day.", accent: true },
  ];
  const headlineText = headlineWords.map((w) => w.text).join(" ");

  return (
    <Section
      id="top"
      tone="night-deep"
      full
      pad="none"
      className="overflow-hidden"
      aria-label="Aeyron: a Parkinson's wellness companion"
    >
      <div ref={sectionRef} className="relative flex min-h-[100svh] flex-col">
        {/* Background layer (parallaxes slower than content on scroll for depth).
            Overscanned top/bottom so the parallax shift never exposes an edge. */}
        <motion.div
          className="absolute -inset-y-20 inset-x-0 w-full"
          style={bgStyle}
        >
          <CinematicVideo
            src="/video/hero"
            className="absolute inset-0 h-full w-full"
            overlayClassName="bg-gradient-to-b from-night-deep/55 via-night-deep/35 to-night-deep"
            position="center"
            fallback={<HeroFallback px={x} py={y} reduced={!!reduced} />}
          />
        </motion.div>

        {/* Content */}
        <div className="shell relative z-10 flex flex-1 flex-col justify-center pt-24 pb-24 sm:pt-28 sm:pb-28">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            style={contentStyle}
            className="max-w-4xl"
          >
            <motion.p
              variants={item}
              className="eyebrow flex items-center gap-2.5 text-signal-hi"
            >
              <span
                aria-hidden="true"
                className="relative inline-flex h-1.5 w-1.5"
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal-hi" />
                {!reduced && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-signal-hi"
                    animate={{ scale: [1, 2.6, 1], opacity: [0.5, 0, 0] }}
                    transition={{
                      duration: 2.4,
                      ease: "easeOut",
                      repeat: Infinity,
                    }}
                  />
                )}
              </span>
              A Parkinson's wellness companion
            </motion.p>

            {/* Kinetic headline. Words animate in individually for presence, but
                the line stays ONE <h1>: a visually-hidden full string carries the
                accessible reading, while the visible word-spans are aria-hidden. */}
            <motion.h1
              variants={headlineGroup}
              className="mt-6 text-mega font-display text-mist text-balance"
            >
              <span className="sr-only">{headlineText}</span>
              <span aria-hidden="true">
                {headlineWords.map((w, i) => (
                  <motion.span
                    key={i}
                    variants={word}
                    style={{ willChange: reduced ? undefined : "transform" }}
                    className={
                      "me-[0.26em] inline-block" +
                      (w.accent ? " text-signal-hi" : "")
                    }
                  >
                    {w.text}
                  </motion.span>
                ))}
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-6 max-w-[58ch] text-lg text-mist-soft sm:text-xl"
            >
              Aeyron uses the phone you already own to organize your walking
              pattern, phone motion, typing timing and check-ins into simple
              trends. Not a medical device. Does not diagnose.
            </motion.p>

            <motion.div
              variants={item}
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <Magnetic strength={0.25}>
                <Button variant="primary" href="#cta">
                  Get early access
                </Button>
              </Magnetic>
              <Button variant="ghost" tone="dark" href="#audiences">
                Who it's for
              </Button>
            </motion.div>

            {/* Decorative hint only: a calm pulse, no metric. */}
            <motion.div variants={item} className="mt-10">
              <LiveReadingChip reduced={!!reduced} />
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom fade + scroll cue */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-b from-transparent to-night-deep"
        />
        <a
          href="#gap"
          aria-label="Scroll to content"
          className="group absolute inset-x-0 bottom-6 z-20 mx-auto flex w-fit flex-col items-center gap-2 text-mist-soft transition-colors hover:text-mist"
        >
          <span className="eyebrow text-[0.62rem] text-mist-soft transition-colors group-hover:text-mist">
            Scroll
          </span>
          <span className="relative flex h-9 w-[22px] justify-center rounded-full border border-line-dark">
            <motion.span
              className="mt-2 block h-1.5 w-1 rounded-full bg-mist-soft"
              animate={reduced ? undefined : { y: [0, 8, 0], opacity: [1, 0.3, 1] }}
              transition={
                reduced
                  ? undefined
                  : { duration: 1.8, ease: "easeInOut", repeat: Infinity }
              }
            />
          </span>
        </a>
      </div>
    </Section>
  );
}

/**
 * Rich CSS/SVG fallback shown before the clip loads or under reduced motion.
 * Layers drift at different depths with the pointer (back layers move least,
 * foreground most) to build real parallax. Reactivity is fully disabled under
 * reduced motion (px/py are still passed but unused, layers render static).
 */
function HeroFallback({
  px,
  py,
  reduced,
}: {
  px: MotionValue<number>;
  py: MotionValue<number>;
  reduced: boolean;
}) {
  // Depth tiers: grid (deepest) -> glow -> waves -> vignette stays fixed.
  const gridX = useTransform(px, (v) => v * 8);
  const gridY = useTransform(py, (v) => v * 6);
  const glowX = useTransform(px, (v) => v * 16);
  const glowY = useTransform(py, (v) => v * 12);
  const waveBackX = useTransform(px, (v) => v * 14);
  const waveBackY = useTransform(py, (v) => v * 10);
  const waveFrontX = useTransform(px, (v) => v * 28);
  const waveFrontY = useTransform(py, (v) => v * 22);

  const layer = (mvx: MotionValue<number>, mvy: MotionValue<number>) =>
    reduced ? undefined : { x: mvx, y: mvy };

  return (
    <div className="absolute inset-0 bg-night-deep">
      {/* faint engineering grid (deepest) */}
      <motion.div
        className="absolute inset-[-3%] grid-faint opacity-60"
        style={layer(gridX, gridY)}
      />

      {/* radial signal glow over the focal area */}
      <motion.div
        className="absolute inset-[-4%]"
        style={{
          ...layer(glowX, glowY),
          background:
            "radial-gradient(120% 90% at 18% 30%, oklch(0.62 0.16 255 / 0.22), transparent 55%)",
        }}
      />

      {/* drifting biosignal field, vertically centered, fading at edges (back) */}
      <motion.div
        className="absolute inset-x-[-5%] top-[38%] opacity-25"
        style={layer(waveBackX, waveBackY)}
      >
        <SignalWave
          color="oklch(0.72 0.16 255)"
          height={140}
          intensity={0.3}
          strokeWidth={1}
          speed={17}
          className="w-full"
        />
      </motion.div>

      {/* primary biosignal field (front - drifts most) */}
      <motion.div
        className="absolute inset-x-[-6%] top-1/2 -translate-y-1/2 opacity-50"
        style={layer(waveFrontX, waveFrontY)}
      >
        <SignalWave
          color="oklch(0.72 0.16 255)"
          height={220}
          intensity={0.55}
          strokeWidth={1.5}
          speed={11}
          className="w-full"
        />
      </motion.div>

      {/* vignette for legibility (fixed, never parallaxes) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 110% at 50% 45%, transparent 40%, oklch(0.16 0.02 255 / 0.85) 100%)",
        }}
      />
    </div>
  );
}

/**
 * Honest "sensing" cue: a tiny live tremor trace + a calm label, hinting the
 * product is passively reading - NOT a metric or reading from the visitor.
 * Static (no animation) under reduced motion.
 */
function LiveReadingChip({ reduced }: { reduced: boolean }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-2xl border border-line-dark bg-night-raise/40 px-3.5 py-2">
      <span aria-hidden="true" className="relative flex h-1.5 w-1.5">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-vital" />
        {!reduced && (
          <motion.span
            className="absolute inset-0 rounded-full bg-vital"
            animate={{ scale: [1, 2.4, 1], opacity: [0.6, 0, 0] }}
            transition={{ duration: 2, ease: "easeOut", repeat: Infinity }}
          />
        )}
      </span>
      <span className="h-5 w-16 overflow-hidden" aria-hidden="true">
        <SignalWave
          color="oklch(0.78 0.13 165)"
          height={20}
          intensity={0.7}
          strokeWidth={1.25}
          speed={4.5}
          className="w-full"
        />
      </span>
      <span className="eyebrow text-[0.6rem] text-mist-soft">
        Works with the phone you own
      </span>
    </div>
  );
}
