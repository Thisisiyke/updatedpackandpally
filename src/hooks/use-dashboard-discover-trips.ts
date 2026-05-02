"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Trip } from "@/types";

const FILTER_STORAGE_KEY = "pp_dashboard_trip_filters";

function readStoredTripTypes(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(FILTER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function persistTripTypes(types: string[]) {
  try {
    sessionStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(types));
  } catch {
    /* ignore */
  }
}

type GeoState = "idle" | "loading" | "ok" | "denied" | "error";

/**
 * Wanderly Home: GET get-alltrips (+ optional tripType[]) and GET moreTrips(country) after geocode.
 */
export function useDashboardDiscoverTrips(enabled: boolean) {
  const [selectedTripTypes, setSelectedTripTypes] = useState<string[]>(() =>
    readStoredTripTypes()
  );
  const [countryName, setCountryName] = useState<string | null>(null);
  const [geoState, setGeoState] = useState<GeoState>("idle");
  const [generalTrips, setGeneralTrips] = useState<Trip[]>([]);
  const [nearTrips, setNearTrips] = useState<Trip[]>([]);
  const [loadingGeneral, setLoadingGeneral] = useState(true);
  const [loadingNear, setLoadingNear] = useState(false);

  const otherTrips = useMemo(() => {
    const ids = new Set(nearTrips.map((t) => t.id));
    return generalTrips.filter((t) => !ids.has(t.id));
  }, [generalTrips, nearTrips]);

  const toggleTripType = useCallback((label: string) => {
    setSelectedTripTypes((prev) => {
      const next = prev.includes(label)
        ? prev.filter((x) => x !== label)
        : [...prev, label];
      persistTripTypes(next);
      return next;
    });
  }, []);

  const clearTripTypes = useCallback(() => {
    setSelectedTripTypes([]);
    persistTripTypes([]);
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (!navigator.geolocation) {
      setGeoState("error");
      return;
    }
    setGeoState("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const r = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          if (!r.ok) throw new Error("geocode failed");
          const j = (await r.json()) as { countryName?: string };
          const c = j.countryName?.trim() || null;
          setCountryName(c);
          setGeoState("ok");
        } catch {
          setGeoState("error");
        }
      },
      () => setGeoState("denied"),
      { maximumAge: 600_000, timeout: 12_000, enableHighAccuracy: false }
    );
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      setLoadingGeneral(true);
      try {
        const params = new URLSearchParams({ limit: "24" });
        selectedTripTypes.forEach((t) => params.append("tripType", t));
        const r = await fetch(`/api/trips?${params.toString()}`);
        const d = await r.json();
        const general = Array.isArray(d.trips) ? (d.trips as Trip[]) : [];
        if (!cancelled) setGeneralTrips(general);
      } finally {
        if (!cancelled) setLoadingGeneral(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, selectedTripTypes]);

  useEffect(() => {
    if (!enabled || !countryName) {
      setNearTrips([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingNear(true);
      try {
        const r2 = await fetch(
          `/api/trips/more?country=${encodeURIComponent(countryName)}`,
          { credentials: "include" }
        );
        if (!r2.ok) {
          if (!cancelled) setNearTrips([]);
          return;
        }
        const d2 = await r2.json();
        const near = Array.isArray(d2.trips) ? (d2.trips as Trip[]) : [];
        if (!cancelled) setNearTrips(near);
      } finally {
        if (!cancelled) setLoadingNear(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, countryName]);

  const loading = loadingGeneral || (Boolean(countryName) && loadingNear);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    const params = new URLSearchParams({ limit: "24" });
    selectedTripTypes.forEach((t) => params.append("tripType", t));
    const r = await fetch(`/api/trips?${params.toString()}`);
    const d = await r.json();
    setGeneralTrips(Array.isArray(d.trips) ? (d.trips as Trip[]) : []);
    if (countryName) {
      const r2 = await fetch(
        `/api/trips/more?country=${encodeURIComponent(countryName)}`,
        { credentials: "include" }
      );
      if (r2.ok) {
        const d2 = await r2.json();
        setNearTrips(Array.isArray(d2.trips) ? (d2.trips as Trip[]) : []);
      }
    }
  }, [enabled, selectedTripTypes, countryName]);

  return {
    selectedTripTypes,
    toggleTripType,
    clearTripTypes,
    countryName,
    geoState,
    nearTrips,
    otherTrips,
    loading,
    refresh,
  };
}
