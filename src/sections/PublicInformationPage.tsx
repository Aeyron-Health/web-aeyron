import { type ReactNode, useState } from "react";
import { brand } from "../content/site";
import { currentPublicRoute, publicRoutes, type PublicRoute } from "../publicRoutes";
import { WaveMark } from "../components/WaveMark";

type PageCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
};

const supportItems = [
  [
    "I cannot sign in",
    "Check that you are using the same sign-in method that you used to create your Aeyron account. If the problem continues, include your app version, iPhone model, iOS version, and the time the problem occurred when you contact support.",
  ],
  [
    "My health data is unavailable",
    "Review Aeyron's Health permissions in iPhone Settings. A missing or denied source should appear as unavailable, not as a zero value.",
  ],
  [
    "The Aeyron Keyboard is not available",
    "Open iPhone Settings, add Aeyron under Keyboards, then choose it with the globe key while typing. Full Access is a separate setting.",
  ],
];

function Shell({ route, copy }: { route: PublicRoute; copy: PageCopy }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-line bg-canvas/95 backdrop-blur">
        <nav className="shell relative flex min-h-16 items-center justify-between gap-3 py-3" aria-label="Aeyron website">
          <a href="/" className="inline-flex min-h-11 items-center gap-2 text-lg font-semibold text-ink">
            <WaveMark className="h-7 w-7" />
            {brand.wordmark}
          </a>
          <div className="hidden items-center gap-x-4 text-sm sm:flex">
            {publicRoutes.map(item => (
              <a
                key={item.path}
                href={item.path}
                aria-current={route === item.path ? "page" : undefined}
                className={route === item.path ? "font-semibold text-ink" : "text-ink-soft hover:text-ink"}
              >
                {item.label}
              </a>
            ))}
          </div>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-line text-ink hover:bg-paper sm:hidden"
            aria-expanded={menuOpen}
            aria-controls="public-navigation-menu"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMenuOpen(open => !open)}
          >
            <span className="sr-only">Menu</span>
            <span aria-hidden="true" className="flex w-5 flex-col gap-1.5">
              <span className="h-0.5 w-full rounded-full bg-current" />
              <span className="h-0.5 w-full rounded-full bg-current" />
              <span className="h-0.5 w-full rounded-full bg-current" />
            </span>
          </button>
          {menuOpen ? (
            <div
              id="public-navigation-menu"
              className="absolute inset-x-0 top-full z-10 border-b border-line bg-canvas p-3 shadow-lg sm:hidden"
            >
              <div className="shell grid gap-1">
                {publicRoutes.map(item => (
                  <a
                    key={item.path}
                    href={item.path}
                    aria-current={route === item.path ? "page" : undefined}
                    className={route === item.path
                      ? "rounded-lg bg-paper px-4 py-3 font-semibold text-ink"
                      : "rounded-lg px-4 py-3 text-ink-soft hover:bg-paper hover:text-ink"}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </nav>
      </header>

      <main className="shell py-14 sm:py-20">
        <article className="mx-auto max-w-3xl">
          <p className="eyebrow text-signal-deep">{copy.eyebrow}</p>
          <h1 className="mt-4 font-display text-h2 text-ink">{copy.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">{copy.intro}</p>
          <div className="mt-12 space-y-10">{copy.children}</div>
        </article>
      </main>

      <footer className="border-t border-line bg-canvas-sunk">
        <div className="shell flex flex-col gap-3 py-8 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 {brand.wordmark}. Not an emergency or medical advice service.</span>
          <a className="underline underline-offset-4 hover:text-ink" href={`mailto:${brand.contactEmail}`}>
            {brand.contactEmail}
          </a>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      <div className="mt-3 space-y-4 leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

function PrivacyPage() {
  return (
    <Shell
      route="/privacy"
      copy={{
        eyebrow: "Privacy",
        title: "Clear choices about your data.",
        intro: "Aeyron is a personal health-monitoring app under active development. This page explains the current product boundaries and is not a substitute for an approved participant consent notice.",
        children: <>
          <Section title="What the website collects">
            <p>This website does not ask for health information. The hosting provider may process limited technical request information needed to operate and protect the site.</p>
          </Section>
          <Section title="What the app may process">
            <p>When a person enables the relevant permissions and sharing choices, Aeyron may process health summaries, device-motion summaries, and keyboard timing summaries. The keyboard is designed to measure timing, not the words a person types.</p>
            <p>Aeyron is not an emergency service and does not provide a diagnosis, treatment recommendation, or continuous clinical monitoring.</p>
          </Section>
          <Section title="Your choices">
            <p>Permissions and sharing choices can be changed in the app and in iPhone Settings. Signing out clears the app's local session. It does not by itself confirm deletion of cloud records already accepted by a service.</p>
          </Section>
          <Section title="Questions and requests">
            <p>For support or privacy questions, contact <a className="text-signal-deep underline underline-offset-4" href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a>. Do not send passwords, sign-in codes, or health information by email.</p>
          </Section>
        </>,
      }}
    />
  );
}

function TermsPage() {
  return (
    <Shell
      route="/terms"
      copy={{
        eyebrow: "Terms of use",
        title: "Use Aeyron carefully and stay in control.",
        intro: "These terms describe the current Aeyron product experience. They require owner and legal review before public production publication.",
        children: <>
          <Section title="Not medical advice">
            <p>Aeyron is not a medical device, emergency service, diagnostic tool, or replacement for professional medical advice. Do not start, stop, or change medication based on Aeyron. For urgent symptoms, contact local emergency services or a qualified clinician.</p>
          </Section>
          <Section title="Your account and choices">
            <p>Keep your sign-in method secure. You control whether to grant device permissions and whether to enable any available sharing. Some features may be unavailable when permissions, connectivity, or configuration are unavailable.</p>
          </Section>
          <Section title="Product changes">
            <p>Aeyron is actively being developed. Features, availability, and supported devices may change. We may update these terms when the product changes, and will show an updated effective date when legally approved terms are published.</p>
          </Section>
          <Section title="Contact">
            <p>Questions about these terms can be sent to <a className="text-signal-deep underline underline-offset-4" href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a>.</p>
          </Section>
        </>,
      }}
    />
  );
}

function SupportPage() {
  return (
    <Shell
      route="/support"
      copy={{
        eyebrow: "Support",
        title: "Help with the current Aeyron build.",
        intro: "Please include enough technical detail for us to reproduce a problem, but never send passwords, sign-in codes, or health information in an email.",
        children: <>
          {supportItems.map(([title, body]) => (
            <Section key={title} title={title}><p>{body}</p></Section>
          ))}
          <Section title="Report a problem">
            <p>Email <a className="text-signal-deep underline underline-offset-4" href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a> with the app version and build, iPhone model, iOS version, time, steps taken, expected result, actual result, and a screenshot only when it contains no private information.</p>
          </Section>
        </>,
      }}
    />
  );
}

function DeletePage() {
  return (
    <Shell
      route="/delete"
      copy={{
        eyebrow: "Delete account",
        title: "Delete your Aeyron account and cloud data.",
        intro: "Account deletion is permanent. We must verify that the request comes from the account holder before any deletion can begin.",
        children: <>
          <Section title="Start from the app">
            <p>Open the Aeyron app, sign in to the account you want to delete, and use the account-deletion option in Account settings. This website is the direct explanation and completion route, but it must never accept a password or privileged deletion credential.</p>
          </Section>
          <Section title="What happens next">
            <p>A properly configured deletion service verifies the account, records a deletion request, removes the account and associated data that Aeyron is not legally required to retain, and tells you when processing is complete. A submitted request is not confirmation that deletion has completed.</p>
          </Section>
          <Section title="Current availability">
            <div className="rounded-card border border-attention/40 bg-paper p-5 text-ink">
              <p className="font-semibold">Authenticated web deletion is not configured in this static website yet.</p>
              <p className="mt-2 text-ink-soft">Do not send account details by email. Until the authenticated backend is enabled and independently verified, use the deletion option in the app or contact Aeyron support to confirm the available process.</p>
            </div>
          </Section>
          <Section title="Need help">
            <p>Contact <a className="text-signal-deep underline underline-offset-4" href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a>. Do not include a password, sign-in code, or health information.</p>
          </Section>
        </>,
      }}
    />
  );
}

export function PublicInformationPage() {
  const route = currentPublicRoute(window.location.pathname);
  if (route === "/privacy") return <PrivacyPage />;
  if (route === "/terms") return <TermsPage />;
  if (route === "/support") return <SupportPage />;
  return <DeletePage />;
}
