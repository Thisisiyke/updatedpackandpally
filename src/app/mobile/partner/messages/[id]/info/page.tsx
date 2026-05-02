"use client";

import { use, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  Users,
  UserPlus,
  Crown,
  Compass,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { useTravelerMessagesApi } from "@/hooks/use-traveler-messages-api";
import { usePackPallyAuth } from "@/components/providers/session-provider";
import { cn } from "@/lib/utils";

export default function PartnerGroupInfoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user: packUser } = usePackPallyAuth();
  const useLive =
    Boolean(packUser?.id) && packUser?.role !== "guest";
  const { conversations, hydrated, meId } = useTravelerMessagesApi(useLive);

  const [muted, setMuted] = useState(false);

  const conversation = useMemo(
    () => conversations.find((c) => c.id === id),
    [conversations, id]
  );

  if (!hydrated) {
    return (
      <div className="flex h-full min-h-[844px] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!useLive || !meId) {
    return (
      <div className="flex h-full min-h-[844px] flex-col">
        <MobileHeader title="Group info" />
        <div className="flex-1 flex items-center justify-center p-6 text-center text-sm text-muted-foreground">
          Sign in to view this group.
        </div>
      </div>
    );
  }

  if (!conversation || !conversation.isGroup) {
    return (
      <div className="flex h-full min-h-[844px] flex-col">
        <MobileHeader title="Group info" />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div>
            <p className="font-semibold">Group not found</p>
            <Button
              className="mt-4"
              onClick={() => router.push("/mobile/partner/messages")}
            >
              Back to messages
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const members = conversation.participants;
  const admin = members.find((m) => m.id === conversation.createdBy) || null;

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader
        title="Group info"
        onBack={() => router.push(`/mobile/partner/messages/${id}`)}
      />

      {/* Hero */}
      <div className="bg-white border-b px-5 pt-6 pb-6 text-center">
        <div className="mx-auto relative h-20 w-20 mb-3">
          {conversation.groupImage ? (
            <Image
              src={conversation.groupImage}
              alt={conversation.groupName || ""}
              fill
              className="object-cover rounded-2xl"
              sizes="80px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
          )}
        </div>
        <h1 className="text-xl font-bold">
          {conversation.groupName || conversation.tripTitle || "Group"}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Group · {members.length} members
        </p>
        {conversation.tripTitle && conversation.tripId && (
          <button
            onClick={() =>
              router.push(
                `/mobile/partner/trips/${conversation.tripId}/travelers`
              )
            }
            className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary/5 border border-primary/15 px-3 py-1 text-[11px] font-medium text-primary"
          >
            <Compass className="h-3 w-3" />
            {conversation.tripTitle}
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white border-b divide-y">
        <button
          onClick={() => setMuted(!muted)}
          className="w-full flex items-center gap-3 p-3.5 text-left"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
            {muted ? (
              <BellOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Bell className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {muted ? "Unmute notifications" : "Mute notifications"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {muted
                ? "You won't be alerted about new messages"
                : "Get alerts when travelers reply"}
            </p>
          </div>
          <div
            className={cn(
              "h-5 w-9 rounded-full relative transition-colors shrink-0",
              muted ? "bg-muted" : "bg-primary"
            )}
          >
            <div
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm",
                muted ? "left-0.5" : "left-[18px]"
              )}
            />
          </div>
        </button>

        <button
          onClick={() =>
            conversation.tripId &&
            router.push(
              `/mobile/partner/trips/${conversation.tripId}/travelers`
            )
          }
          disabled={!conversation.tripId}
          className="w-full flex items-center gap-3 p-3.5 text-left disabled:opacity-50"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <Compass className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Manage trip</p>
            <p className="text-[10px] text-muted-foreground">
              Travelers, reminders, surveys
            </p>
          </div>
        </button>
      </div>

      {/* Members */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white mt-3">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {members.length} members
            </h2>
            <button
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground opacity-60 cursor-not-allowed"
              disabled
            >
              <UserPlus className="h-3 w-3" />
              Add
            </button>
          </div>

          <div className="divide-y">
            {members.map((m) => {
              const isAdmin = admin?.id === m.id;
              const isMe = m.id === meId;
              return (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="relative shrink-0">
                    <Image
                      src={m.avatar}
                      alt={m.name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover h-10 w-10"
                    />
                    {m.online && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold truncate">
                        {isMe ? "You" : m.name}
                      </p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 border border-amber-200 px-1.5 py-[1px] text-[9px] font-semibold text-amber-700">
                          <Crown className="h-2.5 w-2.5" />
                          Admin
                        </span>
                      )}
                      {m.role === "partner" && !isAdmin && (
                        <span className="rounded-full bg-primary/10 text-primary px-1.5 py-[1px] text-[9px] font-semibold">
                          Host
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {m.role}
                      {m.online && " · Active now"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white mt-3 mb-6 border-t px-4 py-3 text-[11px] text-muted-foreground">
          To leave a group or change membership, use the Pack & Pally mobile app.
        </div>
      </div>

      {/* Back bar */}
      <div className="sticky bottom-0 bg-white border-t p-3 md:pb-6">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push(`/mobile/partner/messages/${id}`)}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to chat
        </Button>
      </div>
    </div>
  );
}
