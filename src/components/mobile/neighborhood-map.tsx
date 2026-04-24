"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";
import type { Activity } from "@/data/activities";
import { cn } from "@/lib/utils";

interface Props {
  activities: Activity[];
  selectedId?: string | null;
  onSelectPin?: (activity: Activity) => void;
  placingMode?: boolean;
  onPlacePin?: (coords: { x: number; y: number }) => void;
  pendingPin?: { x: number; y: number } | null;
}

export function NeighborhoodMap({
  activities,
  selectedId,
  onSelectPin,
  placingMode,
  onPlacePin,
  pendingPin,
}: Props) {
  const handleMapClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!placingMode || !onPlacePin) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onPlacePin({
      x: Math.max(4, Math.min(96, x)),
      y: Math.max(6, Math.min(94, y)),
    });
  };

  return (
    <div
      onClick={handleMapClick}
      className={cn(
        "relative h-full w-full overflow-hidden",
        placingMode && "cursor-crosshair"
      )}
    >
      {/* Base canvas */}
      <div className="absolute inset-0 bg-[#f1ece0]" />

      {/* Stylized SVG neighborhood */}
      <svg
        viewBox="0 0 400 600"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {/* Water (ocean along the left + bottom-left) */}
        <path
          d="M 0 340 Q 60 330 90 360 T 140 420 Q 120 480 80 520 T 0 600 L 0 340 Z"
          fill="#cfe4f0"
          opacity="0.85"
        />
        <path
          d="M 0 0 L 0 180 Q 40 170 70 150 T 100 90 Q 60 50 0 40 Z"
          fill="#cfe4f0"
          opacity="0.8"
        />

        {/* Parks (soft green blobs) */}
        <ellipse cx="175" cy="312" rx="44" ry="28" fill="#c9dfbf" opacity="0.9" />
        <ellipse cx="60" cy="120" rx="26" ry="18" fill="#c9dfbf" opacity="0.85" />
        <ellipse cx="320" cy="430" rx="36" ry="24" fill="#c9dfbf" opacity="0.9" />

        {/* Street grid — soft warm lines */}
        <g stroke="#e3d9c4" strokeWidth="6" opacity="0.7">
          <line x1="0" y1="90" x2="400" y2="80" />
          <line x1="0" y1="180" x2="400" y2="170" />
          <line x1="0" y1="260" x2="400" y2="250" />
          <line x1="0" y1="360" x2="400" y2="370" />
          <line x1="0" y1="470" x2="400" y2="460" />
        </g>
        <g stroke="#e3d9c4" strokeWidth="5" opacity="0.7">
          <line x1="70" y1="0" x2="60" y2="600" />
          <line x1="160" y1="0" x2="170" y2="600" />
          <line x1="250" y1="0" x2="245" y2="600" />
          <line x1="340" y1="0" x2="345" y2="600" />
        </g>

        {/* Diagonal accent road */}
        <line
          x1="30"
          y1="560"
          x2="380"
          y2="80"
          stroke="#ead9b8"
          strokeWidth="7"
          opacity="0.55"
        />

        {/* Subtle block shading */}
        <g fill="#ece2cc" opacity="0.55">
          <rect x="80" y="200" width="70" height="50" rx="4" />
          <rect x="180" y="210" width="60" height="60" rx="4" />
          <rect x="260" y="200" width="60" height="40" rx="4" />
          <rect x="80" y="280" width="60" height="60" rx="4" />
          <rect x="260" y="290" width="70" height="55" rx="4" />
          <rect x="80" y="380" width="70" height="50" rx="4" />
          <rect x="180" y="400" width="60" height="50" rx="4" />
          <rect x="260" y="380" width="70" height="70" rx="4" />
          <rect x="180" y="500" width="60" height="50" rx="4" />
          <rect x="260" y="490" width="60" height="60" rx="4" />
        </g>

        {/* Labels */}
        <g fill="#8f7d5a" fontSize="10" fontFamily="ui-sans-serif, system-ui">
          <text x="165" y="318" textAnchor="middle" opacity="0.7">
            Park
          </text>
          <text x="320" y="436" textAnchor="middle" opacity="0.7">
            Park
          </text>
          <text
            x="30"
            y="440"
            transform="rotate(-65 30 440)"
            opacity="0.6"
            fontSize="9"
          >
            Bay
          </text>
        </g>
      </svg>

      {/* Placing-mode overlay hint */}
      {placingMode && !pendingPin && (
        <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex justify-center">
          <div className="rounded-full bg-primary text-white text-xs font-semibold px-4 py-2 shadow-lg animate-pulse">
            Tap anywhere to drop your pin
          </div>
        </div>
      )}

      {/* Activity pins */}
      {activities.map((a) => (
        <PinMarker
          key={a.id}
          activity={a}
          selected={selectedId === a.id}
          onClick={() => onSelectPin?.(a)}
          dim={placingMode}
        />
      ))}

      {/* Pending new-pin preview */}
      {pendingPin && (
        <div
          className="absolute z-30 -translate-x-1/2 -translate-y-full"
          style={{ left: `${pendingPin.x}%`, top: `${pendingPin.y}%` }}
        >
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg ring-4 ring-primary/20">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="mt-0.5 h-2 w-2 rotate-45 bg-primary" />
          </div>
        </div>
      )}
    </div>
  );
}

function PinMarker({
  activity,
  selected,
  onClick,
  dim,
}: {
  activity: Activity;
  selected: boolean;
  onClick: () => void;
  dim?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "absolute z-10 -translate-x-1/2 -translate-y-full transition-all",
        selected && "z-20 scale-110",
        dim && "opacity-40"
      )}
      style={{ left: `${activity.x}%`, top: `${activity.y}%` }}
    >
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg border-2 transition-all overflow-hidden",
            selected ? "border-primary ring-4 ring-primary/25" : "border-white"
          )}
        >
          {activity.image ? (
            <Image
              src={activity.image}
              alt={activity.title}
              width={44}
              height={44}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xl leading-none">{activity.emoji || "📍"}</span>
          )}
        </div>
        <div
          className={cn(
            "mt-0.5 h-2.5 w-2.5 rotate-45 shadow-sm",
            selected ? "bg-primary" : "bg-white"
          )}
        />
      </div>
    </button>
  );
}
