import { type ReactNode } from "react";
import { Reveal } from "../components/Reveal";
import { Button } from "../components/Button";
import { WaveMark } from "../components/WaveMark";
import { AppStoreButton } from "../components/AppStoreButton";
import { CredibilityWall } from "../components/CredibilityWall";
import {
  brand,
  nav,
  founders,
  backers,
  teamFrom,
  disclaimer,
} from "../content/site";

const logos = [...teamFrom, ...backers];

export function Footer() {
  return (
    <footer className="relative bg-night-deep text-mist">
      {/* top hairline accent */}
      <div
        aria-hidden="true"
        className="h-px w-full bg-gradient-to-r from-transparent via-line-dark to-transparent"
      />

      <div className="shell py-20 sm:py-24">
        {/* Brand + nav grid */}
        <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-10">
          {/* Brand block */}
          <Reveal className="max-w-sm">
            <a
              href="#top"
              className="inline-flex items-center gap-2.5 text-mist"
              aria-label={`${brand.wordmark} home`}
            >
              <WaveMark className="h-7 w-7" />
              <span className="font-display text-xl tracking-tight">
                {brand.wordmark}
              </span>
            </a>
            <p className="mt-5 text-[0.95rem] leading-relaxed text-mist-soft">
              {brand.mission}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <AppStoreButton />
              <Button href="#cta" variant="primary" tone="dark">
                Join the waitlist
              </Button>
            </div>
          </Reveal>

          {/* Explore (nav links) */}
          <Reveal as="div" delay={0.04}>
            <FooterColTitle>Explore</FooterColTitle>
            <ul className="mt-5 space-y-1">
              {nav.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-flex min-h-[44px] items-center text-[0.95rem] text-mist-soft transition-colors duration-200 hover:text-mist"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Company (founders) */}
          <Reveal as="div" delay={0.08}>
            <FooterColTitle>Company</FooterColTitle>
            <ul className="mt-5 space-y-3">
              {founders.map((person) => (
                <li key={person.email}>
                  <a
                    href={`mailto:${person.email}`}
                    className="group inline-flex min-h-[44px] flex-col justify-center"
                  >
                    <span className="text-[0.95rem] text-mist transition-colors duration-200 group-hover:text-signal-hi">
                      {person.name}
                    </span>
                    <span className="font-mono text-xs uppercase tracking-[0.14em] text-mist-soft">
                      {person.role}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Contact */}
          <Reveal as="div" delay={0.12}>
            <FooterColTitle>Contact</FooterColTitle>
            <ul className="mt-5 space-y-4">
              <li>
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-mist-soft">
                  Questions &amp; support
                </p>
                <a
                  href={`mailto:${brand.contactEmail}`}
                  className="mt-1 inline-flex min-h-[44px] items-center text-[0.95rem] text-mist transition-colors duration-200 hover:text-signal-hi"
                >
                  Contact us
                </a>
              </li>
              <li>
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-mist-soft">
                  Partnerships &amp; investors
                </p>
                <a
                  href={`mailto:${brand.investorEmail}`}
                  className="mt-1 inline-flex min-h-[44px] items-center text-[0.95rem] text-mist transition-colors duration-200 hover:text-signal-hi"
                >
                  {brand.investorEmail}
                </a>
              </li>
            </ul>
          </Reveal>
        </div>

        {/* Credibility logo row */}
        <Reveal
          delay={0.04}
          className="mt-16 border-t border-line-dark pt-10"
        >
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-mist-soft">
            Built by a team from, and backed by
          </p>
          <div className="mt-6">
            <CredibilityWall names={logos.map((l) => l.name)} />
          </div>
        </Reveal>

        {/* Legal disclaimer */}
        <Reveal delay={0.04} className="mt-12">
          <p className="max-w-prose text-[0.92rem] font-medium leading-relaxed text-mist">
            {disclaimer.regulatory}
          </p>
          <p className="mt-4 max-w-prose text-[0.8rem] leading-relaxed text-mist-soft">
            {disclaimer.full}
          </p>
        </Reveal>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line-dark">
        <div className="shell flex flex-col gap-4 py-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs tracking-wide text-mist-soft">
            <span className="tnum">&copy; 2026</span> {brand.wordmark}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-mist-soft">
            <a className="min-h-[44px] px-2 inline-flex items-center hover:text-mist" href="/privacy">Privacy</a>
            <a className="min-h-[44px] px-2 inline-flex items-center hover:text-mist" href="/terms">Terms</a>
            <a className="min-h-[44px] px-2 inline-flex items-center hover:text-mist" href="/support">Support</a>
            <a className="min-h-[44px] px-2 inline-flex items-center hover:text-mist" href="/delete">Delete account</a>
            <a className="min-h-[44px] px-2 inline-flex items-center hover:text-mist" href={`mailto:${brand.contactEmail}`}>Contact</a>
            <WaveMark className="h-5 w-5 opacity-80" />
            <span className="font-display text-sm tracking-tight text-mist">
              {brand.wordmark}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-mist-soft">
      {children}
    </h2>
  );
}
