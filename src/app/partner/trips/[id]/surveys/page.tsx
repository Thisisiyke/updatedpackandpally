"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Sparkles,
  Star,
  ThumbsUp,
  MessageSquareQuote,
  ChevronDown,
  ChevronUp,
  BellOff,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { partnerTrips } from "@/data/partner-trips";
import {
  getResponsesForTrip,
  getSurveyForTrip,
  subscribeToSurveys,
  type Survey,
  type SurveyResponse,
} from "@/data/surveys";
import { summarizeResponses } from "@/lib/ai/survey-summary";
import { getBookingsForTrip } from "@/lib/partner-bookings";
import { cn } from "@/lib/utils";

function StarsDisplay({ value, max = 5 }: { value: number; max?: number }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < Math.floor(rounded)
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/40"
          )}
        />
      ))}
    </div>
  );
}

function answerDisplay(
  response: SurveyResponse,
  questionId: string,
  survey: Survey | null
): React.ReactNode {
  const question = survey?.questions.find((q) => q.id === questionId);
  const answer = response.answers.find((a) => a.questionId === questionId);
  if (!answer) return <span className="text-muted-foreground italic">Skipped</span>;

  if (question?.type === "stars" && typeof answer.value === "number") {
    return <StarsDisplay value={answer.value} max={question.maxStars || 5} />;
  }
  if (Array.isArray(answer.value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {answer.value.map((v) => (
          <Badge key={v} variant="secondary" className="text-[10px]">
            {v}
          </Badge>
        ))}
      </div>
    );
  }
  return <span className="whitespace-pre-wrap">{String(answer.value)}</span>;
}

