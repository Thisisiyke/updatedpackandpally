"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ACTIVITIES_CHANGE_EVENT,
  loadActivities,
  saveActivities,
  type Activity,
} from "@/data/activities";
import { CURRENT_USER } from "@/data/conversations";
import { joinActivityGroupChat } from "@/hooks/use-conversations";

export interface NewActivityInput {
  title: string;
  description?: string;
  emoji?: string;
  image?: string;
  locationLabel: string;
  x: number;
  y: number;
  startsAt: string;
  duration: string;
  capacity?: number;
}

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setActivities(loadActivities());
    setHydrated(true);
    const refresh = () => setActivities(loadActivities());
    window.addEventListener(ACTIVITIES_CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(ACTIVITIES_CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const sorted = useMemo(
    () =>
      [...activities].sort(
        (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      ),
    [activities]
  );

  const createActivity = useCallback(
    (input: NewActivityInput): Activity => {
      const now = new Date().toISOString();
      const activity: Activity = {
        id: `act-${Date.now()}`,
        creator: CURRENT_USER,
        title: input.title.trim(),
        description: input.description?.trim() || undefined,
        emoji: input.emoji,
        image: input.image,
        locationLabel: input.locationLabel.trim(),
        x: input.x,
        y: input.y,
        startsAt: input.startsAt,
        duration: input.duration,
        capacity: input.capacity,
        participantIds: [CURRENT_USER.id],
        createdAt: now,
      };

      // Auto-create the activity group chat so the creator has somewhere to go
      const convId = joinActivityGroupChat(
        {
          id: activity.id,
          title: activity.title,
          locationLabel: activity.locationLabel,
          emoji: activity.emoji,
          image: activity.image,
        },
        CURRENT_USER
      );
      if (convId) activity.conversationId = convId;

      const current = loadActivities();
      const next = [activity, ...current];
      saveActivities(next);
      setActivities(next);
      return activity;
    },
    []
  );

  const joinActivity = useCallback(
    (activityId: string): { conversationId: string | null } => {
      const current = loadActivities();
      const target = current.find((a) => a.id === activityId);
      if (!target) return { conversationId: null };

      if (!target.participantIds.includes(CURRENT_USER.id)) {
        target.participantIds = [...target.participantIds, CURRENT_USER.id];
      }

      const convId = joinActivityGroupChat(
        {
          id: target.id,
          title: target.title,
          locationLabel: target.locationLabel,
          emoji: target.emoji,
          image: target.image,
          conversationId: target.conversationId,
        },
        target.creator
      );
      if (convId) target.conversationId = convId;

      const next = current.map((a) => (a.id === target.id ? target : a));
      saveActivities(next);
      setActivities(next);
      return { conversationId: convId };
    },
    []
  );

  const isJoined = useCallback(
    (activityId: string) => {
      const a = activities.find((x) => x.id === activityId);
      return !!a && a.participantIds.includes(CURRENT_USER.id);
    },
    [activities]
  );

  return {
    hydrated,
    activities: sorted,
    createActivity,
    joinActivity,
    isJoined,
  };
}
