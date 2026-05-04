"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Star, X, ChevronDown } from "lucide-react";
import { summarizeReviews, type Review } from "@/data/reviews";
import { Stars } from "@/components/shared/stars";

interface Props {
  open: boolean;
  onClose: () => void;
  tripTitle: string;
  reviews: Review[];
}

type SortMode = "recent" | "highest" | "lowest";

export function AllReviewsDialog({ open, onClose, tripTitle, reviews }: Props) {
  const [sort, setSort] = useState<SortMode>("recent");

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const summary = useMemo(() => summarizeReviews(reviews), [reviews]);
  const sorted = useMemo(() => {
    const arr = [...reviews];
    if (sort === "highest") arr.sort((a, b) => b.rating - a.rating);
    else if (sort === "lowest") arr.sort((a, b) => a.rating - b.rating);
    else
      arr.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    return arr;
  }, [reviews, sort]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm animate-[fade-in_200ms_ease-out]"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl pointer-events-auto animate-[pop-in_300ms_cubic-bezier(0.16,1,0.3,1)] flex flex-col max-h-[88vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b p-5">
            <div>
              <h2 className="font-bold">All reviews · {tripTitle}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {summary.total} traveler review
                {summary.total === 1 ? "" : "s"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Summary card */}
          {summary.total > 0 && (
            <div className="border-b p-5 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-5">
              <div className="text-center sm:text-left">
                <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                  <span className="text-4xl font-extrabold leading-none">
                    {summary.avg.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">/ 5</span>
                </div>
                <div className="mt-1 flex justify-center sm:justify-start">
                  <Stars value={summary.avg} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {summary.total} review{summary.total === 1 ? "" : "s"}
                </p>
              </div>
              <div className="space-y-1">
                {summary.distribution.map(({ stars, count }) => {
                  const pct =
                    summary.total > 0 ? (count / summary.total) * 100 : 0;
                  return (
                    <div
                      key={stars}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span className="w-6 shrink-0 flex items-center gap-0.5 font-medium">
                        {stars}
                        <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                      </span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-amber-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 shrink-0 text-right text-muted-foreground">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sort */}
          <div className="border-b px-5 py-2.5 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {sorted.length} review{sorted.length === 1 ? "" : "s"}
            </p>
            <label className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">Sort:</span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortMode)}
                  className="appearance-none rounded-md border bg-white pl-2 pr-7 py-1 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="recent">Most recent</option>
                  <option value="highest">Highest rated</option>
                  <option value="lowest">Lowest rated</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3" />
              </div>
            </label>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {sorted.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No reviews yet — be the first.
              </p>
            ) : (
              sorted.map((r) => (
                <article key={r.id} className="rounded-xl border p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full shrink-0">
                      <Image
                        src={r.traveler.avatar}
                        alt={r.traveler.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-semibold text-sm">
                          {r.traveler.name}
                        </p>
                        <Stars value={r.rating} />
                      </div>
                      {r.traveler.location && (
                        <p className="text-[11px] text-muted-foreground">
                          {r.traveler.location}
                        </p>
                      )}
                      <p className="mt-1 text-[10px] text-muted-foreground/80">
                        {new Date(r.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 font-bold text-sm">{r.title}</p>
                  <p className="mt-1 text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
                    {r.body}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

