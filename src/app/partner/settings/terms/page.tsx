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
  ChevronLeft,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Container } from "@/components/shared/container";
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

2. Cancellation policy
Full refund if cancelled 30+ days before departure. 50% refund between 15–30 days. No refund within 14 days.

3. What travelers should bring
List any required gear, documents, insurance, or fitness level.

4. Conduct
Travelers are expected to respect fellow guests, hosts, and local customs. Harassment or illegal activity results in immediate removal without refund.

5. Liability
Travelers participate at their own risk. Travel insurance is strongly recommended.`;

export default function PartnerTermsPage() {
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [cancelPreviewOpen, setCancelPreviewOpen] = useState(false);
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
  const charCount = content.length;

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

  const policy: CancellationPolicy = {
    preset: cancelPreset,
    customText:
      cancelPreset === "custom" ? cancelCustom.trim() || undefined : undefined,
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
    if (!confirm("Remove your custom terms? Travelers will see the platform default instead.")) return;
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

  const handleLoadTemplate = () => {
    if (content.trim() && !confirm("This will replace your current draft. Continue?")) return;
    setContent(TEMPLATE);
  };

  return (
    <section className="py-10 pb-20">
      <Container>
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link
              href="/partner"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
            <div className="mt-3 flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Terms &amp; Conditions</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Write or upload your own terms. Travelers will be asked to
                  accept these before joining any of your trips.
                </p>
              </div>
            </div>
          </div>

          {/* Info callout */}
          <div className="mb-6 rounded-xl border bg-primary/5 border-primary/15 p-4 flex items-start gap-3">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="text-sm text-foreground/80">
              <p>
                Pack &amp; Pally&apos;s platform terms still apply. Yours sit on
                top of them, covering anything specific to how{" "}
                <span className="font-semibold">{CURRENT_PARTNER.name}</span>{" "}
                runs trips (cancellation rules, conduct, packing, etc.).
              </p>
            </div>
          </div>

          {/* Editor card */}
          <div className="rounded-2xl border bg-white p-6 space-y-5">
            {/* Cancellation policy — every host must pick one */}
            <div className="space-y-3">
              <div>
                <Label>Cancellation policy</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Travelers see this before they accept your terms. Every host
                  has one.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                        "rounded-xl border p-3 text-left transition-colors",
                        active
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "hover:border-primary/40"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-full border-2",
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
                      <p className="mt-1 text-xs text-muted-foreground">
                        {preset.headline}
                      </p>
                    </button>
                  );
                })}
                {(() => {
                  const active = cancelPreset === "custom";
                  return (
                    <button
                      type="button"
                      onClick={() => setCancelPreset("custom")}
                      className={cn(
                        "rounded-xl border p-3 text-left transition-colors sm:col-span-2",
                        active
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "hover:border-primary/40"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-full border-2",
                            active
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/40"
                          )}
                        >
                          {active && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <span className="font-semibold text-sm">Custom</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Write your own refund rules below.
                      </p>
                    </button>
                  );
                })()}
              </div>
              {cancelPreset === "custom" && (
                <textarea
                  value={cancelCustom}
                  onChange={(e) => setCancelCustom(e.target.value)}
                  placeholder="Describe your refund rules — e.g. 'Full refund up to 21 days before. No refunds after.'"
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              )}
            </div>

            <div className="border-t pt-5 space-y-2">
              <Label htmlFor="terms-title">Title (optional)</Label>
              <Input
                id="terms-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sofia's Trip Terms"
                maxLength={80}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="terms-content">Terms content</Label>
                <div className="flex items-center gap-2">
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
                    className="h-8 gap-1.5 text-xs"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload .txt / .md
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleLoadTemplate}
                    className="h-8 text-xs"
                  >
                    Load template
                  </Button>
                </div>
              </div>
              <textarea
                id="terms-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste or write your terms here. Travelers will see this exact text when they click &quot;Join this trip&quot;."
                rows={18}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {charCount.toLocaleString()} character
                  {charCount === 1 ? "" : "s"}
                </span>
                {updatedAt && (
                  <span>
                    Last saved{" "}
                    {new Date(updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    at{" "}
                    {new Date(updatedAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t">
              <div className="flex items-center gap-2">
                {hydrated && updatedAt && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCancelPreviewOpen(true)}
                  className="h-10 gap-1.5"
                >
                  <Eye className="h-4 w-4" />
                  Preview policy
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewOpen(true)}
                  disabled={!hasContent}
                  className="h-10 gap-1.5"
                >
                  <Eye className="h-4 w-4" />
                  Preview terms
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSave}
                  disabled={!hasContent || !dirty}
                  className="h-10 gap-1.5 min-w-[140px] justify-center"
                >
                  {savedToast ? (
                    <>
                      <Check className="h-4 w-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {updatedAt ? "Save changes" : "Save terms"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Status summary */}
          <div className="mt-4 rounded-xl border p-4 text-sm bg-muted/30">
            {updatedAt ? (
              <p>
                <span className="font-semibold">Live:</span> Travelers joining
                your trips will see your custom terms.
              </p>
            ) : (
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Not set:
                </span>{" "}
                Travelers currently see Pack &amp; Pally&apos;s default terms
                when joining your trips.
              </p>
            )}
          </div>
        </div>
      </Container>

      <TermsModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onAccept={() => setPreviewOpen(false)}
        bookingType="trip"
        customTerms={{
          title: title || undefined,
          content,
          authorName: CURRENT_PARTNER.name,
          updatedAt: updatedAt || undefined,
        }}
      />

      <CancellationPolicyModal
        open={cancelPreviewOpen}
        onClose={() => setCancelPreviewOpen(false)}
        policy={policy}
        hostName={CURRENT_PARTNER.name}
      />
    </section>
  );
}
