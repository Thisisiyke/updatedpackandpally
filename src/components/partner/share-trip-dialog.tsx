"use client";

import { useState } from "react";
import { Copy, Check, Mail, MessageCircle, Lock, Globe, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareTripDialogProps {
  open: boolean;
  onClose: () => void;
  tripTitle: string;
  visibility: "public" | "private";
  /** Full traveler-facing URL including share key (when private). */
  shareUrl: string;
}

export function ShareTripDialog({
  open,
  onClose,
  tripTitle,
  visibility,
  shareUrl,
}: ShareTripDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const fullUrl =
    typeof window !== "undefined" && shareUrl.startsWith("/")
      ? `${window.location.origin}${shareUrl}`
      : shareUrl;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: tripTitle,
          text: `Join me on ${tripTitle} via Pack & Pally`,
          url: fullUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  };

  const emailHref = `mailto:?subject=${encodeURIComponent(
    `Join me on ${tripTitle}`
  )}&body=${encodeURIComponent(
    `I'm hosting "${tripTitle}" on Pack & Pally. Here's the link to join:\n\n${fullUrl}`
  )}`;

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `Join me on ${tripTitle}: ${fullUrl}`
  )}`;

  const isPrivate = visibility === "private";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl animate-[fade-in-up_200ms_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 pb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                isPrivate
                  ? "bg-amber-100 text-amber-700"
                  : "bg-primary/10 text-primary"
              )}
            >
              {isPrivate ? (
                <Lock className="h-4 w-4" />
              ) : (
                <Globe className="h-4 w-4" />
              )}
            </div>
            <div>
              <h2 className="font-bold text-base">Share trip</h2>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {tripTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pb-2">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isPrivate
              ? "This trip is private — only people with this link can see and book it."
              : "Anyone can find this trip in browse. Share the link to invite friends directly."}
          </p>
        </div>

        <div className="px-5 py-3">
          <div className="flex items-center gap-2 rounded-xl border bg-muted/40 p-2.5">
            <p className="flex-1 text-xs truncate font-mono text-muted-foreground">
              {fullUrl}
            </p>
            <Button
              type="button"
              size="sm"
              variant={copied ? "secondary" : "default"}
              onClick={handleCopy}
              className="gap-1 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 px-5 pb-5">
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-semibold hover:bg-muted/50 transition-colors"
          >
            <MessageCircle className="h-4 w-4 text-primary" />
            Share
          </button>
          <a
            href={emailHref}
            className="flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-semibold hover:bg-muted/50 transition-colors"
          >
            <Mail className="h-4 w-4 text-primary" />
            Email
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-semibold hover:bg-muted/50 transition-colors"
          >
            <MessageCircle className="h-4 w-4 text-emerald-600" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
