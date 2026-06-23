import { useId, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Section } from "../components/Section";
import { Reveal } from "../components/Reveal";
import { Button } from "../components/Button";
import { brand } from "../content/site";
import { easeOutExpo } from "../lib/motion";

type AudienceKey = "patients" | "clinicians" | "partners";

const AUDIENCES: { key: AudienceKey; label: string; subject: string }[] = [
  {
    key: "patients",
    label: "Patient or caregiver",
    subject: "Early access - patient / caregiver",
  },
  {
    key: "clinicians",
    label: "Clinician",
    subject: "Early access - clinician / movement-disorder clinic",
  },
  {
    key: "partners",
    label: "Facilities & investors",
    subject: "Partnership / investment enquiry",
  },
];

function bodyFor(key: AudienceKey, email: string): string {
  const lines: Record<AudienceKey, string> = {
    patients:
      "Hi Aeyron team,\n\nI'm a patient or caregiver and I'd like early access to the Aeyron wellness companion.",
    clinicians:
      "Hi Aeyron team,\n\nI'm a clinician interested in Aeyron's longitudinal monitoring and a possible pilot.",
    partners:
      "Hi Aeyron team,\n\nI'd like to talk about a pilot, a research cohort, or investment.",
  };
  return `${lines[key]}\n\nReply-to: ${email}\n\nSent from aeyron.health`;
}

export function CTA() {
  const reduced = useReducedMotion();
  const groupId = useId();
  const emailId = `${groupId}-email`;
  const errId = `${groupId}-err`;

  const [audience, setAudience] = useState<AudienceKey>("patients");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = email.trim();
    if (value.length === 0 || !value.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);

    const meta = AUDIENCES.find((a) => a.key === audience) ?? AUDIENCES[0];
    const subject = encodeURIComponent(`Aeyron - ${meta.subject}`);
    const mailBody = encodeURIComponent(bodyFor(audience, value));
    setSent(true);
    window.location.href = `mailto:${brand.investorEmail}?subject=${subject}&body=${mailBody}`;
  }

  return (
    <Section id="cta" tone="clear" className="overflow-hidden">
      {/* legibility scrim over the persistent Signal Thread backbone */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, oklch(0.12 0.016 255 / 0.82) 0%, oklch(0.12 0.016 255 / 0.4) 48%, oklch(0.12 0.016 255 / 0.25) 100%)",
        }}
      />

      <div className="relative grid gap-14 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-20">
        {/* Left: pitch */}
        <div className="max-w-xl">
          <Reveal as="p" className="eyebrow text-signal-hi">
            Early access
          </Reveal>
          <Reveal as="h2" className="mt-4 font-display text-h2 text-mist">
            Start watching between visits.
          </Reveal>
          <Reveal as="p" className="mt-5 text-lg text-mist-soft" delay={0.05}>
            Aeyron is opening early access to its wellness companion, and lining
            up pilots with clinics, care facilities, and research partners. Tell
            us who you are and we'll be in touch.
          </Reveal>

          <Reveal className="mt-8" delay={0.1}>
            <p className="text-sm text-mist-soft">
              For partnerships and investment, reach the founders directly at{" "}
              <a
                href={`mailto:${brand.investorEmail}`}
                className="font-mono text-mist underline decoration-line-dark underline-offset-4 transition-colors hover:text-signal-hi focus-visible:text-signal-hi"
              >
                {brand.investorEmail}
              </a>
              .
            </p>
            <p className="mt-4 text-xs leading-relaxed text-mist-soft/80">
              Aeyron is a wellness and personal-tracking companion, not a
              medical device. It does not diagnose, treat, or prevent any
              condition.
            </p>
          </Reveal>
        </div>

        {/* Right: capture card */}
        <Reveal delay={0.08}>
          <div className="rounded-2xl border border-line-dark bg-night-raise/90 p-6 shadow-[0_30px_70px_-30px_oklch(0.1_0.02_255/0.8)] backdrop-blur-md sm:p-8">
            <AnimatePresence mode="wait" initial={false}>
              {sent ? (
                <motion.div
                  key="success"
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: easeOutExpo }}
                  role="status"
                  aria-live="polite"
                >
                  <div
                    aria-hidden="true"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-vital-tint text-vital"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <h3 className="mt-5 font-display text-2xl text-mist">
                    Thanks - your mail client is opening.
                  </h3>
                  <p className="mt-3 text-mist-soft">
                    If nothing opened, reach us directly at{" "}
                    <a
                      href={`mailto:${brand.investorEmail}`}
                      className="font-mono text-mist underline decoration-line-dark underline-offset-4 transition-colors hover:text-signal-hi"
                    >
                      {brand.investorEmail}
                    </a>
                    .
                  </p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="mt-6 min-h-[44px] text-sm text-signal-hi underline-offset-4 hover:underline focus-visible:underline"
                  >
                    Send another
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduced ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.24, ease: easeOutExpo }}
                  onSubmit={handleSubmit}
                  noValidate
                >
                  <fieldset className="m-0 border-0 p-0">
                    <legend className="eyebrow text-mist-soft">I'm a</legend>
                    <div
                      role="radiogroup"
                      aria-label="Who you are"
                      className="mt-3 flex flex-wrap gap-2"
                    >
                      {AUDIENCES.map((a) => {
                        const active = a.key === audience;
                        return (
                          <button
                            key={a.key}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => setAudience(a.key)}
                            className={`min-h-[44px] rounded-full border px-4 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 ${
                              active
                                ? "border-signal bg-signal text-white"
                                : "border-line-dark bg-white/5 text-mist-soft hover:bg-white/10 hover:text-mist"
                            }`}
                          >
                            {a.label}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div className="mt-6">
                    <label
                      htmlFor={emailId}
                      className="block text-sm font-medium text-mist"
                    >
                      Email address
                    </label>
                    <input
                      id={emailId}
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      inputMode="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? errId : undefined}
                      className={`mt-2 block min-h-[48px] w-full rounded-xl border bg-night-deep/60 px-4 text-mist placeholder:text-mist-soft/50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                        error ? "border-attention" : "border-line-dark"
                      }`}
                    />
                    {error ? (
                      <p
                        id={errId}
                        role="alert"
                        className="mt-2 text-sm text-attention"
                      >
                        {error}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-7">
                    <Button
                      type="submit"
                      variant="primary"
                      tone="dark"
                      className="w-full"
                    >
                      Request early access
                    </Button>
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-mist-soft/80">
                    Submitting opens your email client with a pre-filled message
                    to the Aeyron team. No account, no spam.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
