"use client";

import { useState } from "react";
import { Plus, X, MapPinned } from "lucide-react";
import { BottomTabs } from "@/components/mobile/bottom-tabs";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { NeighborhoodMap } from "@/components/mobile/neighborhood-map";
import { ActivityDetailSheet } from "@/components/mobile/activity-detail-sheet";
import { CreateActivitySheet } from "@/components/mobile/create-activity-sheet";
import { useActivities } from "@/hooks/use-activities";
import { cn } from "@/lib/utils";

export default function MobileMapPage() {
  const { activities } = useActivities();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [placingMode, setPlacingMode] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<{ x: number; y: number } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const selected = activities.find((a) => a.id === selectedId) || null;

  const handleSelectPin = (a: { id: string }) => {
    if (placingMode) return;
    setSelectedId(a.id);
    setDetailOpen(true);
  };

  const handlePlacePin = (coords: { x: number; y: number }) => {
    setPendingCoords(coords);
    setCreateOpen(true);
  };

  const handleCreateClose = () => {
    setCreateOpen(false);
    setPlacingMode(false);
    setPendingCoords(null);
  };

  const handleCreated = () => {
    handleCreateClose();
  };

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-white">
      <MobileHeader
        title="Map"
        action={
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPinned className="h-3.5 w-3.5" />
            {activities.length} nearby
          </div>
        }
      />

      {/* Map viewport */}
      <div className="relative flex-1 overflow-hidden">
        <NeighborhoodMap
          activities={activities}
          selectedId={selectedId}
          onSelectPin={handleSelectPin}
          placingMode={placingMode}
          onPlacePin={handlePlacePin}
          pendingPin={pendingCoords}
        />

        {/* FAB */}
        <button
          type="button"
          onClick={() => {
            if (placingMode) {
              setPlacingMode(false);
              setPendingCoords(null);
            } else {
              setPlacingMode(true);
              setPendingCoords(null);
              setDetailOpen(false);
              setSelectedId(null);
            }
          }}
          className={cn(
            "absolute bottom-5 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all",
            placingMode
              ? "bg-white text-foreground ring-2 ring-primary"
              : "bg-primary text-white hover:bg-primary/90"
          )}
          aria-label={placingMode ? "Cancel drop" : "Drop an activity pin"}
        >
          {placingMode ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </button>
      </div>

      <BottomTabs />

      <ActivityDetailSheet
        activity={selected}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />

      <CreateActivitySheet
        open={createOpen}
        onClose={handleCreateClose}
        coords={pendingCoords}
        onCreated={handleCreated}
      />
    </div>
  );
}
