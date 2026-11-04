/**
 * Honest, citable research backing each measurement method.
 * Rules for use on the site: lead with realistic numbers, frame as
 * monitoring / screening-support, NEVER diagnosis. Use ranges where the
 * literature is mixed. Every claim here traces to a peer-reviewed source.
 * See plan Appendix A.
 */

export type Citation = {
  authors: string;
  year: number;
  venue: string;
  doi: string;
  n: string;
  finding: string; // honest, lay-level, no overclaim
};

export type ResearchTopic = {
  key: string;
  label: string;
  citations: Citation[];
};

export const research: ResearchTopic[] = [
  {
    key: "tremor",
    label: "Tremor from motion sensors",
    citations: [
      {
        authors: "Kostikis et al.",
        year: 2014,
        venue: "IEEE EMBC",
        doi: "10.1109/EMBC.2014.6943738",
        n: "23 PD",
        finding:
          "Smartphone motion-sensor tremor metrics tracked clinicians' hand-tremor ratings (r > 0.7).",
      },
      {
        authors: "Hssayeni et al.",
        year: 2019,
        venue: "Sensors",
        doi: "10.3390/s19194215",
        n: "24 PD, free-living",
        finding:
          "A wrist sensor estimated tremor severity during everyday movement, closely matching clinical scores.",
      },
    ],
  },
  {
    key: "tapping",
    label: "Finger tapping / bradykinesia",
    citations: [
      {
        authors: "Lee et al.",
        year: 2016,
        venue: "PLoS ONE",
        doi: "10.1371/journal.pone.0158852",
        n: "57 PD / 87 controls",
        finding:
          "In a research study, smartphone tapping patterns separated a Parkinson's group from a control group with high accuracy (AUC 0.92, case-control).",
      },
      {
        authors: "Omberg et al. (mPower)",
        year: 2022,
        venue: "Nature Biotechnology",
        doi: "10.1038/s41587-021-00974-9",
        n: "960 remote",
        finding:
          "In the large mPower study, tapping agreed reasonably with in-clinic motor exams (r = 0.71 in the clinic-compared subset).",
      },
    ],
  },
  {
    key: "typing",
    label: "Typing rhythm (keystroke dynamics)",
    citations: [
      {
        authors: "Giancardo et al. (neuroQWERTY)",
        year: 2016,
        venue: "Scientific Reports",
        doi: "10.1038/srep34468",
        n: "42 early-PD / 43 controls",
        finding:
          "In a study, the timing of ordinary typing - never the words - separated an early-Parkinson's group from controls about as well as in-clinic finger-tapping (AUC 0.81, case-control).",
      },
      {
        authors: "Arroyo-Gallego et al.",
        year: 2018,
        venue: "JMIR",
        doi: "10.2196/jmir.9462",
        n: "52",
        finding:
          "The same typing-rhythm signal held up when measured passively from people's own keyboards at home (AUC 0.76).",
      },
    ],
  },
  {
    key: "voice",
    label: "Voice / speech",
    citations: [
      {
        authors: "Tsanas et al.",
        year: 2010,
        venue: "J. R. Soc. Interface",
        doi: "10.1098/rsif.2010.0456",
        n: "~6,000 recordings / 42 PD",
        finding:
          "Home voice recordings estimated Parkinson's severity scores to within about 2 points of a neurologist's rating.",
      },
      {
        authors: "Rahman et al.",
        year: 2021,
        venue: "JMIR",
        doi: "10.2196/26305",
        n: "726 people, real-world",
        finding:
          "In a research study, voice features from a single spoken sentence recorded at home matched Parkinson's status in about 75% of cases.",
      },
    ],
  },
  {
    key: "gait",
    label: "Gait & mobility",
    citations: [
      {
        authors: "Lipsmeier et al.",
        year: 2018,
        venue: "Movement Disorders",
        doi: "10.1002/mds.27376",
        n: "44 PD / 35 controls",
        finding:
          "In one study, passive smartphone gait measures captured Parkinson's-related motor changes, in some cases not yet evident on the in-clinic exam.",
      },
      {
        authors: "WATCH-PD - Adams et al.",
        year: 2024,
        venue: "npj Parkinson's Disease",
        doi: "10.1038/s41531-024-00721-2",
        n: "82 early PD / 50 controls",
        finding:
          "Over a year, Apple Watch measures captured worsening arm swing and rising tremor time in early Parkinson's.",
      },
    ],
  },
  {
    key: "continuous",
    label: "Continuous tremor & dyskinesia (Apple Movement Disorder API)",
    citations: [
      {
        authors: "Powers et al. (Apple, MM4PD)",
        year: 2021,
        venue: "Science Translational Medicine",
        doi: "10.1126/scitranslmed.abd7865",
        n: "343 PD",
        finding:
          "In Apple's MM4PD study, a watch-based monitor tracked tremor severity in close agreement with neurologists (r = 0.80) and reflected expected medication on/off patterns. Aeyron is grounded in this published work.",
      },
    ],
  },
];

/** Validation frameworks / efforts we are honestly grounded in (not parity claims). */
export const validationAnchors = [
  "WATCH-PD (Apple Watch + iPhone, multi-site)",
  "Roche PD Mobile Application (PASADENA)",
  "mPower (Sage Bionetworks / Univ. of Rochester)",
  "Digital Medicine Society V3 framework",
  "Critical Path for Parkinson's",
];
