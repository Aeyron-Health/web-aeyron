import { useState } from "react";
import { brand } from "../content/site";
import {
  callPoints,
  clinicianPoints,
  exampleReport,
  faqs,
  links,
  needs,
  pilots,
  privacyPoints,
  proof,
  steps,
  team,
  testflightSteps,
} from "../content/home";
import { publicRoutes } from "../publicRoutes";
import { WaitlistForm } from "../components/WaitlistForm";

function Logo({ className = "" }: { className?: string }) {
  return (
    <a href="/" className={`inline-flex min-h-11 items-center gap-2.5 ${className}`} aria-label="Aeyron home">
      <img src="/brand/aeyron-mark-96.png" alt="" width={32} height={32} className="h-8 w-8" />
      <span className="font-display text-xl font-semibold tracking-tight">{brand.wordmark}</span>
    </a>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const nav = [
    { label: "For families", href: "#families" },
    { label: "For clinicians", href: "#clinicians" },
    { label: "How it works", href: "#how" },
    { label: "Questions", href: "#faq" },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-canvas/90 backdrop-blur-md">
      <div className="shell flex min-h-16 items-center justify-between gap-4">
        <Logo className="text-ink" />
        <nav className="hidden items-center gap-7 text-[0.95rem] text-ink-soft md:flex" aria-label="Main">
          {nav.map(item => (
            <a key={item.href} href={item.href} className="hover:text-ink">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="#try" className="btn btn-primary !min-h-11 whitespace-nowrap !px-5 !text-[0.95rem]">
            Try it free
          </a>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-strong md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Menu"
            onClick={() => setOpen(o => !o)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path d={open ? "M4 4l10 10M14 4L4 14" : "M2 5h14M2 9h14M2 13h14"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" className="shell grid gap-1 pb-4 md:hidden" aria-label="Main">
          {nav.map(item => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-lg text-ink hover:bg-canvas-sunk">
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

/** Synthetic weekly family update, styled like the app. */
function FamilyUpdateCard() {
  const rows = [
    { label: "Walking", detail: "A little slower than his usual for 2 weeks", tone: "worse" },
    { label: "Nights", detail: "Up more than usual on 3 of 7 nights", tone: "worse" },
    { label: "Medications", detail: "19 of 21 doses tapped on time", tone: "same" },
    { label: "Weekly call", detail: "Mentioned freezing at the kitchen doorway", tone: "note" },
  ] as const;
  const dot = { worse: "bg-attention", same: "bg-vital", note: "bg-signal" } as const;
  return (
    <div className="relative mx-auto w-full max-w-[380px]">
      <div className="absolute -inset-6 -z-10 rounded-[48px] bg-[radial-gradient(60%_60%_at_50%_40%,oklch(0.8_0.09_255/0.45),transparent)]" />
      <div className="rounded-[36px] border border-line bg-paper p-3 shadow-[0_40px_80px_-40px_oklch(0.3_0.08_255/0.55)]">
        <div className="rounded-[28px] bg-canvas px-5 pb-6 pt-5">
          <div className="flex items-center justify-between">
            <span className="eyebrow text-signal-deep">Weekly update</span>
            <span className="rounded-full bg-paper px-2.5 py-1 text-xs text-ink-soft ring-1 ring-line">Example</span>
          </div>
          <p className="mt-3 font-display text-2xl font-semibold leading-tight text-ink">Dad's week, in plain words</p>
          <ul className="mt-5 space-y-3">
            {rows.map(row => (
              <li key={row.label} className="flex gap-3 rounded-2xl bg-paper p-3.5 ring-1 ring-line">
                <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${dot[row.tone]}`} aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-ink">{row.label}</p>
                  <p className="text-[0.95rem] leading-snug text-ink-soft">{row.detail}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-2xl bg-navy p-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Next step</p>
            <p className="mt-1 text-[0.95rem] leading-snug">Worth raising walking and nights at the next neurology visit. The report is ready to share.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[620px] bg-[linear-gradient(180deg,oklch(0.95_0.03_255),transparent)]" />
      <div className="shell grid items-center gap-12 pb-16 pt-10 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pb-24 lg:pt-20">
        <div>
          <p className="eyebrow text-signal-deep">For families and neurologists</p>
          <h1 className="mt-4 text-[2.6rem] leading-[1.02] tracking-[-0.03em] text-ink sm:text-6xl lg:text-[4.4rem]">
            See the days between doctor visits.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">
            Parkinson's changes hour to hour, but doctors see it a few times a year. Aeyron turns the iPhone and Apple Watch
            your family already owns into a clear picture of walking, nights, medications and how the week really went,
            shared with family and the neurologist.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#try" className="btn btn-primary">
              Try it free on iPhone
            </a>
            <a href="#join" className="btn btn-ghost">
              Join the waitlist
            </a>
          </div>
          <p className="mt-4 text-[0.95rem] text-ink-soft">
            Everything is free right now. Nothing to buy, nothing to log. On Android? Join the waitlist.{" "}
            <a href={links.bookCall} className="font-medium text-signal-deep underline underline-offset-4">
              Or book a 15-minute call
            </a>
          </p>
        </div>
        <FamilyUpdateCard />
      </div>
    </section>
  );
}

function Proof() {
  return (
    <section aria-label="Traction" className="border-y border-line bg-paper">
      <dl className="shell grid gap-6 py-8 sm:grid-cols-3 sm:gap-10">
        {proof.map(item => (
          <div key={item.value} className="flex items-baseline gap-4 sm:block">
            <dt className="font-display text-4xl font-semibold tracking-tight text-navy sm:text-5xl">{item.value}</dt>
            <dd className="text-[0.98rem] leading-snug text-ink-soft sm:mt-2">{item.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Paths() {
  const paths = [
    {
      who: "I'm caring for someone",
      line: "Know how the week really went, and walk into appointments prepared.",
      href: "#families",
    },
    {
      who: "I'm a clinician",
      line: "The few things that changed between visits, organised like the MDS-UPDRS.",
      href: "#clinicians",
    },
  ];
  return (
    <section className="shell grid gap-4 py-12 sm:grid-cols-2 sm:py-16">
      {paths.map(path => (
        <a
          key={path.href}
          href={path.href}
          className="group flex items-center justify-between gap-6 rounded-[var(--radius-card)] border border-line bg-paper p-6 transition-colors hover:border-signal sm:p-8"
        >
          <div>
            <p className="font-display text-2xl font-semibold text-ink">{path.who}</p>
            <p className="mt-2 text-ink-soft">{path.line}</p>
          </div>
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-signal-tint text-signal-deep transition-transform group-hover:translate-x-1"
          >
            →
          </span>
        </a>
      ))}
    </section>
  );
}

function TryIt() {
  return (
    <section id="try" className="scroll-mt-16 bg-navy py-16 text-white sm:py-20">
      <div className="shell grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <p className="eyebrow text-signal-hi">Try it today</p>
          <h2 className="mt-3 text-[2.1rem] leading-[1.06] tracking-[-0.025em] sm:text-5xl">Free on iPhone, in about five minutes.</h2>
          <p className="mt-5 text-lg text-white/80">
            The App Store release is in review. Until then, families install Aeyron through TestFlight, Apple's own app for
            trying new apps early.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={links.testflight} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
              Open the iPhone invite
            </a>
            <a href="#join" className="btn btn-on-dark">
              On Android? Join the waitlist
            </a>
          </div>
        </div>
        <ol className="grid gap-3">
          {testflightSteps.map((step, index) => (
            <li key={step.title} className="flex gap-4 rounded-2xl border border-white/12 bg-white/[0.04] p-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-signal font-semibold">{index + 1}</span>
              <div>
                <h3 className="text-lg">{step.title}</h3>
                <p className="mt-1 leading-relaxed text-white/75">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const needIcons: Record<string, string> = {
  falls: "M12 3a2 2 0 110 4 2 2 0 010-4zm-1 6h2l2 5h3M11 9l-3 6m5-1l-2 7m-3-6l-3 6",
  nights: "M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z",
  medications: "M8.5 15.5l7-7a3.5 3.5 0 015 5l-7 7a3.5 3.5 0 01-5-5zm3.5-3.5l5 5",
  visits: "M7 4h10v16H7zM10 8h4M10 12h4M10 16h2",
  caregiver_load: "M12 20s-7-4.3-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.7-7 10-7 10z",
};

function Families() {
  return (
    <section id="families" className="scroll-mt-20 bg-canvas-sunk py-16 sm:py-24">
      <div className="shell">
        <p className="eyebrow text-signal-deep">For families</p>
        <h2 className="mt-3 max-w-3xl text-[2.1rem] leading-[1.06] tracking-[-0.025em] text-ink sm:text-5xl">
          Built around what caregivers worry about most.
        </h2>
        <p className="mt-5 max-w-2xl text-lg text-ink-soft">
          Caregivers keep telling us the same things: falls, hard nights, medications, and the strain of carrying it all
          alone. Aeyron is built around those.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {needs.map(need => (
            <article key={need.id} className="rounded-[var(--radius-card)] border border-line bg-paper p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-signal-tint text-signal-deep">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d={needIcons[need.id]} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h3 className="mt-4 text-xl text-ink">{need.title}</h3>
              <p className="mt-2 leading-relaxed text-ink-soft">{need.body}</p>
            </article>
          ))}
          <article className="flex flex-col justify-between rounded-[var(--radius-card)] bg-navy p-6 text-white">
            <div>
              <h3 className="text-xl">Start this week</h3>
              <p className="mt-2 leading-relaxed text-white/80">
                Install on their iPhone in a few minutes. It learns their usual over the first few weeks.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <a href="#try" className="btn btn-primary">
                Try it free on iPhone
              </a>
              <a href="#join?role=caregiver" className="btn btn-on-dark">
                Join the waitlist
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 py-16 sm:py-24">
      <div className="shell">
        <p className="eyebrow text-signal-deep">How it works</p>
        <h2 className="mt-3 max-w-3xl text-[2.1rem] leading-[1.06] tracking-[-0.025em] text-ink sm:text-5xl">
          Nothing to buy. Nothing to remember.
        </h2>
        <p className="mt-5 max-w-2xl text-lg text-ink-soft">
          Aeyron works with an iPhone alone. Add an Apple Watch and it covers the hours the phone sits on a table, joined
          into one personal record.
        </p>
        <ol className="mt-10 grid gap-4 lg:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-[var(--radius-card)] border border-line bg-paper p-6 sm:p-7">
              <span className="font-mono text-sm font-medium text-signal-deep">0{index + 1}</span>
              <h3 className="mt-3 text-xl text-ink">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 grid gap-8 rounded-[var(--radius-card)] border border-line bg-paper p-6 sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <div>
            <p className="eyebrow text-signal-deep">The weekly call</p>
            <h3 className="mt-3 text-3xl leading-tight text-ink">A five-minute phone call fills in what sensors can't see.</h3>
          </div>
          <ul className="space-y-4">
            {callPoints.map(point => (
              <li key={point} className="flex gap-3 leading-relaxed text-ink-soft">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ReportCard() {
  const tone: Record<string, string> = {
    Same: "bg-vital-tint text-[oklch(0.42_0.11_150)]",
    Worse: "bg-[oklch(0.95_0.05_70)] text-[oklch(0.45_0.12_60)]",
    "Not enough data": "bg-white/10 text-white/75 ring-1 ring-white/20",
  };
  return (
    <figure className="rounded-[var(--radius-card)] border border-white/12 bg-white/[0.04] p-5 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow text-signal-hi">Clinician report</p>
        <span className="rounded-full px-2.5 py-1 text-xs text-white/70 ring-1 ring-white/20">Example</span>
      </div>
      <p className="mt-3 text-[0.95rem] text-white/75">{exampleReport.header}</p>
      <ul className="mt-5 divide-y divide-white/10 border-y border-white/10">
        {exampleReport.rows.map(row => (
          <li key={row.area} className="flex items-center justify-between gap-4 py-4">
            <span className="text-[0.98rem] leading-snug text-white">{row.area}</span>
            <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${tone[row.status]}`}>{row.status}</span>
          </li>
        ))}
      </ul>
      <figcaption className="mt-4 text-sm text-white/60">First page of the structured report, simplified.</figcaption>
    </figure>
  );
}

function Clinicians() {
  return (
    <section id="clinicians" className="scroll-mt-16 bg-navy py-16 text-white sm:py-24">
      <div className="shell grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <p className="eyebrow text-signal-hi">For neurologists and clinics</p>
          <h2 className="mt-3 text-[2.1rem] leading-[1.06] tracking-[-0.025em] sm:text-5xl">
            The few things that changed, in the framework you already use.
          </h2>
          <p className="mt-5 max-w-xl text-lg text-white/80">
            Neurologists told us they don't want more data. Aeyron sends a short report of what changed between visits and
            how far to trust each finding.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {clinicianPoints.map(point => (
              <div key={point.title}>
                <h3 className="text-lg">{point.title}</h3>
                <p className="mt-1.5 leading-relaxed text-white/75">{point.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 border-l-2 border-signal-hi pl-4 leading-relaxed text-white/80">{pilots}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={links.bookCall} className="btn btn-primary">
              Book a 15-minute call
            </a>
            <a href="#join?role=clinician" className="btn btn-on-dark">
              Join as a clinician
            </a>
          </div>
        </div>
        <div className="lg:pt-10">
          <ReportCard />
        </div>
      </div>
    </section>
  );
}

function Privacy() {
  return (
    <section className="py-16 sm:py-24">
      <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <p className="eyebrow text-signal-deep">Privacy</p>
          <h2 className="mt-3 text-[2.1rem] leading-[1.06] tracking-[-0.025em] text-ink sm:text-5xl">
            Their data, their choice.
          </h2>
          <p className="mt-5 text-lg text-ink-soft">
            Changes are described against the person's own range, calmly. A low reading leads to a gentle prompt or an
            earlier check-in, never an alarm.
          </p>
        </div>
        <ul className="grid gap-3">
          {privacyPoints.map(point => (
            <li key={point} className="flex gap-4 rounded-2xl border border-line bg-paper p-5">
              <svg className="mt-0.5 shrink-0 text-signal" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="leading-relaxed text-ink">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Join() {
  return (
    <section id="join" className="scroll-mt-16 bg-[linear-gradient(180deg,oklch(0.95_0.03_255),var(--color-canvas))] py-16 sm:py-24">
      <div className="shell grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <p className="eyebrow text-signal-deep">Waitlist</p>
          <h2 className="mt-3 text-[2.1rem] leading-[1.06] tracking-[-0.025em] text-ink sm:text-5xl">
            Not on iPhone, or not ready yet? Join the waitlist.
          </h2>
          <p className="mt-5 text-lg text-ink-soft">
            Tell us a little about you. We'll tell you when Android is ready and help you get set up. Prefer to talk first?
            A founder will take the call.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <a href={links.bookCall} className="btn btn-dark">
              Book a 15-minute call
            </a>
            <a href={links.testflight} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
              Try it free on iPhone
            </a>
          </div>
        </div>
        <WaitlistForm />
      </div>
    </section>
  );
}

function Team() {
  return (
    <section className="py-16 sm:py-20">
      <div className="shell">
        <p className="eyebrow text-signal-deep">The team</p>
        <h2 className="mt-3 text-3xl tracking-[-0.02em] text-ink sm:text-4xl">Built with patients, care partners and clinicians.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {team.map(person => (
            <div key={person.name} className="rounded-[var(--radius-card)] border border-line bg-paper p-6">
              <p className="font-display text-xl font-semibold text-ink">{person.name}</p>
              <p className="text-[0.95rem] font-medium text-signal-deep">{person.role}</p>
              <p className="mt-3 leading-relaxed text-ink-soft">{person.bio}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-ink-soft">
          Clinical, research, community or investment partner?{" "}
          <a href={links.email} className="font-medium text-signal-deep underline underline-offset-4">
            {brand.contactEmail}
          </a>
        </p>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="scroll-mt-16 border-t border-line py-16 sm:py-24">
      <div className="shell grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
        <h2 className="text-[2.1rem] leading-[1.06] tracking-[-0.025em] text-ink sm:text-5xl">Questions</h2>
        <div className="divide-y divide-line border-y border-line">
          {faqs.map(item => (
            <details key={item.q} className="group py-2">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {item.q}
                <span aria-hidden="true" className="text-2xl font-normal text-signal transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-4 pr-8 leading-relaxed text-ink-soft">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-navy py-12 text-white/80">
      <div className="shell grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <Logo className="text-white" />
          <p className="mt-3 max-w-md">Everyday Parkinson's monitoring from the iPhone and Apple Watch people already own.</p>
          <a href={links.email} className="mt-3 inline-block text-white underline underline-offset-4">
            {brand.contactEmail}
          </a>
        </div>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2">
          {publicRoutes.map(route => (
            <a key={route.path} href={route.path} className="min-h-11 py-2 hover:text-white">
              {route.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="shell mt-8 border-t border-white/12 pt-6 text-sm text-white/60">
        © 2026 Aeyron Health Inc. Aeyron is a general-wellness product and does not diagnose or treat any condition. In an
        emergency, call 911.
      </div>
    </footer>
  );
}

export function Home() {
  return (
    <>
      <a
        href="#join"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-canvas"
      >
        Skip to sign-up
      </a>
      <Header />
      <main>
        <Hero />
        <Proof />
        <Paths />
        <Families />
        <TryIt />
        <HowItWorks />
        <Clinicians />
        <Privacy />
        <Join />
        <Team />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
