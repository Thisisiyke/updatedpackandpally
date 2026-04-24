"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Smile, MapPin, X } from "lucide-react";
import { BottomSheet } from "@/components/mobile/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActivities } from "@/hooks/use-activities";
import { cn } from "@/lib/utils";

const POPULAR_EMOJI = [
  "🧺",
  "🍜",
  "☕",
  "🍕",
  "🍷",
  "🎨",
  "🎸",
  "📚",
  "🏃‍♂️",
  "🧘‍♀️",
  "🚴",
  "🏄",
  "🎾",
  "♟️",
  "🎮",
  "🎬",
  "🎤",
  "🥾",
  "🔥",
  "🌅",
  "🍺",
  "🥐",
  "🌮",
  "🥖",
];

const DURATIONS = ["1 hour", "2 hours", "3 hours", "All evening", "All day"];

interface Props {
  open: boolean;
  onClose: () => void;
  coords: { x: number; y: number } | null;
  onCreated: () => void;
}

export function CreateActivitySheet({
  open,
  onClose,
  coords,
  onCreated,
}: Props) {
  const { createActivity } = useActivities();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"emoji" | "image">("emoji");
  const [emoji, setEmoji] = useState("🧺");
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [whenHours, setWhenHours] = useState("2");
  const [duration, setDuration] = useState("2 hours");
  const [capacity, setCapacity] = useState("");

  useEffect(() => {
    if (!open) {
      setMode("emoji");
      setEmoji("🧺");
      setImage(null);
      setTitle("");
      setDescription("");
      setLocationLabel("");
      setWhenHours("2");
      setDuration("2 hours");
      setCapacity("");
    }
  }, [open]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(String(reader.result || ""));
      setMode("image");
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canSubmit =
    !!coords &&
    title.trim().length >= 3 &&
    locationLabel.trim().length >= 2 &&
    (mode === "emoji" ? !!emoji : !!image);

  const handleSubmit = () => {
    if (!coords || !canSubmit) return;
    const startsAt = new Date(
      Date.now() + Number(whenHours || "0") * 60 * 60_000
    ).toISOString();
    createActivity({
      title,
      description: description || undefined,
      emoji: mode === "emoji" ? emoji : undefined,
      image: mode === "image" && image ? image : undefined,
      locationLabel,
      x: coords.x,
      y: coords.y,
      startsAt,
      duration,
      capacity: capacity ? Number(capacity) : undefined,
    });
    onCreated();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Post an activity"
      footer={
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full h-12"
          size="lg"
        >
          Drop pin
        </Button>
      }
    >
      <div className="space-y-5">
        {coords && (
          <div className="flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/15 px-3 py-2 text-xs">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="text-foreground/80">
              Pin placed on map — fill in the details below
            </span>
          </div>
        )}

        {/* Emoji or image */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => setMode("emoji")}
              className={cn(
                "flex-1 h-10 rounded-lg border text-sm font-medium flex items-center justify-center gap-1.5 transition-colors",
                mode === "emoji"
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-white border-input text-muted-foreground"
              )}
            >
              <Smile className="h-4 w-4" />
              Emoji
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("image");
                if (!image) fileInputRef.current?.click();
              }}
              className={cn(
                "flex-1 h-10 rounded-lg border text-sm font-medium flex items-center justify-center gap-1.5 transition-colors",
                mode === "image"
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-white border-input text-muted-foreground"
              )}
            >
              <ImagePlus className="h-4 w-4" />
              Photo
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="hidden"
          />

          {mode === "emoji" ? (
            <div className="rounded-xl border bg-muted/30 p-3">
              <div className="mb-2 text-center">
                <span className="text-5xl">{emoji}</span>
              </div>
              <div className="grid grid-cols-8 gap-1">
                {POPULAR_EMOJI.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={cn(
                      "h-9 rounded-lg text-xl transition-all",
                      emoji === e
                        ? "bg-primary/15 ring-2 ring-primary/30"
                        : "hover:bg-muted"
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          ) : image ? (
            <div className="relative rounded-xl overflow-hidden border">
              <div className="relative h-36 w-full">
                <Image
                  src={image}
                  alt="Preview"
                  fill
                  className="object-cover"
                  sizes="400px"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setMode("emoji");
                }}
                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 rounded-full bg-white/90 text-xs font-semibold px-3 py-1 shadow-sm"
              >
                Change
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-32 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed text-sm text-muted-foreground gap-1.5"
            >
              <ImagePlus className="h-5 w-5" />
              Tap to choose a photo
            </button>
          )}
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <Label className="text-xs" htmlFor="act-title">
            Title
          </Label>
          <Input
            id="act-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Sunset picnic at the Marina"
            maxLength={60}
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label className="text-xs" htmlFor="act-desc">
            Description (optional)
          </Label>
          <textarea
            id="act-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you bringing, what to expect, how to find you…"
            rows={3}
            maxLength={240}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        {/* Location label */}
        <div className="space-y-1.5">
          <Label className="text-xs" htmlFor="act-loc">
            Spot name
          </Label>
          <Input
            id="act-loc"
            value={locationLabel}
            onChange={(e) => setLocationLabel(e.target.value)}
            placeholder="e.g. Dolores Park, SE corner"
            maxLength={50}
          />
        </div>

        {/* When + duration + capacity */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs" htmlFor="act-when">
              Starting in
            </Label>
            <select
              id="act-when"
              value={whenHours}
              onChange={(e) => setWhenHours(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
            >
              <option value="1">1 hour</option>
              <option value="2">2 hours</option>
              <option value="3">3 hours</option>
              <option value="6">6 hours</option>
              <option value="24">Tomorrow</option>
              <option value="48">In 2 days</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs" htmlFor="act-dur">
              Duration
            </Label>
            <select
              id="act-dur"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs" htmlFor="act-cap">
            Max people (optional)
          </Label>
          <Input
            id="act-cap"
            type="number"
            min={2}
            max={50}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value.replace(/\D/g, ""))}
            placeholder="Leave blank for no limit"
          />
        </div>
      </div>
    </BottomSheet>
  );
}
