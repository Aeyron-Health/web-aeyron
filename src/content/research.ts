/**
 * Background reading only. These studies used their own devices and methods.
 * Aeyron has not been tested this way and does not make these measurements.
 *
 * Rules for use on the site: describe what each study looked at, in plain
 * words. Do NOT quote accuracy, correlation or AUC figures, and do NOT imply
 * that Aeyron reproduces, matches or is validated by any of this work.
 */

export type Citation = {
  authors: string;
  year: number;
  venue: string;
  doi: string;
  n: string;
  finding: string; // what the study looked at, plain words, no performance numbers
};

export type ResearchTopic = {
  key: string;
  label: string;
  citations: Citation[];
};

/** Shown next to the research list wherever it appears. */
export const researchDisclaimer =
  "These studies used their own devices and methods. Aeyron has not been tested this way and does not make these measurements.";

export const research: ResearchTopic[] = [
  {
    key: "motion",
    label: "Phone and wrist motion sensors",
    citations: [
      {
        authors: "Kostikis et al.",
        year: 2014,
        venue: "IEEE EMBC",
        doi: "10.1109/EMBC.2014.6943738",
        n: "23 PD",
        finding:
          "Looked at whether a smartphone's motion sensors could record hand movement in people with Parkinson's.",
      },
      {
        authors: "Hssayeni et al.",
        year: 2019,
        venue: "Sensors",
        doi: "10.3390/s19194215",
        n: "24 PD, free-living",
        finding:
          "Looked at wrist-worn motion sensors during everyday activities in people with Parkinson's.",
      },
    ],
  },
  {
    key: "typing",
    label: "Typing timing",
    citations: [
      {
        authors: "Giancardo et al. (neuroQWERTY)",
        year: 2016,
        venue: "Scientific Reports",
        doi: "10.1038/srep34468",
        n: "42 early-PD / 43 controls",
        finding:
          "Looked at the timing of ordinary typing, never the words, in people with and without early Parkinson's.",
      },
      {
        authors: "Arroyo-Gallego et al.",
        year: 2018,
        venue: "JMIR",
        doi: "10.2196/jmir.9462",
        n: "52",
        finding:
          "Looked at typing timing collected from people's own keyboards at home.",
      },
    ],
  },
  {
    key: "gait",
    label: "Walking pattern",
    citations: [
      {
        authors: "Lipsmeier et al.",
        year: 2018,
        venue: "Movement Disorders",
        doi: "10.1002/mds.27376",
        n: "44 PD / 35 controls",
        finding:
          "Looked at smartphone-based walking and movement tasks in people with Parkinson's.",
      },
      {
        authors: "WATCH-PD - Adams et al.",
        year: 2024,
        venue: "npj Parkinson's Disease",
        doi: "10.1038/s41531-024-00721-2",
        n: "82 early PD / 50 controls",
        finding:
          "Followed people with early Parkinson's for a year using Apple Watch and iPhone measures.",
      },
    ],
  },
];
