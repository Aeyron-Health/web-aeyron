import { Section } from "../components/Section";
import { Reveal } from "../components/Reveal";

/**
 * The closing North-Star beat. The original Aeyron vision was a passive,
 * mirror-mounted, no-wearable home monitor (the "Respira" mirror / "Pebble"
 * device) that watches quietly for the silent respiratory decline that can
 * precede pneumonia in Parkinson's. Here it is framed not as a spec sheet but
 * as the eventual ambient, zero-effort endpoint of the same mission - the
 * emotional close before the footer.
 */
export function NorthStar() {
  return (
    <Section
      id="north-star"
      tone="clear"
      full
      pad="none"
      aria-label="The North Star: ambient monitoring at home"
    >
      <div className="relative isolate flex min-h-[88svh] items-center overflow-hidden">
        {/* The persistent Signal Thread (App background) carries through here.
            A soft mirror-light pool + a left scrim keep the close legible. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(55% 50% at 74% 36%, oklch(0.42 0.06 250 / 0.4) 0%, transparent 62%), linear-gradient(to right, oklch(0.12 0.016 255 / 0.82) 0%, oklch(0.12 0.016 255 / 0.4) 42%, transparent 70%)",
          }}
        />

        {/* Top + bottom seams so the section reads as one breath, not a hard box */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-night-deep to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-night-deep to-transparent"
        />

        <div className="shell w-full">
          <div className="max-w-2xl py-28 text-mist sm:py-32">
            <Reveal as="div">
              <p className="eyebrow text-signal-hi">The North Star</p>
            </Reveal>

            <Reveal as="h2" delay={0.05} className="mt-6 text-h2 text-mist">
              The first version was never a phone.
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-6 text-lg leading-relaxed text-mist-soft sm:text-xl">
                It was a mirror. A quiet object on the wall of a home, watching
                for the slow, silent change in breathing that can come before
                pneumonia in Parkinson's - the kind of decline no one notices
                until it is late.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <p className="mt-5 text-base leading-relaxed text-mist-soft">
                No wearable to charge. No test to remember. Nothing to do at all.
                Just a room that pays attention, so the people in it don't have
                to. That is the endpoint of the same mission we are building
                toward today: ambient care that asks nothing of the person it
                protects.
              </p>
            </Reveal>

            {/* The line that lands the arc */}
            <Reveal delay={0.26} className="mt-12">
              <p className="font-display text-2xl leading-snug text-mist sm:text-3xl">
                Software in your pocket today.
                <br />
                <span className="text-signal-hi">
                  Ambient monitoring in your home tomorrow.
                </span>
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  );
}
