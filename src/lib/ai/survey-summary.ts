import type { Survey, SurveyResponse } from "@/data/surveys";

export interface SentimentBreakdown {
  positive: number; // percent
  neutral: number;
  negative: number;
}

export interface AiSurveySummary {
  responseCount: number;
  overallAvg: number; // 0-5
  hostAvg: number; // 0-5
  recommendPercent: number; // 0-100, % of "Yes"
  sentiment: SentimentBreakdown;
  topHighlights: { label: string; count: number }[];
  improvements: string[];
  paragraph: string;
}

const IMPROVEMENT_KEYWORDS = [
  "too",
  "wish",
  "would have liked",
  "more",
  "less",
  "rushed",
  "slow",
  "crowded",
];

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function numericAnswer(r: SurveyResponse, questionId: string): number | null {
  const a = r.answers.find((x) => x.questionId === questionId);
  if (!a || typeof a.value !== "number") return null;
  return a.value;
}

function stringAnswer(r: SurveyResponse, questionId: string): string | null {
  const a = r.answers.find((x) => x.questionId === questionId);
  if (!a || typeof a.value !== "string") return null;
  return a.value;
}

function arrayAnswer(r: SurveyResponse, questionId: string): string[] {
  const a = r.answers.find((x) => x.questionId === questionId);
  if (!a || !Array.isArray(a.value)) return [];
  return a.value as string[];
}

function sentimentFromStars(avgStars: number): SentimentBreakdown {
  // Spread so values read naturally; bias toward the overall score.
  if (avgStars >= 4.5) return { positive: 92, neutral: 6, negative: 2 };
  if (avgStars >= 4.0) return { positive: 78, neutral: 17, negative: 5 };
  if (avgStars >= 3.5) return { positive: 58, neutral: 30, negative: 12 };
  if (avgStars >= 3.0) return { positive: 40, neutral: 40, negative: 20 };
  if (avgStars >= 2.0) return { positive: 18, neutral: 42, negative: 40 };
  return { positive: 5, neutral: 25, negative: 70 };
}

function extractImprovementSentences(texts: string[]): string[] {
  const seen = new Set<string>();
  const hits: string[] = [];
  for (const text of texts) {
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const s of sentences) {
      const low = s.toLowerCase();
      if (IMPROVEMENT_KEYWORDS.some((k) => low.includes(k))) {
        const normalized = s.replace(/^[-•]\s*/, "");
        if (!seen.has(normalized)) {
          seen.add(normalized);
          hits.push(normalized);
        }
      }
    }
    if (hits.length >= 3) break;
  }
  return hits.slice(0, 3);
}

function buildParagraph(
  tripLabel: string,
  overallAvg: number,
  hostAvg: number,
  topHighlight: string | undefined,
  improvements: string[],
  recommendPercent: number
): string {
  const parts: string[] = [];
  if (overallAvg >= 4.5) {
    parts.push(`Travelers absolutely loved ${tripLabel}`);
  } else if (overallAvg >= 4.0) {
    parts.push(`${tripLabel} is landing well with travelers`);
  } else if (overallAvg >= 3.5) {
    parts.push(`${tripLabel} got mixed-to-positive feedback`);
  } else {
    parts.push(`${tripLabel} got lukewarm reviews`);
  }

  if (hostAvg >= 4.7) {
    parts.push("and you specifically earned near-perfect host marks");
  } else if (hostAvg >= 4.0) {
    parts.push("and your hosting scored highly");
  }

  const first =
    parts.join(" ") + (topHighlight ? ` — ${topHighlight.toLowerCase()} was the standout moment.` : ".");

  const improvementLine =
    improvements.length > 0
      ? ` A few travelers flagged things to tweak: ${improvements
          .map((i) => `"${i.replace(/\.$/, "")}"`)
          .join("; ")}.`
      : "";

  const recommendLine =
    recommendPercent > 0
      ? ` ${Math.round(recommendPercent)}% would recommend this trip to a friend.`
      : "";

  return first + improvementLine + recommendLine;
}

export function summarizeResponses(
  survey: Survey | null,
  responses: SurveyResponse[],
  tripLabel = "this trip"
): AiSurveySummary {
  const responseCount = responses.length;

  const overallScores = responses
    .map((r) => numericAnswer(r, "q-overall"))
    .filter((n): n is number => n != null);
  const hostScores = responses
    .map((r) => numericAnswer(r, "q-host"))
    .filter((n): n is number => n != null);
  const overallAvg = avg(overallScores);
  const hostAvg = avg(hostScores);

  // Highlight counts
  const highlightCount = new Map<string, number>();
  for (const r of responses) {
    for (const h of arrayAnswer(r, "q-highlights")) {
      highlightCount.set(h, (highlightCount.get(h) || 0) + 1);
    }
  }
  const topHighlights = Array.from(highlightCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label, count]) => ({ label, count }));

  // Improvement text
  const freeText = responses
    .map((r) => stringAnswer(r, "q-favorite"))
    .filter((s): s is string => !!s && s.trim().length > 0);
  const improvements = extractImprovementSentences(freeText);

  // Recommend
  const recommendAnswers = responses
    .map((r) => stringAnswer(r, "q-recommend"))
    .filter((s): s is string => !!s);
  const recommendYes = recommendAnswers.filter((s) => s === "Yes").length;
  const recommendPercent =
    recommendAnswers.length > 0
      ? (recommendYes / recommendAnswers.length) * 100
      : 0;

  const sentiment = sentimentFromStars(overallAvg);

  const paragraph = buildParagraph(
    tripLabel,
    overallAvg,
    hostAvg,
    topHighlights[0]?.label,
    improvements,
    recommendPercent
  );

  // Silence unused-survey warning — kept in signature for API symmetry / future use
  void survey;

  return {
    responseCount,
    overallAvg,
    hostAvg,
    recommendPercent,
    sentiment,
    topHighlights,
    improvements,
    paragraph,
  };
}
