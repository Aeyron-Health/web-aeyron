/**
 * Single source of truth for brand constants, navigation, and section content.
 * Keeps copy consistent and honest across all sections.
 */

export const brand = {
  name: "Aeyron",
  wordmark: "Aeyron",
  // Mission, plain: most accessible passive Parkinson's monitoring platform.
  mission:
    "Building the world's most accessible passive monitoring platform for Parkinson's disease.",
  // Brand tagline (revealed word-by-word on scroll). Easy to swap.
  tagline: "Care that never looks away.",
  taglineSub: "The hours between visits, finally seen.",
  investorEmail: "aeyron7hq@gmail.com",
  contactEmail: "aeyron7hq@gmail.com",
};

export const nav = {
  links: [
    { label: "The gap", href: "#gap" },
    { label: "How it works", href: "#how-it-works" },
    { label: "What you get", href: "#what-you-get" },
    { label: "The science", href: "#science" },
    { label: "Who it's for", href: "#audiences" },
    { label: "Roadmap", href: "#roadmap" },
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
    id: "tremor",
    name: "Tremor",
    what: "The hand's shake at the Parkinsonian 3-7 Hz signature.",
    how: "Read from the phone's motion sensors while it's simply held - and continuously, all day, when paired with a smart watch.",
    signal: "Continuous tremor and dyskinesia, not a once-a-year snapshot.",
    viz: "tremor",
    researchKey: "continuous",
  },
  {
    id: "gait",
    name: "Gait & mobility",
    what: "Walking speed, step length, and steadiness.",
    how: "Read passively from Apple HealthKit and Android Health Connect as the person walks around normally. No test taken.",
    signal: "Everyday mobility, measured without a clinic walk-test.",
    viz: "gait",
    researchKey: "gait",
  },
  {
    id: "tapping",
    name: "Finger tapping",
    what: "The rhythm and variability of finger taps - early signs of bradykinesia.",
    how: "Measured from normal taps inside the app; slowing and dysrhythmia surface gently over time.",
    signal: "Bradykinesia trends a clinician would otherwise see twice a year.",
    viz: "tap",
    researchKey: "tapping",
  },
  {
    id: "typing",
    name: "Typing rhythm",
    what: "Key hold-times and cadence while typing - never the content.",
    how: "An optional Aeyron keyboard measures typing rhythm across the apps people already use.",
    signal: "A research-backed early-PD signal, captured with zero extra effort.",
    viz: "typing",
    researchKey: "typing",
  },
  {
    id: "voice",
    name: "Voice",
    what: "Jitter, shimmer, and overall voice quality.",
    how: "Optional spoken check-ins, a few seconds at a time.",
    signal: "Vocal changes that often arrive early and quietly.",
    viz: "voice",
    researchKey: "voice",
  },
  {
    id: "nonmotor",
    name: "Non-motor",
    what: "Sleep, heart rate, mood, and medication adherence and response.",
    how: "Pulled from the health data already on the phone, smart watch, and smart speaker, with the person's permission.",
    signal: "The on/off picture that motor scores alone miss.",
    viz: "nonmotor",
  },
  {
    id: "deeptests",
    name: "On-demand deep tests",
    what: "Spiral drawing, reaction time, and memory checks.",
    how: "A few quick, high-precision tests for when sharper tracking is wanted.",
    signal: "Precision on demand, layered on top of passive monitoring.",
    viz: "deeptests",
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
    headline: "Finally, something that watches between visits.",
    body: "Dignity, reassurance, and control. Aeyron quietly keeps track so you don't have to, and turns months of real life into a picture you can understand and act on.",
    points: [
      "No clinic visit, no wearable to buy, no daily homework",
      "A clear personal trend you actually own",
      "A plain-English summary to bring to your neurologist",
    ],
  },
  {
    id: "clinicians",
    who: "Neurologists & movement-disorder clinics",
    headline: "Frequent, UPDRS-aligned data between visits.",
    body: "See what happens between appointments. With the patient's consent, Aeyron's trends flow to their neurologist, and a suggestion layer flags the moments worth a closer look, so medication decisions rest on more than a single morning's exam.",
    points: [
      "A clinician dashboard with longitudinal trends, shared with the patient's neurologist",
      "A suggestion layer that flags when medication timing or response may be worth revisiting - not just a report",
      "Signals grounded in published digital-biomarker research",
    ],
  },
  {
    id: "partners",
    who: "Care facilities, researchers & investors",
    headline: "Scale, validation, and the bigger vision.",
    body: "Passive monitoring that runs on devices residents and participants already own - a foundation for pilots, research cohorts, and a platform built to grow into clinical-grade validation.",
    points: [
      "Pilot-ready, low-friction deployment",
      "A clear clinical-validation and regulatory roadmap",
      "A path from pocket today to ambient home tomorrow",
    ],
  },
];

export type RoadmapPhase = {
  phase: string;
  title: string;
  body: string;
  status: "now" | "next" | "horizon";
};

export const roadmap: RoadmapPhase[] = [
  {
    phase: "Phase 1",
    title: "Passive monitoring, in your pocket",
    body: "The Aeyron app turns the phone, smart watch, and smart speaker people already own into continuous, passive monitoring - a research-grounded wellness companion available today.",
    status: "now",
  },
  {
    phase: "Phase 2",
    title: "Clinical validation",
    body: "Validation studies against MDS-UPDRS and partnership with movement-disorder clinics, following the Digital Medicine Society's V3 framework.",
    status: "next",
  },
  {
    phase: "Phase 3",
    title: "Regulatory track",
    body: "Pursue FDA Software-as-a-Medical-Device review along the established 510(k) / De Novo pathways, where the evidence supports it.",
    status: "next",
  },
  {
    phase: "North star",
    title: "Ambient monitoring at home",
    body: "A passive, no-wearable home monitor - the eventual zero-effort endpoint of the same mission. Software in your pocket today; ambient monitoring in your home tomorrow.",
    status: "horizon",
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
  // Forward-looking regulatory line. Uses "pursuing"; switch to "awaiting" only
  // once a 510(k)/De Novo submission has actually been filed.
  regulatory:
    "We are on a path to becoming a regulated medical device, and are pursuing FDA clearance.",
};
