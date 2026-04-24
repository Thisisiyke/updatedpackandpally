"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Star,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PartyPopper,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { trips } from "@/data/trips";
import { hosts } from "@/data/hosts";
import { CURRENT_USER } from "@/data/conversations";
import {
  getSurveyForTrip,
  saveResponse,
  getResponseForBooking,
  type SurveyAnswerValue,
  type SurveyQuestion,
  type Survey,
} from "@/data/surveys";
import { cn } from "@/lib/utils";

/**
 * Demo booking map — lets the traveler land on this page from any mobile
 * "Leave feedback" prompt. The bookingIds here match the mock data on
 * /mobile/bookings and the host-side seed bookings so everything lines up.
 */
const BOOKING_TRIPS: Record<string, string> = {
  "b1": "trip-1",
  "b4": "trip-1", // past Amalfi booking on mobile/bookings
  "PP-SEED-AM1": "trip-1",
  "PP-SEED-AM2": "trip-1",
  "PP-SEED-AM3": "trip-1",
  "PP-SEED-AM4": "trip-1",
  "PP-SEED-AM5": "trip-1",
};

function resolveTripId(bookingId: string): string | null {
  if (BOOKING_TRIPS[bookingId]) return BOOKING_TRIPS[bookingId];
  // Heuristic for real checkout bookings: check localStorage
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("packpally_bookings");
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          const b = list.find(
            (x: { bookingId?: string }) => x.bookingId === bookingId
          );
          if (b?.trip?.id) return b.trip.id;
        }
      }
    } catch {}
  }
  return null;
}

