import type { Trip } from "@/types";
import type { Host } from "@/types";
import type { SurveyQuestion } from "@/data/surveys";
import { randomDelay } from "./simulate-delay";

/** Status messages cycled during the simulated generation delay. */
export const SURVEY_GENERATION_STATUSES = [
  "Reading this trip's itinerary…",
  "Matching questions to the activities…",
  "Personalizing for the host…",
  "Polishing the wording…",
];

const PACE_OPTIONS = ["Too slow", "Just right", "Too fast"];

function destinationFavoritePrompt(trip: Pick<Trip, "destination" | "country">): string {
  return `What was your favorite moment in ${trip.destination}?`;
}

function paceQuestion(
  trip: Pick<Trip, "difficulty" | "category">
): SurveyQuestion {
  const activityHint = trip.category.includes("Adventure")
    ? " — any day feel too rushed?"
    : trip.category.includes("Wellness")
    ? " — enough downtime built in?"
    : "";
  return {
    id: "q-pace",
    type: "yes-no", // we reuse the yes-no type but with 3 options
    prompt: `How was the pace${activityHint}`,
    options: PACE_OPTIONS,
    required: false,
  };
}

/**
 * Build a 6-question post-trip survey for the given trip.
 * Uses trip.highlights, category, and destination to tailor questions.
 *
 * Deterministic: same input → same output. Wrapping this in
 * `generateTripSurveyQuestionsAsync` adds the "AI is thinking" UX.
 */
export function generateTripSurveyQuestions(
  trip: Pick<
    Trip,
    "destination" | "country" | "highlights" | "difficulty" | "category"
  >,
  host?: Pick<Host, "name">
): SurveyQuestion[] {
  const highlightOptions = trip.highlights.slice(0, 6);

  const questions: SurveyQuestion[] = [
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
      prompt: host?.name
        ? `Rate your host, ${host.name}`
        : "Rate your host",
      maxStars: 5,
      required: true,
    },
    {
      id: "q-highlights",
      type: "multi-select",
      prompt: "Which highlights stood out the most?",
      options: highlightOptions,
    },
    {
      id: "q-favorite",
      type: "short-text",
      prompt: destinationFavoritePrompt(trip),
    },
    paceQuestion(trip),
    {
      id: "q-recommend",
      type: "yes-no",
      prompt: "Would you recommend this trip to a friend?",
      options: ["Yes", "Maybe", "No"],
      required: true,
    },
  ];

  return questions;
}

/**
 * Simulated AI generation with a 1.2–1.8s delay, mirroring other
 * `src/lib/ai/*` features.
 */
export async function generateTripSurveyQuestionsAsync(
  trip: Pick<
    Trip,
    "destination" | "country" | "highlights" | "difficulty" | "category"
  >,
  host?: Pick<Host, "name">
): Promise<SurveyQuestion[]> {
  await randomDelay(1200, 1800);
  return generateTripSurveyQuestions(trip, host);
}
