/**
 * Home page copy. Every number and claim here comes from the October 2026
 * white paper or was confirmed by the founders. Check with them before
 * adding a new one.
 */

import { brand } from "./site";

export const links = {
  testflight: "https://testflight.apple.com/join/4ehxnWFP",
  // Swap for a Calendly / Cal.com link when there is one.
  bookCall: `mailto:${brand.contactEmail}?subject=${encodeURIComponent(
    "15-minute call with Aeyron",
  )}&body=${encodeURIComponent(
    "Hi Aeyron team,\n\nI'd like a 15-minute call. A few times that work for me:\n\n",
  )}`,
  email: `mailto:${brand.contactEmail}`,
};

export const proof = [
  { value: "201", label: "people using Aeyron" },
  { value: "2", label: "signed clinical LOIs: Red Cross at Walter Reed and Aster CMI" },
  { value: "287+", label: "conversations with patients, care partners and clinicians" },
];

export type Need = { id: NeedId; title: string; body: string };
export type NeedId = "falls" | "nights" | "medications" | "visits" | "caregiver_load";

export const needs: Need[] = [
  {
    id: "falls",
    title: "Falls and walking",
    body: "Walking speed, step length and balance-related changes come from Apple Health and are compared with their own usual. When walking slowly changes over weeks, you see it instead of guessing. The weekly call asks about near-falls and freezing.",
  },
  {
    id: "nights",
    title: "Nights and sleep",
    body: "Sleep from the watch, night-time phone activity, and a few questions about nights, naps and energy. Hard nights stop being a blur you try to remember later.",
  },
  {
    id: "medications",
    title: "Medications",
    body: "One tap for “taken now” against their own schedule, shown next to how the day went. Medication names stay on the phone.",
  },
  {
    id: "caregiver_load",
    title: "Caregiver strain",
    body: "Nothing for them to log and nothing for you to chase. A plain weekly update reaches the family, so keeping everyone informed doesn't all fall on you.",
  },
  {
    id: "visits",
    title: "Doctor visits",
    body: "Walk in with a short report organised the way neurologists think: what changed, what stayed the same, and how many days of data back each point. No more rebuilding months from memory.",
  },
];

export const testflightSteps = [
  {
    title: "Get TestFlight",
    body: "On the iPhone, install TestFlight from the App Store. It's Apple's free app for trying new apps early.",
  },
  {
    title: "Open our invite",
    body: "Open the Aeyron invite link on that iPhone and tap Accept.",
  },
  {
    title: "Install Aeyron",
    body: "Tap Install, open Aeyron, and follow the short setup. It starts learning their usual right away.",
  },
];

export const steps = [
  {
    title: "Capture everyday signals",
    body: "Walking, activity and sleep from iPhone and Apple Watch, typing rhythm and hand steadiness, short check-ins and medication taps. Nothing to log.",
  },
  {
    title: "Learn their usual",
    body: "Over the first few weeks Aeyron learns each person's own range, then flags sustained change with a confidence level. A normal day for one person can be a hard week for another.",
  },
  {
    title: "Share the right next step",
    body: "A practical prompt for the person, a plain weekly update for family, and a structured report for the neurologist. Each one only with consent.",
  },
];

export const callPoints = [
  "About once a week, on their regular phone line. No app to open and nothing to read, which matters with tremor, low vision or low comfort with technology.",
  "A natural five-minute conversation about how the week went: mood, sleep, thinking and daily life.",
  "It gets shorter over time. When the phone and watch already answer a topic, the call moves on to what changed.",
  "If someone mentions an emergency, such as a fall they can't get up from, they are directed to 911 straight away and our team is alerted.",
];

export const clinicianPoints = [
  {
    title: "Mirrors the MDS-UPDRS",
    body: "Four sections that follow the four parts of the scale, under plain headings.",
  },
  {
    title: "Every change shows its evidence",
    body: "Same, better, worse or not enough data, with the number of good-data days behind it. Missing days are never counted as zero.",
  },
  {
    title: "Parts I and II between visits",
    body: "A weekly conversational call covers non-motor and motor experiences of daily living, combined per topic with walking, typing and hand-steadiness measures.",
  },
  {
    title: "Patient-controlled sharing",
    body: "Every clinician link needs the person's consent and can be revoked at any time.",
  },
];

export const exampleReport = {
  header: "Example patient · 3 months · readings on 82 of 91 days",
  rows: [
    { area: "Daily life (non-motor)", status: "Same" },
    { area: "Daily motor tasks: walking speed lower over 4 weeks", status: "Worse" },
    { area: "Motor signs measured at home", status: "Same" },
    { area: "Fluctuations", status: "Not enough data" },
  ],
} as const;

export const pilots =
  "Clinical pilots with a movement-disorder neurologist at a US academic medical center, measured against clinician-rated MDS-UPDRS, and with a university neuroscience lab in Canada.";

export const privacyPoints = [
  "Nothing is uploaded until the person turns sharing on.",
  "Family and clinician links each need consent and can be revoked.",
  "Medication names and typed text stay on the phone. The keyboard records key timing only, never the words.",
  "Voice is off until the person turns it on. Aeyron never listens in the background.",
  "Data is stored in the United States.",
];

export const team = [
  {
    name: "Pingash Vohra",
    role: "Co-founder & CEO",
    bio: "Computer science, University of Waterloo. Software engineer at early-stage startups including Booked AI, with voice-systems experience.",
  },
  {
    name: "Vansh Jain",
    role: "Co-founder & CTO",
    bio: "Computer science, University of Waterloo. Engineering roles at E3 Group, AMD, Microsoft and Mercor.",
  },
  {
    name: "Siddharth Kwatra",
    role: "Co-founder & COO",
    bio: "Finance and business, George Washington University. Former Federal Reserve Board research analyst.",
  },
];

export const faqs = [
  {
    q: "How do we try it today?",
    a: "The iPhone app is in App Store review. Until it's out, you can install it today through TestFlight, Apple's app for trying new apps early. It takes about five minutes.",
  },
  {
    q: "Do we need an Apple Watch?",
    a: "No. Aeyron works with an iPhone alone. A watch adds the hours when the phone sits on a table, and both feed the same record.",
  },
  {
    q: "What about Android?",
    a: "Android is in progress. Join the waitlist and we'll tell you as soon as it's ready.",
  },
  {
    q: "What does it cost?",
    a: "Nothing. Everything is free right now.",
  },
  {
    q: "Who can see the data?",
    a: "Only the people the person chooses. Nothing leaves the phone until sharing is on, every family or clinician link needs consent, and any link can be revoked.",
  },
  {
    q: "Does Aeyron diagnose Parkinson's?",
    a: "No. Aeyron is a general-wellness product that shows what changed between visits, so you and the care team can decide what to do. Clinical measures follow the FDA pathway as they are validated.",
  },
];

export const roles = [
  { id: "caregiver", label: "I care for someone with Parkinson's" },
  { id: "person_with_pd", label: "I live with Parkinson's" },
  { id: "clinician", label: "I'm a clinician" },
  { id: "other", label: "Something else" },
] as const;

export type RoleId = (typeof roles)[number]["id"];

export const worryOptions: ReadonlyArray<{ id: NeedId | "other"; label: string }> = [
  { id: "falls", label: "Falls" },
  { id: "nights", label: "Nights and sleep" },
  { id: "medications", label: "Medications" },
  { id: "caregiver_load", label: "Caregiver strain" },
  { id: "visits", label: "Doctor visits" },
  { id: "other", label: "Something else" },
];
