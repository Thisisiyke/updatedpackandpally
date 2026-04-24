"use client";

import { use, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  Calendar,
  LogOut,
  Users,
  UserPlus,
  Crown,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { useConversations } from "@/hooks/use-conversations";
import { CURRENT_USER } from "@/data/conversations";
import { cn } from "@/lib/utils";

export default function GroupInfoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getConversation, leaveGroup, hydrated } = useConversations("user");

  const [muted, setMuted] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const conversation = getConversation(id);

  if (!hydrated) {
    return (
      <div className="flex h-full min-h-[844px] items-center justify-center text-sm text-muted-foreground">
        Loading...
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
              onClick={() => router.push("/mobile/messages")}
            >
              Back to messages
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const members = conversation.participants;
  const admin =
    members.find((m) => m.id === conversation.createdBy) || null;

  const handleLeave = () => {
    leaveGroup(id);
    router.push("/mobile/messages");
  };

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader title="Group info" />

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
        <h1 className="text-xl font-bold">{conversation.groupName}</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Group · {members.length} members
        </p>
        {conversation.tripTitle && (
          <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
            🧭 {conversation.tripTitle}
          </p>
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
              {muted ? "You won't receive alerts" : "Get notified of new messages"}
            </p>
          </div>
          <div
            className={cn(
              "h-5 w-9 rounded-full relative transition-colors",
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

        <button className="w-full flex items-center gap-3 p-3.5 text-left">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Shared media</p>
            <p className="text-[10px] text-muted-foreground">
              Photos, files, and links
            </p>
          </div>
        </button>
      </div>

      {/* Members */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white mt-3">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {members.length} Members
            </h2>
            <button className="flex items-center gap-1 text-xs font-semibold text-primary">
              <UserPlus className="h-3 w-3" />
              Add
            </button>
          </div>

          <div className="divide-y">
            {members.map((m) => {
              const isAdmin = admin?.id === m.id;
              const isMe = m.id === CURRENT_USER.id;
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
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
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">
                        {isMe ? "You" : m.name}
                      </p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 border border-amber-200 px-1.5 py-[1px] text-[9px] font-semibold text-amber-700">
                          <Crown className="h-2.5 w-2.5" />
                          Admin
                        </span>
                      )}
                      {m.role === "host" && !isAdmin && (
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

        {/* Danger zone */}
        <div className="bg-white mt-3 mb-6 border-t">
          <button
            onClick={() => setConfirmLeave(true)}
            className="w-full flex items-center gap-3 p-3.5 text-left"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
              <LogOut className="h-4 w-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-600">
                Leave group
              </p>
              <p className="text-[10px] text-muted-foreground">
                You&apos;ll stop receiving messages
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Leave confirm */}
      {confirmLeave && (
        <>
          <div
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm animate-[fade-in_200ms_ease-out]"
            onClick={() => setConfirmLeave(false)}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl pointer-events-auto animate-[pop-in_300ms_cubic-bezier(0.16,1,0.3,1)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-center text-lg font-bold">
                Leave &quot;{conversation.groupName}&quot;?
              </h2>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                You will stop receiving messages and won&apos;t see this
                group in your list. You can be added back by any member.
              </p>
              <div className="mt-5 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-10"
                  onClick={() => setConfirmLeave(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleLeave}
                >
                  Leave group
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
