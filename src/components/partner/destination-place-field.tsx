"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ResolvedPlace } from "@/lib/resolved-place";

type Prediction = { placeId: string; description: string };

type Props = {
  destination: string;
  onDestinationChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onPlaceResolved: (place: ResolvedPlace) => void;
  /** Called when the user types (not picking a suggestion) so lat/lng can be cleared. */
  onManualEdit?: () => void;
  disabled?: boolean;
  className?: string;
};

export function DestinationPlaceField({
  destination,
  onDestinationChange,
  onCountryChange,
  onPlaceResolved,
  onManualEdit,
  disabled,
  className,
}: Props) {
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingPick, setLoadingPick] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchPredictions = useCallback(async (input: string) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoadingList(true);
    try {
      const res = await fetch(
        `/api/places/autocomplete?input=${encodeURIComponent(input)}`,
        { signal: ac.signal }
      );
      const data = (await res.json()) as {
        predictions?: Prediction[];
        error?: string;
      };
      if (!res.ok) {
        setPredictions([]);
        return;
      }
      setPredictions(Array.isArray(data.predictions) ? data.predictions : []);
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setPredictions([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setHighlight(-1);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const onInputChange = (value: string) => {
    onDestinationChange(value);
    onManualEdit?.();
    setHighlight(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setPredictions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      void fetchPredictions(value.trim());
      setOpen(true);
    }, 280);
  };

  const pickPlace = async (placeId: string) => {
    setLoadingPick(true);
    setOpen(false);
    setPredictions([]);
    try {
      const res = await fetch(
        `/api/places/details?placeId=${encodeURIComponent(placeId)}`
      );
      const data = (await res.json()) as { place?: ResolvedPlace; error?: string };
      if (!res.ok || !data.place) {
        console.warn(data.error || "Place details failed");
        return;
      }
      const p = data.place;
      onDestinationChange(p.formattedAddress || p.city || destination);
      if (p.country) onCountryChange(p.country);
      onPlaceResolved(p);
    } finally {
      setLoadingPick(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || predictions.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % predictions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h <= 0 ? predictions.length - 1 : h - 1));
    } else if (e.key === "Enter" && highlight >= 0) {
      e.preventDefault();
      void pickPlace(predictions[highlight].placeId);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className={cn("space-y-2", className)}>
      <Label htmlFor={`dest-${listId}`}>Destination</Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          id={`dest-${listId}`}
          value={destination}
          onChange={(e) => onInputChange(e.target.value)}
          onFocus={() => {
            if (predictions.length > 0) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search for a city, region, or place"
          disabled={disabled}
          autoComplete="off"
          className="pl-9"
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-autocomplete="list"
        />
        {loadingPick ? (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
        {open && predictions.length > 0 ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md"
          >
            {predictions.map((p, i) => (
              <li key={p.placeId} role="option" aria-selected={i === highlight}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm hover:bg-accent",
                    i === highlight && "bg-accent"
                  )}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => void pickPlace(p.placeId)}
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span>{p.description}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {loadingList && destination.trim().length >= 2 ? (
          <p className="mt-1 text-xs text-muted-foreground">Searching places…</p>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        Pick a suggestion to save map coordinates and country automatically. You
        can still edit the country field.
      </p>
    </div>
  );
}
