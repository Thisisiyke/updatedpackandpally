"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Upload,
  Eye,
  Save,
  Trash2,
  Check,
  Info,
  Ban,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { TermsModal } from "@/components/shared/terms-modal";
import { CancellationPolicyModal } from "@/components/shared/cancellation-policy-modal";
import { CURRENT_PARTNER } from "@/data/conversations";
import {
  CANCELLATION_PRESETS,
  CURRENT_PARTNER_HOST_ID,
  clearHostTerms,
  getHostTerms,
  saveHostTerms,
  type CancellationPolicy,
  type CancellationPreset,
} from "@/lib/host-terms";
import { cn } from "@/lib/utils";

const TEMPLATE = `1. About your trip
Describe what this trip is and what's included.

2. What travelers should bring
List any required gear, documents, insurance, or fitness level.

3. Conduct
Travelers are expected to respect fellow guests, hosts, and local customs. Harassment or illegal activity results in immediate removal without refund.

4. Liability
Travelers participate at their own risk. Travel insurance is strongly recommended.`;

export default function MobilePartnerTermsPage() {
  const hostId = CURRENT_PARTNER_HOST_ID;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [cancelPreset, setCancelPreset] = useState<CancellationPreset>("moderate");
  const [cancelCustom, setCancelCustom] = useState("");

  const [initialTitle, setInitialTitle] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [initialPolicyKey, setInitialPolicyKey] = useState("moderate||");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const [previewTermsOpen, setPreviewTermsOpen] = useState(false);
  const [previewPolicyOpen, setPreviewPolicyOpen] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const existing = getHostTerms(hostId);
    if (existing) {
      setTitle(existing.title || "");
      setContent(existing.content);
      setInitialTitle(existing.title || "");
      setInitialContent(existing.content);
      setUpdatedAt(existing.updatedAt);
      if (existing.cancellationPolicy) {
        setCancelPreset(existing.cancellationPolicy.preset);
        setCancelCustom(existing.cancellationPolicy.customText || "");
        setInitialPolicyKey(
          `${existing.cancellationPolicy.preset}||${existing.cancellationPolicy.customText || ""}`
        );
      }
    }
    setHydrated(true);
  }, [hostId]);

  const currentPolicyKey = `${cancelPreset}||${cancelPreset === "custom" ? cancelCustom : ""}`;
  const dirty =
    title !== initialTitle ||
    content !== initialContent ||
    currentPolicyKey !== initialPolicyKey;
  const hasContent = content.trim().length > 0;

  const policy: CancellationPolicy = {
    preset: cancelPreset,
    customText:
      cancelPreset === "custom" ? cancelCustom.trim() || undefined : undefined,
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      setContent(text);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleLoadTemplate = () => {
    if (content.trim() && !confirm("Replace your current draft?")) return;
    setContent(TEMPLATE);
  };

  const handleSave = () => {
    if (!hasContent) return;
    const record = saveHostTerms(hostId, content, title, policy);
    setInitialTitle(record.title || "");
    setInitialContent(record.content);
    setInitialPolicyKey(
      `${record.cancellationPolicy?.preset}||${record.cancellationPolicy?.customText || ""}`
    );
    setUpdatedAt(record.updatedAt);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2200);
  };

  const handleRemove = () => {
    if (
      !confirm(
        "Remove your custom terms? Travelers will see the platform default instead."
      )
    )
      return;
    clearHostTerms(hostId);
    setTitle("");
    setContent("");
    setCancelPreset("moderate");
    setCancelCustom("");
    setInitialTitle("");
    setInitialContent("");
    setInitialPolicyKey("moderate||");
    setUpdatedAt(null);
  };

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader title="Terms & policy" />

      <div className="flex-1 overflow-y-auto pb-28">
        {/* Intro */}
        <div className="px-5 pt-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Terms &amp; conditions</h1>
              <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                Travelers accept these before joining any of{" "}
                {CURRENT_PARTNER.name.split(" ")[0]}&apos;s trips. Pack &amp;
                Pally&apos;s platform terms still apply.
              </p>
            </div>
          </div>
        </div>

        {/* Info callout */}
        <div className="mx-5 mt-4 rounded-xl border bg-primary/5 border-primary/15 p-3 flex items-start gap-2">
          <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] text-foreground/80 leading-snug">
            Your cancellation policy is a separate document shown to travelers
            alongside the terms. Edit both here.
          </p>
        </div>

        {/* Cancellation policy */}
        <div className="px-5 mt-5">
          <div className="rounded-2xl border bg-white p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Ban className="h-4 w-4 text-amber-700 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Cancellation policy</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Every host must pick one — travelers see this before
                  accepting.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {(Object.keys(CANCELLATION_PRESETS) as Array<
                keyof typeof CANCELLATION_PRESETS
              >).map((key) => {
                const preset = CANCELLATION_PRESETS[key];
                const active = cancelPreset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCancelPreset(key)}
                    className={cn(
                      "w-full rounded-xl border p-3 text-left transition-colors",
                      active
                        ? "border-primary bg-primary/5 ring-2 ring-primary/15"
                        : "hover:border-primary/40"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-full border-2 shrink-0",
                          active
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/40"
                        )}
                      >
                        {active && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <span className="font-semibold text-sm">
                        {preset.label}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {preset.headline}
                    </p>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setCancelPreset("custom")}
                className={cn(
                  "w-full rounded-xl border p-3 text-left transition-colors",
                  cancelPreset === "custom"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/15"
                    : "hover:border-primary/40"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border-2 shrink-0",
                      cancelPreset === "custom"
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/40"
                    )}
                  >
                    {cancelPreset === "custom" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  <span className="font-semibold text-sm">Custom</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Write your own refund rules below.
                </p>
              </button>
            </div>

            {cancelPreset === "custom" && (
              <textarea
                value={cancelCustom}
                onChange={(e) => setCancelCustom(e.target.value)}
                placeholder="Describe your refund rules…"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreviewPolicyOpen(true)}
              className="w-full gap-1.5"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview policy
            </Button>
          </div>
        </div>

        {/* Terms editor */}
        <div className="px-5 mt-4">
          <div className="rounded-2xl border bg-white p-4 space-y-3">
            <div>
              <p className="font-bold text-sm">Terms content</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Everything travelers see when they tap &ldquo;Join this trip&rdquo;.
              </p>
            </div>

            <div>
              <Label htmlFor="m-terms-title" className="text-xs">
                Title (optional)
              </Label>
              <Input
                id="m-terms-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sofia's Trip Terms"
                maxLength={80}
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="m-terms-content" className="text-xs">
                  Content
                </Label>
                <div className="flex items-center gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,text/plain,text/markdown"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-7 gap-1 text-[10px]"
                  >
                    <Upload className="h-3 w-3" />
                    Upload
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleLoadTemplate}
                    className="h-7 text-[10px]"
                  >
                    Template
                  </Button>
                </div>
              </div>
              <textarea
                id="m-terms-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste or type your terms…"
                rows={12}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                <span>
                  {content.length.toLocaleString()} char
                  {content.length === 1 ? "" : "s"}
                </span>
                {updatedAt && (
                  <span>
                    Last saved{" "}
                    {new Date(updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreviewTermsOpen(true)}
              disabled={!hasContent}
              className="w-full gap-1.5"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview as traveler
            </Button>
          </div>
        </div>

        {/* Status */}
        <div className="px-5 mt-4">
          <div className="rounded-xl bg-muted/30 border p-3 text-xs">
            {updatedAt ? (
              <p>
                <span className="font-semibold">Live:</span> Travelers see your
                custom terms and policy.
              </p>
            ) : (
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Not set:</span>{" "}
                Travelers currently see the platform default.
              </p>
            )}
          </div>
        </div>

        {/* Remove */}
        {hydrated && updatedAt && (
          <div className="px-5 mt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove my terms
            </Button>
          </div>
        )}
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 bg-white border-t p-3 md:pb-6 flex items-center gap-2">
        <Button variant="outline" asChild className="flex-1">
          <Link href="/mobile/partner/profile">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasContent || !dirty}
          className="flex-1 gap-1.5"
        >
          {savedToast ? (
            <>
              <Check className="h-4 w-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save
            </>
          )}
        </Button>
      </div>

      {/* Preview modals */}
      <TermsModal
        open={previewTermsOpen}
        onClose={() => setPreviewTermsOpen(false)}
        onAccept={() => setPreviewTermsOpen(false)}
        bookingType="trip"
        customTerms={{
          title: title || undefined,
          content,
          authorName: CURRENT_PARTNER.name,
          updatedAt: updatedAt || undefined,
        }}
      />

      <CancellationPolicyModal
        open={previewPolicyOpen}
        onClose={() => setPreviewPolicyOpen(false)}
        policy={policy}
        hostName={CURRENT_PARTNER.name}
      />
    </div>
  );
}
