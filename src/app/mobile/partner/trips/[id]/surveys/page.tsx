"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
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
import { MobileHeader } from "@/components/mobile/mobile-header";
import { PartnerTripTabs } from "@/components/mobile/partner-trip-tabs";
import { partnerTrips } from "@/data/partner-trips";
import { getUserPartnerTrips } from "@/lib/user-partner-trips";
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
            "h-3 w-3",
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
  if (!answer) return <span className="text-muted-foreground italic text-xs">Skipped</span>;

  if (question?.type === "stars" && typeof answer.value === "number") {
    return <StarsDisplay value={answer.value} max={question.maxStars || 5} />;
  }
  if (Array.isArray(answer.value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {answer.value.map((v) => (
          <Badge key={v} variant="secondary" className="text-[9px]">
            {v}
          </Badge>
        ))}
      </div>
    );
  }
  return (
    <span className="text-xs whitespace-pre-wrap">{String(answer.value)}</span>
  );
}

export default function MobilePartnerSurveysPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const trip = useMemo(() => {
    const userTrips = getUserPartnerTrips();
    return (
      userTrips.find((t) => t.id === id) ||
      partnerTrips.find((t) => t.id === id) ||
      null
    );
  }, [id]);

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
      <div className="flex flex-col h-full min-h-[844px] bg-white">
        <MobileHeader title="Surveys" />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div>
            <p className="font-semibold">Trip not found</p>
            <Button
              className="mt-4"
              onClick={() => router.push("/mobile/partner")}
            >
              Back to dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const notEnabled = !survey || !survey.enabled;

  return (
    <div className="relative flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader
        title="Surveys"
        onBack={() => router.push(`/mobile/partner/trips/${id}`)}
      />
      <PartnerTripTabs tripId={id} />

      <div className="flex-1 overflow-y-auto pb-4">
        {notEnabled && (
          <div className="m-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-3 flex items-start gap-2">
            <BellOff className="h-3.5 w-3.5 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold">
                AI surveys aren&apos;t on for this trip
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Enable it on the Overview tab to email travelers a tailored
                survey once the trip ends.
              </p>
              <Button
                asChild
                size="sm"
                className="mt-2 h-7 text-[11px]"
              >
                <Link href={`/mobile/partner/trips/${id}`}>
                  Enable AI surveys
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 px-4 mt-4">
          <Stat
            icon={<Mail className="h-3 w-3 text-primary" />}
            label="Responses"
            value={String(responses.length)}
            sub={`of ${invitedCount} (${Math.round(responseRate)}%)`}
          />
          <Stat
            icon={<Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
            label="Overall"
            value={summary.overallAvg ? summary.overallAvg.toFixed(1) : "—"}
            sub="out of 5"
          />
          <Stat
            icon={<Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
            label="Host rating"
            value={summary.hostAvg ? summary.hostAvg.toFixed(1) : "—"}
            sub="out of 5"
          />
          <Stat
            icon={<ThumbsUp className="h-3 w-3 text-emerald-700" />}
            label="Recommend"
            valueClass="text-emerald-700"
            value={
              summary.recommendPercent
                ? `${Math.round(summary.recommendPercent)}%`
                : "—"
            }
            sub="say yes"
          />
        </div>

        {/* AI summary */}
        {responses.length > 0 && (
          <div className="mx-4 mt-4 rounded-2xl border bg-gradient-to-br from-primary/5 via-white to-violet-500/5 p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-violet-500/15">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold">AI summary</p>
                <p className="text-[10px] text-muted-foreground">
                  {responses.length} response
                  {responses.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-foreground/85">
              {summary.paragraph}
            </p>

            {/* Sentiment bar */}
            <div className="mt-4">
              <p className="text-[10px] font-semibold text-muted-foreground mb-1">
                Sentiment
              </p>
              <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
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
              <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {summary.sentiment.positive}%
                </span>
                <span className="flex items-center gap-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  {summary.sentiment.neutral}%
                </span>
                <span className="flex items-center gap-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  {summary.sentiment.negative}%
                </span>
              </div>
            </div>

            {summary.topHighlights.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">
                  What travelers loved
                </p>
                <div className="flex flex-wrap gap-1">
                  {summary.topHighlights.map((h) => (
                    <Badge
                      key={h.label}
                      className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[9px]"
                    >
                      {h.label} · {h.count}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {summary.improvements.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                  <MessageSquareQuote className="h-2.5 w-2.5" />
                  Things to tweak
                </p>
                <ul className="space-y-1.5">
                  {summary.improvements.map((s, i) => (
                    <li
                      key={i}
                      className="rounded-lg border bg-white px-3 py-1.5 text-[11px] text-foreground/85 italic"
                    >
                      &ldquo;{s}&rdquo;
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Individual responses */}
        <div className="px-4 mt-5">
          <h2 className="text-sm font-bold mb-2">Individual responses</h2>
          {responses.length === 0 ? (
            <div className="rounded-2xl border bg-white p-6 text-center text-xs text-muted-foreground">
              No responses yet.
            </div>
          ) : (
            <div className="space-y-2">
              {responses.map((r) => {
                const expanded = expandedId === r.id;
                const overall = r.answers.find((a) => a.questionId === "q-overall");
                return (
                  <div key={r.id} className="rounded-2xl border bg-white p-3">
                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : r.id)}
                      className="flex w-full items-center justify-between gap-3 text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary shrink-0">
                          {r.travelerName
                            .split(" ")
                            .map((s) => s[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {r.travelerName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(r.submittedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {typeof overall?.value === "number" && (
                          <StarsDisplay value={overall.value} />
                        )}
                        {expanded ? (
                          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {expanded && survey && (
                      <div className="mt-3 space-y-2 pl-10">
                        {survey.questions.map((q) => (
                          <div key={q.id}>
                            <p className="text-[10px] font-semibold text-muted-foreground">
                              {q.prompt}
                            </p>
                            <div className="mt-0.5">
                              {answerDisplay(r, q.id, survey)}
                            </div>
                            <Separator className="mt-2" />
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
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-2.5">
      <div className="flex items-center gap-1">
        {icon}
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
          {label}
        </p>
      </div>
      <p className={cn("mt-0.5 text-base font-bold leading-tight", valueClass)}>
        {value}
      </p>
      {sub && <p className="text-[9px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
