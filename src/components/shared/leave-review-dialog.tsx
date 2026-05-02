"use client";

import { useEffect, useState } from "react";
import { Star, X, Check, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CURRENT_USER } from "@/data/conversations";
import { saveReview } from "@/data/reviews";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  tripId: string;
  tripTitle: string;
}

export function LeaveReviewDialog({
  open,
  onClose,
  tripId,
  tripTitle,
}: Props) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) {
      setRating(0);
      setHoverRating(0);
      setTitle("");
      setBody("");
      setSubmitting(false);
      setSubmitted(false);
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const canSubmit =
    rating >= 1 &&
    title.trim().length >= 3 &&
    body.trim().length >= 10 &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    saveReview({
      tripId,
      traveler: {
        id: CURRENT_USER.id,
        name: CURRENT_USER.name,
        avatar: CURRENT_USER.avatar,
      },
      rating,
      title: title.trim(),
      body: body.trim(),
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitting(false);
      onClose();
    }, 1100);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm animate-[fade-in_200ms_ease-out]"
        onClick={submitting ? undefined : onClose}
      />
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-md rounded-2xl bg-white shadow-2xl pointer-events-auto animate-[pop-in_300ms_cubic-bezier(0.16,1,0.3,1)] flex flex-col max-h-[88vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                <PenSquare className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <h2 className="font-bold">Leave a review</h2>
                <p className="text-xs text-muted-foreground">{tripTitle}</p>
              </div>
            </div>
            {!submitting && (
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {submitted ? (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <Check className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="mt-4 text-lg font-bold">Thanks for sharing!</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Your review is now live for future travelers.
              </p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
                {/* Stars */}
                <div>
                  <Label className="text-xs">Your rating</Label>
                  <div className="mt-2 flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => {
                      const filled = (hoverRating || rating) >= n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onMouseEnter={() => setHoverRating(n)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(n)}
                          className="p-1 transition-transform active:scale-95"
                          aria-label={`Rate ${n} star${n === 1 ? "" : "s"}`}
                        >
                          <Star
                            className={cn(
                              "h-9 w-9 transition-colors",
                              filled
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            )}
                          />
                        </button>
                      );
                    })}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {rating > 0
                        ? `${rating} of 5`
                        : "Tap a star to rate"}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="rv-title" className="text-xs">
                    Title
                  </Label>
                  <Input
                    id="rv-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. The trip of a lifetime"
                    maxLength={80}
                  />
                </div>

                {/* Body */}
                <div className="space-y-1.5">
                  <Label htmlFor="rv-body" className="text-xs">
                    Your review
                  </Label>
                  <textarea
                    id="rv-body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="What stood out? Highs, lows, who would love this trip?"
                    rows={5}
                    maxLength={1500}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <p className="text-[10px] text-muted-foreground text-right">
                    {body.length}/1500
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t p-4 flex items-center gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 gap-1.5"
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                >
                  {submitting ? (
                    "Posting…"
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Post review
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
