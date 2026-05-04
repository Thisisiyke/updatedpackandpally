"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star, MessageSquare, ArrowRight, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getReviewsForTrip,
  subscribeToReviews,
  summarizeReviews,
  type Review,
} from "@/data/reviews";
import { AllReviewsDialog } from "@/components/shared/all-reviews-dialog";
import { LeaveReviewDialog } from "@/components/shared/leave-review-dialog";
import { Stars } from "@/components/shared/stars";
import { cn } from "@/lib/utils";

interface Props {
  tripId: string;
  tripTitle: string;
  /** "compact" tunes typography for mobile cards. */
  variant?: "compact" | "comfortable";
}

export function ReviewSection({
  tripId,
  tripTitle,
  variant = "comfortable",
}: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allOpen, setAllOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const refresh = () => setReviews(getReviewsForTrip(tripId));

  useEffect(() => {
    refresh();
    setHydrated(true);
    return subscribeToReviews(refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const summary = summarizeReviews(reviews);
  const top = reviews.slice(0, 3);
  const compact = variant === "compact";

  return (
    <>
      <section
        className={cn("rounded-2xl border bg-white", compact ? "p-4" : "p-6")}
      >
        {/* Heading row */}
        <div
          className={cn(
            "flex gap-3",
            compact
              ? "items-start"
              : "flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
          )}
        >
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={cn(
                "flex items-center justify-center rounded-xl bg-amber-100 text-amber-700 shrink-0",
                compact ? "h-10 w-10" : "h-12 w-12"
              )}
            >
              <Star
                className={cn(
                  compact ? "h-5 w-5" : "h-6 w-6",
                  "fill-amber-400 text-amber-400"
                )}
              />
            </div>
            <div className="min-w-0">
              <h2 className={cn("font-bold", compact ? "text-base" : "text-xl")}>
                Traveler reviews
              </h2>
              {hydrated && summary.total > 0 ? (
                <div
                  className={cn(
                    "flex items-center gap-1.5 flex-wrap",
                    compact ? "text-xs mt-0.5" : "text-sm mt-1"
                  )}
                >
                  <span className="font-bold">{summary.avg.toFixed(1)}</span>
                  <Stars value={summary.avg} compact={compact} />
                  <span className="text-muted-foreground">
                    ({summary.total} review{summary.total === 1 ? "" : "s"})
                  </span>
                </div>
              ) : (
                <p
                  className={cn(
                    "text-muted-foreground",
                    compact ? "text-xs" : "text-sm"
                  )}
                >
                  Be the first to share your experience.
                </p>
              )}
            </div>
          </div>

          {/* Desktop / comfortable buttons — beside the heading */}
          {!compact && (
            <div className="flex items-center gap-2 shrink-0">
              {summary.total > 0 && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setAllOpen(true)}
                  className="gap-1.5"
                >
                  <MessageSquare className="h-4 w-4" />
                  See all
                  <span className="text-muted-foreground font-normal">
                    ({summary.total})
                  </span>
                </Button>
              )}
              <Button
                size="default"
                onClick={() => setLeaveOpen(true)}
                className="gap-1.5"
              >
                <PenSquare className="h-4 w-4" />
                Leave a review
              </Button>
            </div>
          )}
        </div>

        {/* Mobile / compact action row — sits directly below the heading */}
        {compact && (
          <div className="mt-4 space-y-2">
            <Button
              onClick={() => setLeaveOpen(true)}
              className="w-full h-11 gap-1.5"
              size="lg"
            >
              <PenSquare className="h-4 w-4" />
              Leave a review
            </Button>
            {summary.total > 0 && (
              <Button
                variant="outline"
                onClick={() => setAllOpen(true)}
                className="w-full h-10 gap-1.5"
                size="sm"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                See all {summary.total} reviews
              </Button>
            )}
          </div>
        )}

        {top.length > 0 && (
          <div
            className={cn(
              "mt-5 grid gap-3",
              compact ? "grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-3"
            )}
          >
            {top.map((r) => (
              <ReviewCard key={r.id} review={r} compact={compact} />
            ))}
          </div>
        )}

        {summary.total > 3 && (
          <button
            type="button"
            onClick={() => setAllOpen(true)}
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            See all {summary.total} reviews
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </section>

      <AllReviewsDialog
        open={allOpen}
        onClose={() => setAllOpen(false)}
        tripTitle={tripTitle}
        reviews={reviews}
      />

      <LeaveReviewDialog
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        tripId={tripId}
        tripTitle={tripTitle}
      />
    </>
  );
}

function ReviewCard({
  review,
  compact,
}: {
  review: Review;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-muted/20",
        compact ? "p-3" : "p-4"
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "relative overflow-hidden rounded-full shrink-0",
            compact ? "h-8 w-8" : "h-10 w-10"
          )}
        >
          <Image
            src={review.traveler.avatar}
            alt={review.traveler.name}
            fill
            sizes={compact ? "32px" : "40px"}
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-semibold truncate",
              compact ? "text-xs" : "text-sm"
            )}
          >
            {review.traveler.name}
          </p>
          {review.traveler.location && (
            <p className="text-[10px] text-muted-foreground truncate">
              {review.traveler.location}
            </p>
          )}
        </div>
        <Stars value={review.rating} compact={compact} />
      </div>
      <p
        className={cn(
          "mt-2 font-bold leading-tight",
          compact ? "text-xs" : "text-sm"
        )}
      >
        {review.title}
      </p>
      <p
        className={cn(
          "mt-1 text-muted-foreground leading-relaxed line-clamp-3",
          compact ? "text-[11px]" : "text-xs"
        )}
      >
        {review.body}
      </p>
      <p className="mt-2 text-[10px] text-muted-foreground/80">
        {new Date(review.createdAt).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })}
      </p>
    </div>
  );
}
