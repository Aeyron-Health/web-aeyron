/**
 * Home page copy. Every number and claim here was confirmed by the founders
 * (white paper, YC application, Nov 2026 brief). Check with them before adding
 * a new one.
 *
 * Claim rules: never say validated, detects, predicts falls, FDA or HIPAA; the
 * phone check-in call is not live; no sleep tracking; no Garmin (agreement §8.4
 * bans publicity without Garmin's approval).
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
  { value: "287+", label: "conversations with people with Parkinson's, caregivers and clinicians" },
];

export type NeedId = "falls" | "nights" | "medications" | "visits" | "caregiver_load";
export type Need = { id: NeedId; title: string; body: string };

export const needs: Need[] = [
  {
    id: "falls",
    title: "Falls and walking",
    body: "Aeyron watches walking speed, step length and steadiness from Apple Health, against their own normal. If walking slowly gets harder over days or weeks, you hear about it early and can talk to their doctor.",
  },
  {
    id: "medications",
    title: "Medications",
    body: "One tap logs each dose, with reminders, and you can see doses next to how the day went. The names of their medicines stay on their phone.",
  },
  {
    id: "caregiver_load",
    title: "Caregiver strain",
    body: "You don't have to keep asking how they are. The family they choose get a plain weekly update by email, so keeping everyone informed doesn't all fall on you.",
  },
  {
    id: "visits",
    title: "Doctor visits",
    body: "Walk in with a short summary of what changed since the last visit, so the appointment starts from facts instead of memory.",
  },
];

export const testflightSteps = [
  {
    title: "Get TestFlight",
    body: "On their iPhone, search the App Store for TestFlight and install it. It's Apple's free app for early versions of new apps.",
  },
  {
    title: "Open our invite",
    body: "Open the Aeyron invite link on that iPhone, then tap Accept and Install.",
  },
  {
    title: "They sign in and choose",
    body: "They create their own account and decide what to share, and with whom. Aeyron starts learning their normal over the first few days.",
  },
];

export const steps = [
  {
    title: "Everyday signals",
    body: "Walking from Apple Health, how steady their hand is while holding the phone, and typing rhythm from the optional Aeyron keyboard, which records timing only, never the words. Plus a one-minute check-in and one tap per dose.",
  },
  {
    title: "Their own normal",
    body: "Over the first few weeks Aeyron learns what's usual for this one person, then compares each day only with them. A normal day for one person can be a hard week for another.",
  },
  {
    title: "The right person hears",
    body: "Plain words in the app for them, a weekly update for the family they choose, and a short summary for the neurologist they connect.",
  },
];

/** What happens when something changes: answers "will it tell me if Mum falls?" plainly. */
export const changePoints = [
  "When something moves away from their normal and stays there for several days, Aeyron shows it in the app in plain words, with how many days of data are behind it.",
  "The family members they chose see it in the weekly update, so you know when to check in.",
  "If they've connected a neurologist, it's in the summary before the next visit.",
  "Aeyron looks for slow changes, not emergencies. It isn't a fall alarm. If someone falls or is hurt, call 911.",
];

export const clinicianPoints = [
  {
    title: "What changed since last time",
    body: "Walking, hand steadiness, typing rhythm, check-ins and medication logs, each compared with the patient's own baseline.",
  },
  {
    title: "How far to trust it",
    body: "Each change shows how many days of good data stand behind it. Missing days are never counted as zero.",
  },
  {
    title: "Patient-controlled",
    body: "You see only what the patient chose to share, after they enter your invitation code. They can disconnect at any time, and every view is logged.",
  },
  {
    title: "Less work, not more",
    body: "A short summary before the visit instead of another dashboard to check.",
  },
];

export const exampleReport = {
  header: "Example patient · last 12 weeks · readings on 78 of 84 days",
  rows: [
    { area: "Walking speed: lower for 4 weeks", status: "Worse" },
    { area: "Hand steadiness", status: "Same" },
    { area: "Typing rhythm", status: "Same" },
    { area: "Medication logs", status: "Not enough data" },
  ],
} as const;

export const pilots =
  "We're designing studies with movement-disorder neurologists in the US and a Parkinson's mobility lab in Canada.";

export const privacyPoints = [
  "Aeyron goes on their phone, with their own account and their agreement.",
  "Nothing is uploaded until they turn sharing on.",
  "Each family member and clinician needs their yes, and they can remove anyone at any time.",
  "Medication names and typed words stay on the phone. Only daily numbers are shared.",
  "They can download or delete their data whenever they want. It's stored in the United States.",
];

export const team = [
  {
    name: "Pingash Vohra",
    role: "Co-founder & CEO",
    bio: "Computer science, University of Waterloo. Builds voice agents at Booked AI.",
  },
  {
    name: "Vansh Jain",
    role: "Co-founder & CTO",
    bio: "Computer science, University of Waterloo. Engineering at Microsoft, AMD, Mercor and E3. Built the app and the engine that learns each person's normal.",
  },
  {
    name: "Siddharth Kwatra",
    role: "Co-founder & COO",
    bio: "Finance and business, George Washington University. Former Federal Reserve Board research analyst. Leads clinical partnerships and study planning.",
  },
];

export const faqs = [
  {
    q: "How do we try it today?",
    a: "Aeyron is in review for the App Store. Until it's out, you install it through TestFlight, Apple's free app for early versions. Setting it up together takes about five minutes.",
  },
  {
    q: "Does my family member have to agree?",
    a: "Yes. Aeyron runs on their phone, under their own account. They choose what to share and with whom, and they can stop sharing or delete everything at any time.",
  },
  {
    q: "Will it tell me if Mum falls?",
    a: "No. Aeyron isn't a fall alarm or an emergency service. It looks for slower changes over days and weeks, like walking getting harder, so you can act early. For a fall or an emergency, call 911.",
  },
  {
    q: "Do we need an Apple Watch?",
    a: "No. An iPhone is enough. If they wear an Apple Watch, Apple Health adds its walking data too.",
  },
  {
    q: "What about Android?",
    a: "Android is on the way. Join the waitlist and we'll tell you as soon as it's ready.",
  },
  {
    q: "What does it cost?",
    a: "Nothing. Everything is free right now.",
  },
  {
    q: "Does Aeyron diagnose Parkinson's?",
    a: "No. Aeyron doesn't diagnose or treat anything. It helps the person, their family and their care team see what changed between visits.",
  },
];

export const roles = [
  { id: "caregiver", label: "I care for someone with Parkinson's" },
  { id: "person_with_pd", label: "I live with Parkinson's" },
  { id: "clinician", label: "I'm a clinician" },
  { id: "other", label: "Something else" },
] as const;

export type RoleId = (typeof roles)[number]["id"];

// The waitlist asks what worries people. These are their answers, not product claims.
export const worryOptions: ReadonlyArray<{ id: NeedId | "other"; label: string }> = [
  { id: "falls", label: "Falls" },
  { id: "nights", label: "Hard nights" },
  { id: "medications", label: "Medications" },
  { id: "caregiver_load", label: "Caregiver strain" },
  { id: "visits", label: "Doctor visits" },
  { id: "other", label: "Something else" },
];
