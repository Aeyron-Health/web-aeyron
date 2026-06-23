import { motion, useReducedMotion } from "framer-motion";
import { Section } from "../components/Section";
import { easeOutExpo } from "../lib/motion";

/** Words that shed friction, revealed in sequence. */
const FRICTION = ["No clinic.", "No extra device.", "No friction."];

export function Shift() {
  const reduced = useReducedMotion();

  return (
    <Section id="shift" tone="clear" full pad="none">
      <div className="relative isolate min-h-[78svh] overflow-hidden">
        {/* The persistent Signal Thread (App background) shows through here.
            A left scrim + vignette keep the type legible over it. */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, oklch(0.12 0.016 255 / 0.84) 0%, oklch(0.12 0.016 255 / 0.45) 40%, transparent 70%), radial-gradient(120% 95% at 50% 50%, transparent 35%, oklch(0.13 0.018 255 / 0.5) 100%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex min-h-[78svh] items-center">
          <div className="shell w-full">
            <div className="max-w-3xl">
              <motion.p
                className="eyebrow text-signal-hi"
                initial={reduced ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, ease: easeOutExpo }}
              >
                The shift
              </motion.p>

              <motion.h2
                className="mt-6 text-balance text-4xl leading-[1.02] tracking-[-0.02em] text-mist sm:text-5xl md:text-h2"
                initial={reduced ? false : { opacity: 0, y: 18, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.7, ease: easeOutExpo, delay: 0.08 }}
              >
                So we stopped waiting for the next appointment.
              </motion.h2>

              <motion.p
                className="mt-7 max-w-2xl text-lg leading-relaxed text-mist-soft sm:text-xl"
                initial={reduced ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.65, ease: easeOutExpo, delay: 0.2 }}
              >
                Aeyron turns the phone and watch you already carry into continuous,
                passive monitoring.
              </motion.p>

              {/* Friction, shed. Each clause reveals in sequence. */}
              <motion.ul
                className="mt-9 flex flex-wrap items-center gap-x-3 gap-y-3 font-mono text-sm tracking-tight text-mist sm:text-base"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.6 }}
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.12, delayChildren: 0.32 } },
                }}
              >
                {FRICTION.map((clause) => (
                  <motion.li
                    key={clause}
                    className="inline-flex items-center gap-2 rounded-xl border border-line-dark bg-white/[0.04] px-3.5 py-2 backdrop-blur-sm"
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.5, ease: easeOutExpo },
                      },
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block h-1.5 w-1.5 rounded-full bg-signal-hi"
                    />
                    {clause}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
