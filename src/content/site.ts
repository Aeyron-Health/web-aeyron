/**
 * Single source of truth for brand constants, navigation, and section content.
 * Keeps copy consistent and honest across all sections.
 */

export const brand = {
  name: "Aeyron",
  wordmark: "Aeyron",
  // Mission, plain: a wellness companion, never a diagnostic or monitoring claim.
  mission:
    "A Parkinson's wellness companion that organizes your everyday information on the phone you already own.",
  // Brand tagline (revealed word-by-word on scroll). Easy to swap.
  tagline: "Your everyday, organized and yours.",
  taglineSub: "The days between visits, in one place.",
  investorEmail: "aeyron7hq@gmail.com",
  contactEmail: "aeyron7hq@gmail.com",
};

export const nav = {
  links: [
    { label: "The gap", href: "#gap" },
    { label: "How it works", href: "#how-it-works" },
    { label: "What you get", href: "#what-you-get" },
    { label: "Research", href: "#science" },
    { label: "Who it's for", href: "#audiences" },
  ],
  cta: { label: "Get early access", href: "#cta" },
};

export type Measurement = {
  id: string;
  name: string;
  /** what it captures, lay-level */
  what: string;
  /** how it's captured, passively */
  how: string;
  /** the honest signal line */
  signal: string;
  /** which viz component drives it */
  viz: "tremor" | "gait" | "tap" | "typing" | "voice" | "nonmotor" | "deeptests";
  researchKey?: string;
};

export const measurements: Measurement[] = [
  {
    id: "motion",
    name: "Phone motion",
    what: "How much the phone moves while you hold it.",
    how: "Read from the phone's own motion sensors while you simply hold it. No test to take.",
    signal: "A day-to-day motion trend, compared with your own past.",
    viz: "tremor",
    researchKey: "motion",
  },
  {
    id: "gait",
    name: "Walking pattern",
    what: "Walking information your iPhone already keeps in Apple Health.",
    how: "With your permission, Aeyron reads walking data from Apple Health as you go about your day.",
    signal: "Your walking pattern over time, compared with your own past.",
    viz: "gait",
    researchKey: "gait",
  },
  {
    id: "typing",
    name: "Typing timing",
    what: "Key hold-times and pace while typing - never the words.",
    how: "An optional Aeyron keyboard records the timing of your typing in the apps you already use.",
    signal: "A typing-timing trend, compared with your own past.",
    viz: "typing",
    researchKey: "typing",
  },
  {
    id: "checkins",
    name: "Your check-ins",
    what: "Short check-ins you log yourself, including the medication check-ins you log.",
    how: "A few taps in the app, whenever it suits you.",
    signal: "Your own notes, kept alongside your trends so you can review them together.",
    viz: "nonmotor",
  },
];

export type Audience = {
  id: string;
  who: string;
  headline: string;
  body: string;
  points: string[];
};

export const audiences: Audience[] = [
  {
    id: "patients",
    who: "People living with Parkinson's & caregivers",
    headline: "The days between visits, in one place.",
    body: "Aeyron quietly organizes your everyday information so you don't have to, and turns months of real life into simple trends you can look back on.",
    points: [
      "No clinic visit, no wearable to buy, no daily homework",
      "Simple trends compared with your own past, that you own",
      "A plain-English summary to review with your clinician",
    ],
  },
  {
    id: "clinicians",
    who: "Neurologists & movement-disorder clinics",
    headline: "A patient-kept summary for the conversation.",
    body: "Your patients can choose to bring a short summary of their own trends and check-ins to their visit. Aeyron does not interpret results, flag anything, or suggest treatment changes. The clinical judgment stays with you.",
    points: [
      "Shared only when the patient chooses to share it",
      "Trends compared with the person's own past, not a clinical score",
      "Not a medical device and not a diagnostic tool",
    ],
  },
  {
    id: "partners",
    who: "Care facilities, researchers & investors",
    headline: "A wellness companion on devices people already own.",
    body: "Aeyron runs on the phone people already carry, which keeps it low-friction for the people who use it. Get in touch if you would like to learn more.",
    points: [
      "Runs on the iPhone people already own",
      "Opt-in, permission-based data sources",
      "Built as a wellness companion, not a medical device",
    ],
  },
];

export type Founder = { name: string; role: string; email: string; from: string };

export const founders: Founder[] = [
  { name: "Pingash Vohra", role: "CEO", email: "pingash@aeyron.health", from: "" },
  { name: "Vansh Jain", role: "CTO", email: "vansh@aeyron.health", from: "" },
  { name: "Siddharth Kwatra", role: "COO", email: "siddharth@aeyron.health", from: "" },
];

/** Credibility logos in /public/logos. SVGs are crisp; a couple are raster. */
export const backers = [
  { name: "Velocity", file: "/logos/velocity.png" },
  { name: "1517 Fund", file: "/logos/1517fund.svg" },
  { name: "Google for Startups", file: "/logos/google-for-startups.svg" },
  { name: "Canopy Founders", file: "/logos/canopy-founders.svg" },
  { name: "YC Summer School", file: "/logos/yc-summer-school.svg" },
  { name: "Refraction Innovation Hub", file: "/logos/refraction.svg" },
];

export const teamFrom = [
  { name: "Microsoft", file: "/logos/microsoft.png" },
  { name: "Y Combinator", file: "/logos/yc.png" },
  { name: "AMD", file: "/logos/amd.png" },
  { name: "Xceedance", file: "/logos/xceedance.svg" },
  { name: "GW Entrepreneurship and Innovation", file: "/logos/gw-startup-avenue.svg" },
  { name: "Ministry of Mines", file: "/logos/ministry-of-mines.svg" },
];

/** Required honesty: companion, not a diagnosis. Render in footer + near metrics. */
export const disclaimer = {
  short:
    "For informational and wellness purposes only - not a clinical measurement.",
  full: "Aeyron is a wellness and personal-tracking tool. It is not a medical device and is not intended to diagnose, treat, cure, or prevent Parkinson's disease or any other condition. It is not a substitute for professional medical advice. Always consult a qualified healthcare provider. Do not start, stop, or change any treatment or medication based on this app. Aeyron has not been cleared or approved by the FDA.",
};
