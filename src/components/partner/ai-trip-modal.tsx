"use client";

import { useState } from "react";
import { Sparkles, X, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  generatePartnerTrip,
  type GeneratedPartnerTrip,
} from "@/lib/ai/partner-trip-generator";
import { tripCategories } from "@/data/partner-trips";
import { cn } from "@/lib/utils";

type Status = "idle" | "generating" | "done";

const LOADING_MESSAGES = [
  "Analyzing destination...",
  "Curating the best activities...",
  "Building your itinerary...",
  "Crafting your trip description...",
  "Finalizing pricing suggestions...",
];

export function AiTripModal({
  open,
  onClose,
  onGenerated,
}: {
  open: boolean;
  onClose: () => void;
  onGenerated: (
    result: GeneratedPartnerTrip,
    inputs: {
      destination: string;
      country: string;
      durationDays: number;
      difficulty: "Easy" | "Moderate" | "Challenging";
      categories: string[];
      maxGroupSize: number;
    }
  ) => void;
}) {
  const [destination, setDestination] = useState("");
  const [country, setCountry] = useState("");
  const [durationDays, setDurationDays] = useState(7);
  const [difficulty, setDifficulty] =
    useState<"Easy" | "Moderate" | "Challenging">("Easy");
  const [categories, setCategories] = useState<string[]>([]);
  const [maxGroupSize, setMaxGroupSize] = useState(12);
  const [status, setStatus] = useState<Status>("idle");
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);

  if (!open) return null;

  const canGenerate =
    destination.trim() && country.trim() && categories.length > 0;

  const toggleCategory = (c: string) =>
    setCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );

  const handleGenerate = async () => {
    setStatus("generating");
    let i = 0;
    const interval = setInterval(() => {
      setLoadingMsg(LOADING_MESSAGES[i % LOADING_MESSAGES.length]);
      i++;
    }, 700);

    const result = await generatePartnerTrip({
      destination,
      country,
      durationDays,
      difficulty,
      categories,
      maxGroupSize,
    });

    clearInterval(interval);
    setStatus("done");
    onGenerated(result, {
      destination,
      country,
      durationDays,
      difficulty,
      categories,
      maxGroupSize,
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm animate-[fade-in_200ms_ease-out]"
        onClick={status === "idle" ? onClose : undefined}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-[pop-in_300ms_cubic-bezier(0.16,1,0.3,1)] pointer-events-auto overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Generating state */}
          {status === "generating" ? (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-primary mb-5">
                <Sparkles className="h-7 w-7 text-white animate-pulse" />
              </div>
              <h2 className="text-lg font-bold">Crafting your trip...</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {loadingMsg}
              </p>
              <div className="mt-6 mx-auto h-1.5 w-48 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-violet-500 to-primary animate-[marquee_1.4s_linear_infinite]" />
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 border-b p-5 bg-gradient-to-br from-violet-50 via-primary/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-primary">
                    <Wand2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold">Create with AI</h2>
                    <p className="text-xs text-muted-foreground">
                      Give us a few details — we&apos;ll draft the whole trip
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form */}
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Destination</Label>
                    <Input
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g., Amalfi Coast"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Country</Label>
                    <Input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g., Italy"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Duration</Label>
                    <Select
                      value={String(durationDays)}
                      onValueChange={(v) => v && setDurationDays(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[3, 5, 7, 9, 10, 12, 14].map((d) => (
                          <SelectItem key={d} value={String(d)}>
                            {d} days
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Group size</Label>
                    <Select
                      value={String(maxGroupSize)}
                      onValueChange={(v) => v && setMaxGroupSize(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[6, 8, 10, 12, 14, 16].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n} max
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Difficulty</Label>
                    <Select
                      value={difficulty}
                      onValueChange={(v) => v && setDifficulty(v as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                        <SelectItem value="Challenging">Challenging</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs mb-2 block">
                    Trip categories (pick 1+)
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {tripCategories.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCategory(c)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                          categories.includes(c)
                            ? "border-primary bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted/50"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-violet-50 border border-violet-200 p-3 text-xs text-violet-900">
                  <p className="font-semibold mb-0.5 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    What AI will generate
                  </p>
                  <p className="text-violet-800 text-[11px] leading-relaxed">
                    A catchy title, trip description, key highlights, a
                    day-by-day itinerary, what&apos;s included / not included,
                    and a suggested price. You can edit everything after.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 border-t p-4">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  className="gap-2"
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                >
                  <Sparkles className="h-4 w-4" />
                  Generate trip
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
