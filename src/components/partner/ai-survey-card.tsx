"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Loader2,
  RefreshCw,
  Eye,
  ClipboardList,
  ArrowRight,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PartnerTrip } from "@/data/partner-trips";
import type { Host } from "@/types";
import {
  generateTripSurveyQuestionsAsync,
  SURVEY_GENERATION_STATUSES,
} from "@/lib/ai/trip-survey-generator";
import {
  getSurveyForTrip,
  getResponsesForTrip,
  saveSurvey,
  setSurveyEnabled,
  subscribeToSurveys,
  type Survey,
} from "@/data/surveys";
import { CURRENT_PARTNER_HOST_ID } from "@/lib/host-terms";
import { cn } from "@/lib/utils";

interface Props {
  trip: Pick<
    PartnerTrip,
    | "id"
    | "destination"
    | "country"
    | "highlights"
    | "difficulty"
    | "category"
    | "currentBookings"
  >;
  host?: Pick<Host, "name">;
  onPreview?: () => void;
}

export function AiSurveyCard({ trip, host, onPreview }: Props) {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responseCount, setResponseCount] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);

  const refresh = () => {
    const s = getSurveyForTrip(trip.id);
    setSurvey(s);
    setResponseCount(getResponsesForTrip(trip.id).length);
  };

  useEffect(() => {
    refresh();
    return subscribeToSurveys(() => refresh());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.id]);

  // Cycle status messages while generating
  useEffect(() => {
    if (!generating) return;
    const id = setInterval(() => {
      setStatusIndex((i) => (i + 1) % SURVEY_GENERATION_STATUSES.length);
    }, 700);
    return () => clearInterval(id);
  }, [generating]);

  const generate = async () => {
    setGenerating(true);
    setStatusIndex(0);
    const questions = await generateTripSurveyQuestionsAsync(trip, host);
    saveSurvey({
      tripId: trip.id,
      hostId: CURRENT_PARTNER_HOST_ID,
      enabled: survey?.enabled ?? true,
      questions,
      updatedAt: new Date().toISOString(),
    });
    setGenerating(false);
    refresh();
  };

  const handleToggle = async (checked: boolean) => {
    if (checked && !survey) {
      // First-time enable: generate too
      await generate();
      setSurveyEnabled(trip.id, true);
    } else if (survey) {
      setSurveyEnabled(trip.id, checked);
    }
    refresh();
  };

  const enabled = !!survey?.enabled;

  return (
    <div className="rounded-2xl border bg-white p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-violet-500/15 shrink-0">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                AI post-trip survey
                {enabled && (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                    On
                  </Badge>
                )}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Automatically email travelers a tailored survey 24 hours after
                this trip ends. Responses come back to you.
              </p>
            </div>
            <InlineSwitch
              checked={enabled}
              onCheckedChange={handleToggle}
              disabled={generating}
            />
          </div>

          {generating && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              {SURVEY_GENERATION_STATUSES[statusIndex]}
            </div>
          )}

          {survey && !generating && (
            <>
              <div className="mt-4 rounded-xl bg-muted/30 border p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <ClipboardList className="h-3.5 w-3.5" />
                    {survey.questions.length} questions · tailored to{" "}
                    {trip.destination}
                  </p>
                </div>
                <ol className="space-y-1.5">
                  {survey.questions.map((q, i) => (
                    <li
                      key={q.id}
                      className="flex items-start gap-2 text-xs"
                    >
                      <span className="text-muted-foreground font-mono shrink-0">
                        {i + 1}.
                      </span>
                      <span className="text-foreground/80">
                        {q.prompt}
                        {q.type === "stars" && (
                          <span className="text-muted-foreground/70">
                            {" "}
                            (★×{q.maxStars || 5})
                          </span>
                        )}
                        {q.type === "multi-select" && (
                          <span className="text-muted-foreground/70">
                            {" "}
                            (multi-select)
                          </span>
                        )}
                        {q.type === "yes-no" && (
                          <span className="text-muted-foreground/70">
                            {" "}
                            ({q.options?.join(" / ")})
                          </span>
                        )}
                        {q.type === "short-text" && (
                          <span className="text-muted-foreground/70">
                            {" "}
                            (open answer)
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generate}
                  className="gap-1.5 h-8 text-xs"
                >
                  <RefreshCw className="h-3 w-3" />
                  Regenerate with AI
                </Button>
                {onPreview && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onPreview}
                    className="gap-1.5 h-8 text-xs"
                  >
                    <Eye className="h-3 w-3" />
                    Preview as traveler
                  </Button>
                )}
              </div>

              <div
                className={cn(
                  "mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2 text-xs",
                  enabled
                    ? "bg-primary/5 border-primary/15"
                    : "bg-muted/30 text-muted-foreground"
                )}
              >
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {enabled
                    ? `Will email to ${trip.currentBookings} traveler${trip.currentBookings === 1 ? "" : "s"} · ${responseCount} response${responseCount === 1 ? "" : "s"} so far`
                    : `Off — travelers won't be emailed a survey`}
                </span>
                <Link
                  href={`/partner/trips/${trip.id}/surveys`}
                  className="flex items-center gap-1 font-semibold text-primary hover:underline"
                >
                  View results
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </>
          )}

          {!survey && !generating && (
            <div className="mt-4 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
              Turn on the toggle and we&apos;ll draft questions tailored to this
              trip. You can regenerate or preview before anything goes out.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InlineSwitch({
  checked,
  onCheckedChange,
  disabled,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted-foreground/25",
        disabled && "opacity-60 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