export default function MobileSurveyPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = use(params);
  const router = useRouter();

  const tripId = useMemo(() => resolveTripId(bookingId), [bookingId]);
  const trip = tripId ? trips.find((t) => t.id === tripId) : null;
  const host = trip ? hosts.find((h) => h.id === trip.hostId) : null;
  const survey = tripId ? getSurveyForTrip(tripId) : null;
  const alreadyResponded = getResponseForBooking(bookingId);

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, SurveyAnswerValue>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!trip || !survey) {
    return (
      <div className="flex flex-col h-full min-h-[844px] bg-white">
        <MobileHeader title="Survey" />
        <div className="flex-1 flex items-center justify-center p-6 text-center text-sm text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground">
              Survey unavailable
            </p>
            <p className="mt-1">
              This trip doesn&apos;t have an active post-trip survey.
            </p>
            <Button
              className="mt-4"
              onClick={() => router.push("/mobile/bookings")}
            >
              Back to trips
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (alreadyResponded && !submitted) {
    return (
      <div className="flex flex-col h-full min-h-[844px] bg-white">
        <MobileHeader title="Survey" />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="max-w-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-6 w-6 text-emerald-600" />
            </div>
            <h2 className="mt-4 text-lg font-bold">
              You&apos;ve already left feedback
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Thanks again for rating {trip.title}. Your response is with{" "}
              {host?.name || "your host"}.
            </p>
            <Button
              className="mt-6"
              onClick={() => router.push("/mobile/bookings")}
            >
              Back to trips
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col h-full min-h-[844px] bg-gradient-to-br from-emerald-50 via-white to-primary/5">
        <MobileHeader title="Thank you" />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="max-w-xs animate-[fade-in-up_400ms_ease-out]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <PartyPopper className="h-7 w-7 text-emerald-600" />
            </div>
            <h2 className="mt-5 text-xl font-bold">Thanks for sharing!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your feedback is heading straight to {host?.name || "your host"}.
              It helps them make the next trip even better.
            </p>
            <Button
              className="mt-6 w-full"
              onClick={() => router.push("/mobile/bookings")}
            >
              Back to my trips
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = survey.questions[stepIndex];
  const totalSteps = survey.questions.length;
  const progress = ((stepIndex + 1) / totalSteps) * 100;
  const canAdvance = isAnswered(currentQuestion, answers[currentQuestion.id]);
  const isLast = stepIndex === totalSteps - 1;

  const handleNext = () => {
    if (isLast) {
      submit();
    } else {
      setStepIndex((i) => Math.min(totalSteps - 1, i + 1));
    }
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      router.back();
    } else {
      setStepIndex((i) => Math.max(0, i - 1));
    }
  };

  const handleSkip = () => {
    if (!currentQuestion.required) handleNext();
  };

  const submit = () => {
    const answerList = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value,
    }));
    saveResponse({
      tripId: trip.id,
      bookingId,
      travelerName: CURRENT_USER.name,
      answers: answerList,
    });
    setSubmitted(true);
  };

  const setAnswer = (val: SurveyAnswerValue) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }));
  };

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-white">
      <MobileHeader
        title={`Question ${stepIndex + 1} of ${totalSteps}`}
        onBack={handleBack}
      />

      {/* Progress */}
      <div className="px-5 pt-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Trip context */}
      <div className="px-5 pt-4 pb-1 flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-lg shrink-0">
          <Image
            src={trip.coverImage}
            alt={trip.title}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Feedback for</p>
          <p className="text-sm font-semibold truncate">{trip.title}</p>
        </div>
        <Badge className="ml-auto bg-primary/10 text-primary border-primary/15 gap-1 text-[10px] shrink-0">
          <Sparkles className="h-3 w-3" />
          AI survey
        </Badge>
      </div>

      {/* Question body */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <h2 className="text-xl font-bold leading-tight">
          {currentQuestion.prompt}
        </h2>
        {currentQuestion.type === "short-text" && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Your words go straight to the host — be honest.
          </p>
        )}

        <div className="mt-6">
          {currentQuestion.type === "stars" && (
            <StarsInput
              max={currentQuestion.maxStars || 5}
              value={(answers[currentQuestion.id] as number) || 0}
              onChange={(v) => setAnswer(v)}
            />
          )}

          {currentQuestion.type === "multi-select" && (
            <MultiSelectInput
              options={currentQuestion.options || []}
              value={
                (answers[currentQuestion.id] as string[] | undefined) || []
              }
              onChange={(v) => setAnswer(v)}
            />
          )}

          {currentQuestion.type === "yes-no" && (
            <OptionTiles
              options={currentQuestion.options || ["Yes", "No"]}
              value={(answers[currentQuestion.id] as string) || ""}
              onChange={(v) => setAnswer(v)}
            />
          )}

          {currentQuestion.type === "short-text" && (
            <textarea
              value={(answers[currentQuestion.id] as string) || ""}
              onChange={(e) => setAnswer(e.target.value)}
              rows={5}
              maxLength={600}
              placeholder="Write as much or as little as you want…"
              className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t p-4 md:pb-8 space-y-2">
        <Button
          onClick={handleNext}
          disabled={!canAdvance}
          className="w-full h-12 gap-1.5"
          size="lg"
        >
          {isLast ? (
            <>
              <Send className="h-4 w-4" />
              Submit feedback
            </>
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
        {!currentQuestion.required && !isLast && (
          <button
            type="button"
            onClick={handleSkip}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            Skip this question
          </button>
        )}
      </div>
    </div>
  );
}

function isAnswered(question: SurveyQuestion, value: SurveyAnswerValue | undefined): boolean {
  if (value === undefined || value === null) return !question.required;
  if (question.type === "stars") {
    return typeof value === "number" && value >= 1;
  }
  if (question.type === "multi-select") {
    return Array.isArray(value) && value.length > 0;
  }
  if (question.type === "yes-no") {
    return typeof value === "string" && value.length > 0;
  }
  if (question.type === "short-text") {
    return !question.required || (typeof value === "string" && value.trim().length > 0);
  }
  return false;
}

function StarsInput({
  max,
  value,
  onChange,
}: {
  max: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: max }).map((_, i) => {
        const n = i + 1;
        const filled = n <= value;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              "p-1 rounded-full transition-transform active:scale-95",
              filled && "scale-105"
            )}
          >
            <Star
              className={cn(
                "h-10 w-10 transition-colors",
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/35"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

function MultiSelectInput({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  };
  return (
    <div className="space-y-2">
      {options.map((o) => {
        const active = value.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => toggle(o)}
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left text-sm transition-colors",
              active
                ? "border-primary bg-primary/5 ring-2 ring-primary/15"
                : "hover:border-primary/40"
            )}
          >
            <span className="text-foreground/85">{o}</span>
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full border-2 shrink-0",
                active
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30"
              )}
            >
              {active && <Check className="h-3 w-3 text-white" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function OptionTiles({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {options.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border p-3 text-left text-sm font-medium transition-colors",
              active
                ? "border-primary bg-primary/5 ring-2 ring-primary/15 text-foreground"
                : "hover:border-primary/40 text-foreground/85"
            )}
          >
            {o}
            {active && <Check className="h-4 w-4 text-primary" />}
          </button>
        );
      })}
    </div>
  );
}
