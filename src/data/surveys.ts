/**
 * Post-trip AI surveys: hosts opt in per trip; once the trip ends, travelers
 * who booked get a survey tailored by the mock AI in `src/lib/ai/*`.
 *
 * All state is persisted in localStorage so the demo can be self-contained.
 */

export type SurveyQuestionType =
  | "stars"
  | "multi-select"
  | "short-text"
  | "yes-no";

export interface SurveyQuestion {
  id: string;
  type: SurveyQuestionType;
  prompt: string;
  options?: string[]; // for multi-select / yes-no
  maxStars?: number; // for stars (default 5)
  required?: boolean;
}

export interface Survey {
  tripId: string;
  hostId: string;
  enabled: boolean;
  questions: SurveyQuestion[];
  updatedAt: string;
}

export type SurveyAnswerValue = number | string | string[];

export interface SurveyAnswer {
  questionId: string;
  value: SurveyAnswerValue;
}

export interface SurveyResponse {
  id: string;
  tripId: string;
  bookingId: string;
  travelerName: string;
  answers: SurveyAnswer[];
  submittedAt: string;
}

const SURVEYS_KEY = "packpally_trip_surveys";
const RESPONSES_KEY = "packpally_survey_responses";
const CHANGE_EVENT = "packpally_surveys_change";

type SurveyStore = Record<string, Survey>; // keyed by tripId

