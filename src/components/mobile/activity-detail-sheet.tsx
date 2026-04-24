"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  MapPin,
  Clock,
  Users,
  MessageCircle,
  Check,
  Calendar,
} from "lucide-react";
import { BottomSheet } from "@/components/mobile/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Activity } from "@/data/activities";
import { CURRENT_USER } from "@/data/conversations";
import { useActivities } from "@/hooks/use-activities";
import { cn } from "@/lib/utils";

interface Props {
  activity: Activity | null;
  open: boolean;
  onClose: () => void;
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  const diffMs = d.getTime() - Date.now();
  const diffH = diffMs / (1000 * 60 * 60);
  if (diffH < 0) return "Started already";
  if (diffH < 1) return `In ${Math.max(1, Math.round(diffH * 60))} min`;
  if (diffH < 24)
    return `In ${Math.round(diffH)} hour${Math.round(diffH) === 1 ? "" : "s"}`;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ActivityDetailSheet({ activity, open, onClose }: Props) {
  const router = useRouter();
  const { joinActivity, isJoined } = useActivities();

  if (!activity) {
    return (
      <BottomSheet open={open} onClose={onClose}>
        <div className="py-8 text-center text-sm text-muted-foreground">
          Select a pin to see activity details.
        </div>
      </BottomSheet>
    );
  }

  const joined = isJoined(activity.id);
  const full = activity.capacity
    ? activity.participantIds.length >= activity.capacity
    : false;
  const isMine = activity.creator.id === CURRENT_USER.id;

  const handleJoin = () => {
    const { conversationId } = joinActivity(activity.id);
    onClose();
    if (conversationId) {
      router.push(`/mobile/messages/${conversationId}`);
    } else {
      router.push("/mobile/messages");
    }
  };

  const handleOpenChat = () => {
    if (activity.conversationId) {
      onClose();
      router.push(`/mobile/messages/${activity.conversationId}`);
    }
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      footer={
        joined ? (
          <Button
            onClick={handleOpenChat}
            disabled={!activity.conversationId}
            className="w-full h-12 gap-1.5"
            size="lg"
          >
            <MessageCircle className="h-4 w-4" />
            Open group chat
          </Button>
        ) : (
          <Button
            onClick={handleJoin}
            disabled={full || isMine}
            className="w-full h-12"
            size="lg"
          >
            {full ? "Activity is full" : isMine ? "You host this" : "Join activity"}
          </Button>
        )
      }
    >
      {/* Hero */}
      <div className="-mx-5 -mt-4 mb-4">
        {activity.image ? (
          <div className="relative h-44 w-full">
            <Image
              src={activity.image}
              alt={activity.title}
              fill
              className="object-cover"
              sizes="400px"
            />
          </div>
        ) : (
          <div className="h-44 w-full flex items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
            <span className="text-7xl">{activity.emoji || "📍"}</span>
          </div>
        )}
      </div>

      {/* Title + meta */}
      <div className="space-y-2">
        {joined && (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1">
            <Check className="h-3 w-3" />
            You&apos;re in
          </Badge>
        )}
        <h3 className="text-lg font-bold leading-tight">{activity.title}</h3>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {activity.locationLabel}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {formatWhen(activity.startsAt)}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {activity.duration}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {activity.participantIds.length}
            {activity.capacity ? `/${activity.capacity}` : ""} going
          </span>
        </div>
      </div>

      {/* Description */}
      {activity.description && (
        <p className="mt-4 text-sm leading-relaxed text-foreground/80">
          {activity.description}
        </p>
      )}

      {/* Creator */}
      <div className="mt-5 rounded-xl bg-muted/40 p-3 flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full shrink-0">
          <Image
            src={activity.creator.avatar}
            alt={activity.creator.name}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {isMine ? "You created this" : "Hosted by"}
          </p>
          <p className="text-sm font-semibold truncate">
            {activity.creator.name}
          </p>
        </div>
      </div>

      {/* Participants preview */}
      {activity.participantIds.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            Going ({activity.participantIds.length})
          </p>
          <div className="flex -space-x-2">
            {activity.participantIds.slice(0, 8).map((id, i) => (
              <div
                key={id + i}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-muted text-[10px] font-semibold text-muted-foreground uppercase"
                )}
                title={id}
              >
                {id === CURRENT_USER.id ? "You" : id.slice(2, 4)}
              </div>
            ))}
            {activity.participantIds.length > 8 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-muted text-[10px] font-semibold">
                +{activity.participantIds.length - 8}
              </div>
            )}
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
