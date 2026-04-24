"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Check, Users, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { useConversations } from "@/hooks/use-conversations";
import {
  inviteableTravelers,
  hosts,
  CURRENT_USER,
} from "@/data/conversations";
import { trips } from "@/data/trips";
import { cn } from "@/lib/utils";

type Step = "select" | "name";

export default function NewGroupPage() {
  const router = useRouter();
  const { createGroup } = useConversations("user");
  const [step, setStep] = useState<Step>("select");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [tripTitle, setTripTitle] = useState("");

  const pool = useMemo(() => {
    return [...hosts, ...inviteableTravelers].filter(
      (p) => p.id !== CURRENT_USER.id
    );
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return pool;
    return pool.filter((p) => p.name.toLowerCase().includes(q));
  }, [pool, search]);

  const selected = pool.filter((p) => selectedIds.includes(p.id));

  const toggle = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const canContinue = selectedIds.length > 0;
  const canCreate = groupName.trim().length > 0;

  const handleCreate = () => {
    const invited = pool.filter((p) => selectedIds.includes(p.id));
    const trip = trips.find((t) => t.title === tripTitle);
    const newConv = createGroup(groupName, invited, {
      tripTitle: trip?.title,
      tripImage: trip?.coverImage,
      groupImage: trip?.coverImage,
    });
    if (newConv) {
      router.push(`/mobile/messages/${newConv.id}`);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-white">
      <MobileHeader
        title={step === "select" ? "New group" : "Group details"}
        onBack={() => {
          if (step === "name") setStep("select");
          else router.back();
        }}
        action={
          step === "select" ? (
            <Button
              size="sm"
              disabled={!canContinue}
              onClick={() => setStep("name")}
              className="h-8 text-xs"
            >
              Next
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={!canCreate}
              onClick={handleCreate}
              className="h-8 text-xs"
            >
              Create
            </Button>
          )
        }
      />

      {/* Step 1 — Select participants */}
      {step === "select" && (
        <>
          {/* Selected chips */}
          {selected.length > 0 && (
            <div className="bg-white border-b px-3 py-2 overflow-x-auto">
              <div className="flex gap-2 w-max">
                {selected.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    className="flex items-center gap-2 rounded-full bg-primary/10 text-primary px-2 py-1 text-xs font-medium"
                  >
                    <Image
                      src={p.avatar}
                      alt=""
                      width={20}
                      height={20}
                      className="h-5 w-5 rounded-full object-cover"
                    />
                    {p.name.split(" ")[0]}
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="bg-white border-b px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search people..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 bg-muted/50 border-0"
              />
            </div>
          </div>

          {/* People list */}
          <div className="flex-1 overflow-y-auto">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-4 pt-3 pb-2">
              {filtered.length} {filtered.length === 1 ? "person" : "people"}
              {selectedIds.length > 0 &&
                ` · ${selectedIds.length} selected`}
            </p>
            <div className="divide-y">
              {filtered.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    className="w-full flex items-center gap-3 p-3.5 text-left bg-white hover:bg-muted/30 transition-colors"
                  >
                    <div className="relative shrink-0">
                      <Image
                        src={p.avatar}
                        alt={p.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover h-10 w-10"
                      />
                      {p.online && (
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground capitalize">
                        {p.role}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all shrink-0",
                        isSelected
                          ? "bg-primary border-primary"
                          : "border-muted-foreground/30"
                      )}
                    >
                      {isSelected && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Step 2 — Name + trip context */}
      {step === "name" && (
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <label className="text-xs font-semibold mb-2 block">
              Group icon
            </label>
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <p className="text-center text-[10px] text-muted-foreground -mt-2">
              Defaults to the trip photo (if linked)
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block">
              Group name
            </label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g., Amalfi Crew, Safari Squad..."
              className="h-11"
              maxLength={40}
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              {groupName.length}/40
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block">
              Link to a trip (optional)
            </label>
            <div className="space-y-2 max-h-[260px] overflow-y-auto">
              <button
                onClick={() => setTripTitle("")}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl border p-2.5 text-left transition-colors",
                  !tripTitle
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/30"
                )}
              >
                <div className="h-9 w-12 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                  <X className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold">No trip</p>
                  <p className="text-[10px] text-muted-foreground">
                    Standalone group chat
                  </p>
                </div>
              </button>
              {trips.slice(0, 6).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTripTitle(t.title)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-xl border p-2.5 text-left transition-colors",
                    tripTitle === t.title
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/30"
                  )}
                >
                  <div className="relative h-9 w-12 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={t.coverImage}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">
                      {t.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {t.destination}, {t.country}
                    </p>
                  </div>
                  {tripTitle === t.title && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold mb-2 block">
              Members ({selected.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {selected.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 rounded-full bg-muted/50 px-2 py-1"
                >
                  <Image
                    src={p.avatar}
                    alt=""
                    width={20}
                    height={20}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                  <span className="text-xs">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