function readSurveys(): SurveyStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SURVEYS_KEY);
    if (!raw) {
      // First-time: seed a Survey for Sofia's Amalfi trip so the demo has
      // something to show on both host results and traveler-side prompts.
      const seed: SurveyStore = { "trip-1": SEED_SURVEY_AMALFI };
      localStorage.setItem(SURVEYS_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function writeSurveys(store: SurveyStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SURVEYS_KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {}
}

function readResponses(): SurveyResponse[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RESPONSES_KEY);
    if (!raw) {
      // First-time: seed demo responses so the host's results view isn't empty
      const seed = SEED_RESPONSES;
      localStorage.setItem(RESPONSES_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeResponses(list: SurveyResponse[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RESPONSES_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {}
}

/**
 * Surveys are keyed by the traveler-facing trip id (`trip-*`). Partner-trip
 * ids use the `ptrip-*` prefix, so we normalize inbound tripIds before
 * reading/writing so both sides hit the same record.
 */
function normalizeTripId(tripId: string): string {
  if (tripId.startsWith("ptrip-")) return tripId.replace(/^ptrip-/, "trip-");
  return tripId;
}

export function getSurveyForTrip(tripId: string): Survey | null {
  return readSurveys()[normalizeTripId(tripId)] || null;
}

export function saveSurvey(survey: Survey): Survey {
  const key = normalizeTripId(survey.tripId);
  const store = readSurveys();
  store[key] = {
    ...survey,
    tripId: key,
    updatedAt: new Date().toISOString(),
  };
  writeSurveys(store);
  return store[key];
}

export function setSurveyEnabled(tripId: string, enabled: boolean): void {
  const key = normalizeTripId(tripId);
  const store = readSurveys();
  if (store[key]) {
    store[key] = {
      ...store[key],
      enabled,
      updatedAt: new Date().toISOString(),
    };
    writeSurveys(store);
  }
}

export function getResponsesForTrip(tripId: string): SurveyResponse[] {
  const key = normalizeTripId(tripId);
  return readResponses()
    .filter((r) => r.tripId === key)
    .sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
}

export function getResponseForBooking(
  bookingId: string
): SurveyResponse | null {
  return readResponses().find((r) => r.bookingId === bookingId) || null;
}

export function saveResponse(
  input: Omit<SurveyResponse, "id" | "submittedAt">
): SurveyResponse {
  const record: SurveyResponse = {
    ...input,
    id: `resp-${Date.now()}`,
    submittedAt: new Date().toISOString(),
  };
  writeResponses([record, ...readResponses()]);
  return record;
}

export function subscribeToSurveys(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60_000).toISOString();
}

// ── Seed survey for trip-1 (Amalfi) ──
// Matches the question ids the generator produces. Kept in sync with
// `src/lib/ai/trip-survey-generator.ts`.
const SEED_SURVEY_AMALFI: Survey = {
  tripId: "trip-1",
  hostId: "host-1",
  enabled: true,
  updatedAt: daysAgo(8),
  questions: [
    {
      id: "q-overall",
      type: "stars",
      prompt: "How was the trip overall?",
      maxStars: 5,
      required: true,
    },
    {
      id: "q-host",
      type: "stars",
      prompt: "Rate your host, Sofia Martinez",
      maxStars: 5,
      required: true,
    },
    {
      id: "q-highlights",
      type: "multi-select",
      prompt: "Which highlights stood out the most?",
      options: [
        "Private boat ride along the Amalfi Coast",
        "Traditional Italian cooking class",
        "Hidden beaches & coves",
        "Scenic hikes on the Path of the Gods",
        "Sunset limoncello tasting",
        "Local market and food tour",
      ],
    },
    {
      id: "q-favorite",
      type: "short-text",
      prompt: "What was your favorite moment in Amalfi?",
    },
    {
      id: "q-pace",
      type: "yes-no",
      prompt: "How was the pace?",
      options: ["Too slow", "Just right", "Too fast"],
    },
    {
      id: "q-recommend",
      type: "yes-no",
      prompt: "Would you recommend this trip to a friend?",
      options: ["Yes", "Maybe", "No"],
      required: true,
    },
  ],
};

// ── Seed responses for trip-1 (Amalfi, Sofia's trip) ──
// These are the question ids the generator produces. If you change the
// generator shape, update these seeds to keep the demo coherent.
const SEED_RESPONSES: SurveyResponse[] = [
  {
    id: "resp-seed-1",
    tripId: "trip-1",
    bookingId: "PP-SEED-AM1",
    travelerName: "Emily Chen",
    submittedAt: daysAgo(4),
    answers: [
      { questionId: "q-overall", value: 5 },
      { questionId: "q-host", value: 5 },
      {
        questionId: "q-highlights",
        value: [
          "Private boat ride along the Amalfi Coast",
          "Hidden beaches & coves",
          "Traditional Italian cooking class",
        ],
      },
      {
        questionId: "q-favorite",
        value:
          "The private cove swim on day 4 was unreal. Sofia's food stops all week were incredible too — I'm still thinking about that pasta in Ravello.",
      },
      { questionId: "q-pace", value: "Just right" },
      { questionId: "q-recommend", value: "Yes" },
    ],
  },
  {
    id: "resp-seed-2",
    tripId: "trip-1",
    bookingId: "PP-SEED-AM4",
    travelerName: "Marcus Reeves",
    submittedAt: daysAgo(3),
    answers: [
      { questionId: "q-overall", value: 4 },
      { questionId: "q-host", value: 5 },
      {
        questionId: "q-highlights",
        value: [
          "Traditional Italian cooking class",
          "Scenic hikes on the Path of the Gods",
        ],
      },
      {
        questionId: "q-favorite",
        value:
          "Cooking with Sofia's friend in Positano — felt like family. Day 5 Path of the Gods was a bit rushed though, would have liked more photo time.",
      },
      { questionId: "q-pace", value: "Too fast" },
      { questionId: "q-recommend", value: "Yes" },
    ],
  },
  {
    id: "resp-seed-3",
    tripId: "trip-1",
    bookingId: "PP-SEED-AM2",
    travelerName: "James Whitfield",
    submittedAt: daysAgo(2),
    answers: [
      { questionId: "q-overall", value: 5 },
      { questionId: "q-host", value: 5 },
      {
        questionId: "q-highlights",
        value: [
          "Private boat ride along the Amalfi Coast",
          "Sunset limoncello tasting",
        ],
      },
      {
        questionId: "q-favorite",
        value:
          "Limoncello sunset with the whole group — perfect final night. Small thing: wish we had a bit more free time in Sorrento.",
      },
      { questionId: "q-pace", value: "Just right" },
      { questionId: "q-recommend", value: "Yes" },
    ],
  },
];