export default function PartnerTripSurveysPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const trip = partnerTrips.find((t) => t.id === id);

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refresh = () => {
    setSurvey(getSurveyForTrip(id));
    setResponses(getResponsesForTrip(id));
  };

  useEffect(() => {
    refresh();
    return subscribeToSurveys(refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const invitedCount = useMemo(
    () => (trip ? getBookingsForTrip(trip.id).length : 0),
    [trip]
  );

  const summary = useMemo(
    () => summarizeResponses(survey, responses, trip?.title || "this trip"),
    [survey, responses, trip?.title]
  );

  const responseRate =
    invitedCount > 0 ? (responses.length / invitedCount) * 100 : 0;

  if (!trip) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold">Trip not found</h1>
        <Button asChild className="mt-6">
          <Link href="/partner/trips">Back to trips</Link>
        </Button>
      </div>
    );
  }

  const notEnabled = !survey || !survey.enabled;

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild className="h-9 w-9 shrink-0">
          <Link href={`/partner/trips/${id}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {trip.title}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Post-trip feedback collected by AI
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border bg-muted/40 p-1 w-fit">
        <Link
          href={`/partner/trips/${id}`}
          className="rounded-md px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Overview
        </Link>
        <Link
          href={`/partner/trips/${id}/travelers`}
          className="rounded-md px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Travelers
        </Link>
        <span className="rounded-md bg-white px-4 py-1.5 text-sm font-semibold shadow-sm">
          Surveys
        </span>
      </div>

      {notEnabled && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 flex items-start gap-3">
          <BellOff className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              AI surveys aren&apos;t on for this trip
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Turn them on in the Overview tab to email travelers a tailored
              survey once the trip ends. You&apos;ll still see any responses
              that have already come in below.
            </p>
            <Button asChild size="sm" className="mt-3 h-8 text-xs">
              <Link href={`/partner/trips/${id}`}>Enable AI surveys</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Mail className="h-3 w-3" />
            Responses
          </p>
          <p className="text-2xl font-bold mt-1">{responses.length}</p>
          <p className="text-[11px] text-muted-foreground">
            of {invitedCount} invited ({Math.round(responseRate)}%)
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Star className="h-3 w-3" />
            Overall
          </p>
          <p className="text-2xl font-bold mt-1">
            {summary.overallAvg ? summary.overallAvg.toFixed(1) : "—"}
          </p>
          <p className="text-[11px] text-muted-foreground">out of 5</p>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Star className="h-3 w-3" />
            Host rating
          </p>
          <p className="text-2xl font-bold mt-1">
            {summary.hostAvg ? summary.hostAvg.toFixed(1) : "—"}
          </p>
          <p className="text-[11px] text-muted-foreground">out of 5</p>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <ThumbsUp className="h-3 w-3" />
            Would recommend
          </p>
          <p className="text-2xl font-bold mt-1 text-emerald-700">
            {summary.recommendPercent
              ? `${Math.round(summary.recommendPercent)}%`
              : "—"}
          </p>
          <p className="text-[11px] text-muted-foreground">
            say yes to a friend
          </p>
        </div>
      </div>

      {/* AI summary */}
      {responses.length > 0 && (
        <div className="mb-6 rounded-2xl border bg-gradient-to-br from-primary/5 via-white to-violet-500/5 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-violet-500/15 shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold">AI summary</h2>
                <Badge variant="secondary" className="text-[10px]">
                  {responses.length} response{responses.length === 1 ? "" : "s"}
                </Badge>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                {summary.paragraph}
              </p>

              {/* Sentiment bar */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                  Sentiment
                </p>
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="bg-emerald-500"
                    style={{ width: `${summary.sentiment.positive}%` }}
                  />
                  <div
                    className="bg-amber-400"
                    style={{ width: `${summary.sentiment.neutral}%` }}
                  />
                  <div
                    className="bg-red-400"
                    style={{ width: `${summary.sentiment.negative}%` }}
                  />
                </div>
                <div className="mt-1 flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {summary.sentiment.positive}% positive
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    {summary.sentiment.neutral}% neutral
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    {summary.sentiment.negative}% negative
                  </span>
                </div>
              </div>

              {summary.topHighlights.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    What travelers loved
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {summary.topHighlights.map((h) => (
                      <Badge
                        key={h.label}
                        className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1"
                      >
                        {h.label}
                        <span className="text-[10px] opacity-70">
                          ·{" "}
                          {h.count}/{responses.length}
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {summary.improvements.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <MessageSquareQuote className="h-3 w-3" />
                    Things to tweak
                  </p>
                  <ul className="space-y-1.5">
                    {summary.improvements.map((s, i) => (
                      <li
                        key={i}
                        className="rounded-lg border bg-white px-3 py-2 text-xs text-foreground/85 italic"
                      >
                        &ldquo;{s}&rdquo;
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Individual responses */}
      <div>
        <h2 className="text-lg font-bold mb-3">Individual responses</h2>
        {responses.length === 0 ? (
          <div className="rounded-2xl border bg-white p-8 text-center text-sm text-muted-foreground">
            No responses yet. Once this trip ends and the AI emails the survey,
            answers will appear here.
          </div>
        ) : (
          <div className="space-y-3">
            {responses.map((r) => {
              const expanded = expandedId === r.id;
              const overall = r.answers.find((a) => a.questionId === "q-overall");
              return (
                <div
                  key={r.id}
                  className="rounded-2xl border bg-white p-4"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : r.id)}
                    className="flex w-full items-center justify-between gap-3 text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                        {r.travelerName
                          .split(" ")
                          .map((s) => s[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">
                          {r.travelerName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Submitted{" "}
                          {new Date(r.submittedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {typeof overall?.value === "number" && (
                        <StarsDisplay value={overall.value} />
                      )}
                      {expanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {expanded && survey && (
                    <div className="mt-4 space-y-3 pl-12">
                      {survey.questions.map((q) => (
                        <div key={q.id} className="text-sm">
                          <p className="text-xs font-semibold text-muted-foreground">
                            {q.prompt}
                          </p>
                          <div className="mt-1">
                            {answerDisplay(r, q.id, survey)}
                          </div>
                          <Separator className="mt-3" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
