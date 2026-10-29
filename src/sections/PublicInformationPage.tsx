import { type ReactNode, useState } from "react";
import { brand } from "../content/site";
import { DeleteAccountFlow } from "../components/DeleteAccountFlow";
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

const UPDATED = "October 28, 2026";

function Email() {
  return (
    <a className="text-signal-deep underline underline-offset-4" href={`mailto:${brand.contactEmail}`}>
      {brand.contactEmail}
    </a>
  );
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-6">
      {items.map((item, index) => <li key={index}>{item}</li>)}
    </ul>
  );
}

function PrivacyPage() {
  return (
    <Shell
      route="/privacy"
      copy={{
        eyebrow: "Privacy",
        title: "Clear choices about your data.",
        intro: `Aeyron is a wellness companion app for people living with Parkinson's. It is in a small pilot on Apple TestFlight. This page explains what we collect, who handles it, how long we keep it, and how to delete it. Last updated ${UPDATED}.`,
        children: <>
          <Section title="Who is responsible for your data">
            <p>Aeyron Health Inc., 555 Bryant Street, San Francisco, CA 94107, USA, runs Aeyron. We are responsible for your data and for this policy.</p>
            <p>Questions or requests: <Email />.</p>
          </Section>

          <Section title="What the app sends to us">
            <p>Nothing leaves your phone until you sign in and turn on sharing. After that, the app sends:</p>
            <Bullets items={[
              "Your sign-in email address. If you use Sign in with Apple with Hide My Email, we only see Apple's private relay address.",
              "One number per measure per day. These come from Apple Health walking and activity data, your phone's motion history, how much the phone moves while you hold it, and typing timing from the optional Aeyron keyboard.",
              "Only if you turn them on: daily hand-check results, and six daily counts about your medication routine. Medication names and doses are never sent.",
              "Optional \"About you\" answers: your preferred name, whether you have Parkinson's, the year you were told, and the stage you report yourself. Every question is optional.",
              "Your consent choices, the clinicians you link to, and any export or deletion requests, each with the time.",
              "Your phone's time zone, with each daily number.",
              "Crash reports. These contain no account, device, or personal identifiers.",
            ]} />
          </Section>

          <Section title="What stays on your phone">
            <Bullets items={[
              "What you type. The Aeyron keyboard measures timing only. It never stores or sends your words. Password fields use Apple's keyboard, so Aeyron sees nothing there.",
              "Raw Apple Health samples, raw motion data, and raw touch data.",
              "Your daily and monthly check-ins, unless you choose to share a report yourself.",
              "Medication names, strengths, instructions, and times.",
              "Photos from the medication label scanner. They are read on the phone and not saved.",
            ]} />
            <p>Aeyron does not use your microphone, location, or contacts. It has no advertising or analytics tools.</p>
          </Section>

          <Section title="Why we use it">
            <Bullets items={[
              "To show you your own trends.",
              "To share your data with a clinician or family member, only if you choose to.",
              "To send you sign-in emails.",
              "To run the service, keep it secure, and fix problems.",
              "To check that Aeyron's measurements work as intended.",
            ]} />
            <p><strong>We do not sell your data.</strong> We do not use it for advertising, and we do not give it to data brokers.</p>
          </Section>

          <Section title="Companies that handle data for us">
            <p>These companies store or move data for us. They may use it only to provide their service to us.</p>
            <Bullets items={[
              <><strong>Supabase Inc.</strong> (USA): our database and sign-in system. It runs on Amazon Web Services in the us-east-2 region, in Ohio, USA.</>,
              <><strong>Railway Corp.</strong> (USA): runs our app server in the western United States. It does not store our database. It keeps server logs.</>,
              <><strong>Resend</strong> (USA): sends our sign-in emails, so it sees your email address.</>,
              <><strong>Vercel Inc.</strong> (USA): hosts this website. It processes basic request details, such as your IP address, to run and protect the site.</>,
              <><strong>Garmin Ltd. and its subsidiaries</strong> (Switzerland and USA): only if you connect a Garmin account. Garmin sends your Garmin data to us. We do not send your data to Garmin.</>,
              <><strong>Apple Inc.</strong>: delivers the app through TestFlight and provides Apple Health and Sign in with Apple. Apple does not receive the data the app sends to us. Apple's own privacy policy covers what Apple collects.</>,
            ]} />
            <p>Their standard terms of service apply. We have not yet signed separate data processing agreements with them.</p>
          </Section>

          <Section title="Sharing with clinicians and family, only with your consent">
            <p><strong>Clinicians.</strong> A clinician sees your data only after you enter their invitation code in the app and agree. You choose which categories they see: Health summaries, Typing timing, or Phone motion. You also choose the name they see. They never see your check-ins, About-you answers, medication details, or hand checks. Every time a clinician views your data, we log it. You can disconnect at any time, and their access stops right away.</p>
            <p><strong>Family.</strong> A family member gets a weekly email summary only if you add them and turn it on. You can remove them at any time.</p>
            <p>We share your data with no one else, unless the law requires it, for example a valid court order.</p>
          </Section>

          <Section title="Garmin">
            <p>Aeyron is adding the option to connect a Garmin account, for people who wear a Garmin watch. It is off until you turn it on.</p>
            <p><strong>How it works.</strong> You tap "Connect Garmin" in the app. Garmin shows you its own permission screen, where you choose what to share. Only after you agree does Garmin send data to Aeyron. Garmin sends it to our server each time your watch syncs.</p>
            <p><strong>What we receive from Garmin.</strong> Daily summaries of your activity (steps, distance, active minutes), 15-minute activity totals, sleep, heart rate, heart rate variability, stress, breathing rate, blood oxygen, Body Battery, and the walks you record (pace and cadence).</p>
            <p><strong>What we keep.</strong> We turn what Garmin sends into a small set of daily numbers, such as your average walking cadence or how long you slept. We keep those daily numbers. We do not keep Garmin's minute-by-minute data after we have worked out the daily numbers.</p>
            <p><strong>Who sees it.</strong> You, and a clinician you invited, only if you say yes to sharing Garmin data with them. They see the same summary you do. Garmin data is shown with Garmin's name next to it.</p>
            <p><strong>Your Aeyron data does not go to Garmin.</strong> Garmin receives nothing from Aeyron about you.</p>
            <p><strong>We never sell Garmin data.</strong> We do not license it, rent it, or give it to anyone else. We do not use it for advertising. We do not use it for research unless Garmin agrees in writing and you separately agree. Garmin data is never used to train any AI model, ours or anyone else's.</p>
            <p><strong>Stopping.</strong> You can disconnect Garmin at any time in the app or in Garmin Connect. When you disconnect, we stop receiving Garmin data and delete the Garmin data we hold about you within 30 days. If you delete your Aeyron account, we delete your Garmin data with it.</p>
            <p><strong>Garmin's own policy.</strong> Garmin collects your data under its own privacy policy, which you agreed to when you set up your watch. See <a className="text-signal-deep underline underline-offset-4" href="https://www.garmin.com/privacy">garmin.com/privacy</a>.</p>
          </Section>

          <Section title="Artificial intelligence">
            <p>Aeyron does not use artificial intelligence to read, summarise, or make decisions about your health data. The sentences in your weekly report are written by fixed rules in the app, from your own numbers.</p>
            <p>If we add a feature that uses AI, we will update this policy and tell you before it starts.</p>
          </Section>

          <Section title="Research">
            <p>Using Aeyron is not the same as taking part in a research study. Your data is used in a study only if you join that study and sign its own consent form. That form will name the research team, what they receive, and where it is kept.</p>
            <p>When we work with a study, the research team receives daily numbers labelled with a study code, not your name or email.</p>
          </Section>

          <Section title="Where your data is stored">
            <p>Your data is stored and processed in the United States. This is true for everyone, including people who live in Canada.</p>
            <Bullets items={[
              "Supabase stores it on Amazon Web Services, in the us-east-2 region (Ohio).",
              "Railway runs our app server, which handles your data as it arrives and when you view it.",
            ]} />
            <p>While your data is in the United States, US law applies to it. US courts, police, or national security agencies may be able to get access to it under US law.</p>
          </Section>

          <Section title="How long we keep it">
            <Bullets items={[
              "Daily numbers: up to 365 days, or until you delete your account, whichever comes first.",
              "About-you answers, sign-in details, and consent records: until you delete your account.",
              "Clinician links: until you disconnect or delete your account.",
              "Clinician access logs: 12 months.",
              "Crash reports: 90 days.",
              "Server logs: kept by Railway under its standard settings.",
              "Backups: copies expire on their own. After a deletion, we check within 30 days that the backups have expired.",
              "A short record that an export or deletion request was made and completed. It holds no health data.",
            ]} />
            <p>We are still setting up automatic clean-up for these limits. None of the data we hold is older than these limits yet.</p>
          </Section>

          <Section title="Your choices">
            <Bullets items={[
              "Turn sharing off at any time. This stops new uploads. It does not delete what was already sent.",
              "Change Apple Health, motion, and keyboard permissions in iPhone Settings.",
              <>Get a copy of your data: in the app, open <strong>Your account</strong> and tap <strong>Request data export</strong>. Requests are due within 30 days.</>,
              <>Fix something that is wrong: email <Email />.</>,
              <>Delete your account and cloud data: in the app, or on the <a className="text-signal-deep underline underline-offset-4" href="/delete">Delete account</a> page. Requests are due within 30 days. Signing out alone does not delete anything.</>,
            ]} />
            <p>If you live in Canada and you are not happy with how we handle a concern, you can complain to the Office of the Privacy Commissioner of Canada.</p>
          </Section>

          <Section title="How we protect your data">
            <p>Data is encrypted when it travels over the internet. Our database host encrypts it when stored. Each person can read only their own data. Only one founder has administrator access. No system is perfectly secure, so we cannot promise that a breach will never happen.</p>
          </Section>

          <Section title="If there is a data breach">
            <p>If a breach puts your data at risk, we will tell you by email as soon as we can. We will also report it to regulators where the law requires, such as the Privacy Commissioner of Canada or the US Federal Trade Commission.</p>
            <p><strong>Railway incident, October 2026.</strong> On October 21, 2026, Railway, which runs our app server, reported a security incident on its platform. Railway does not store our database. It does hold the settings our server uses to reach the database. Railway has not told us that our account was affected. We are monitoring the incident. We will update this page, and contact you if we learn that your data was involved.</p>
          </Section>

          <Section title="This website">
            <p>This website does not ask for health information. If you use the Delete account page, we use your email address to send you a one-time sign-in link, through Supabase and Resend. Vercel, which hosts this website, may process basic request details, such as your IP address, to run and protect the site.</p>
            <p>If you join our early-access list, we keep what you enter (your first name, email, who you are, what worries you most, and any note) and the link you came from, in our Supabase database. We use it only to contact you about Aeyron. Email <Email /> to be removed at any time.</p>
            <p>This page is not the consent form for a research study.</p>
          </Section>

          <Section title="Changes to this policy">
            <p>If we change this policy in a way that matters, we will update the date at the top and tell you in the app or by email before the change applies.</p>
          </Section>

          <Section title="Contact">
            <p>Email <Email />. Do not send passwords, sign-in codes, or health information by email.</p>
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
        intro: `These terms apply when you use the Aeyron app or this website. By using Aeyron, you agree to them. Last updated ${UPDATED}.`,
        children: <>
          <Section title="Who you are agreeing with">
            <p>These terms are between you and Aeyron Health Inc., 555 Bryant Street, San Francisco, CA 94107, USA.</p>
          </Section>
          <Section title="What Aeyron is">
            <p>Aeyron is a wellness companion for people living with Parkinson's. It organizes your walking, phone motion, typing timing, and check-ins into trends compared with your own past. It is early pilot software, offered through Apple TestFlight.</p>
          </Section>
          <Section title="Not medical advice">
            <p>Aeyron is not a medical device, emergency service, diagnostic tool, or replacement for professional medical advice. Do not start, stop, or change medication based on Aeyron. For urgent symptoms, contact local emergency services or a qualified clinician.</p>
          </Section>
          <Section title="Your account and choices">
            <p>Keep your sign-in method secure. Tell us if you think someone else has used your account. You decide whether to grant device permissions and whether to turn on sharing. Some features may not work when permissions, connectivity, or setup are missing.</p>
          </Section>
          <Section title="Sharing with others">
            <p>You choose which clinicians and family members can see your data, and you can stop sharing at any time. Only share invitation codes with people you trust.</p>
          </Section>
          <Section title="Your data">
            <p>Your data is yours. We use it only as described in our <a className="text-signal-deep underline underline-offset-4" href="/privacy">Privacy Policy</a>. Using Aeyron is not taking part in a research study. A study always has its own consent form.</p>
          </Section>
          <Section title="Fair use">
            <p>Do not try to see other people's data, get around our security, copy or resell the service, or overload it. We may suspend an account that does these things.</p>
          </Section>
          <Section title="Pilot software">
            <p>Aeyron is still being built. It may have errors, gaps, or downtime, and numbers may be missing or wrong. Features and supported devices may change. To the extent the law allows, we provide Aeyron as it is, without promises that it will always work or be accurate.</p>
          </Section>
          <Section title="Limits on responsibility">
            <p>To the extent the law allows, we are not responsible for losses that come from relying on Aeyron instead of a clinician, or from the app being unavailable. Nothing in these terms takes away rights you have under consumer protection law that cannot be waived.</p>
          </Section>
          <Section title="Ending">
            <p>You can stop using Aeyron at any time, and you can delete your account in the app or on the <a className="text-signal-deep underline underline-offset-4" href="/delete">Delete account</a> page. We may pause or end the pilot. If we do, we will tell you first and explain what happens to your data.</p>
          </Section>
          <Section title="Changes to these terms">
            <p>If we change these terms in a way that matters, we will update the date at the top and tell you in the app or by email before the change applies.</p>
          </Section>
          <Section title="Contact">
            <p>Questions about these terms can be sent to <Email />.</p>
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
        intro: "You can delete your Aeyron account and the data linked to it at any time, from the app or from this page. Deletion is permanent.",
        children: <>
          <Section title="Delete in the app (fastest)">
            <ol className="list-decimal space-y-1 pl-6">
              <li>Open Aeyron and tap the menu.</li>
              <li>Tap <strong>Your account</strong>, then <strong>Delete account</strong>.</li>
              <li>Tap <strong>Request account and cloud data deletion</strong>, then confirm with <strong>Request deletion</strong>.</li>
            </ol>
            <p>You can see the status of your request on the same screen.</p>
          </Section>
          <Section title="Delete on the web">
            <p>Enter the email address of your Aeyron account below. If you used Sign in with Apple with Hide My Email, enter that private relay address. Open the one-time sign-in link we email you on this device, then confirm the deletion request. We never ask for your password on this page, and we do not show whether an account exists for an email address.</p>
            <DeleteAccountFlow />
            <p>If the page says your account cannot be deleted online, or you cannot get into your email, write to <a className="text-signal-deep underline underline-offset-4" href={`mailto:${brand.contactEmail}?subject=Delete%20my%20account`}>{brand.contactEmail}</a> from your account's email address with the subject "Delete my account". We will check that the request comes from the account holder.</p>
          </Section>
          <Section title="How long it takes">
            <p>Deletion is not instant, because each step is checked. A request is due within 30 days. This website does not email you when deletion is complete: submitting a request is not confirmation that it has finished, and you can follow its status in the app under Your account.</p>
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
