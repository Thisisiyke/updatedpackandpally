"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Save,
  Check,
  FileText,
  Trash2,
  Upload,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getHostDefaults,
  saveHostDefaults,
  type HostDefaults,
} from "@/lib/host-defaults";
import {
  CANCELLATION_PRESETS,
  type CancellationPreset,
} from "@/lib/host-terms";
import { cn } from "@/lib/utils";

export default function DefaultsSettingsPage() {
  const [initial, setInitial] = useState<HostDefaults>({});

  const [taxRatePct, setTaxRatePct] = useState("8.25");
  const [cancellation, setCancellation] = useState<CancellationPreset>(
    "moderate"
  );
  const [partialPay, setPartialPay] = useState(false);
  const [requireId, setRequireId] = useState(false);
  const [requestSocial, setRequestSocial] = useState(false);
  const [hostPolicy, setHostPolicy] = useState("");
  const [tripPolicyPdf, setTripPolicyPdf] = useState<
    HostDefaults["tripPolicyPdf"]
  >(undefined);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [autoStatus, setAutoStatus] = useState<"publish" | "draft">("publish");
  const [savedToast, setSavedToast] = useState(false);

  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const d = getHostDefaults();
    setInitial(d);
    setTaxRatePct(
      typeof d.taxRate === "number" ? (d.taxRate * 100).toString() : "8.25"
    );
    setCancellation(d.cancellationPreset || "moderate");
    setPartialPay(!!d.partialPaymentEnabled);
    setRequireId(!!d.requireTravelerId);
    setRequestSocial(!!d.requestSocialMedia);
    setHostPolicy(d.hostPolicy || "");
    setTripPolicyPdf(d.tripPolicyPdf);
    setAutoStatus(d.newTripStatus || "publish");
  }, []);

  const dirty = useMemo(() => {
    const initialTax = initial.taxRate ?? 0.0825;
    return (
      Number(taxRatePct) / 100 !== initialTax ||
      cancellation !== (initial.cancellationPreset || "moderate") ||
      partialPay !== !!initial.partialPaymentEnabled ||
      requireId !== !!initial.requireTravelerId ||
      requestSocial !== !!initial.requestSocialMedia ||
      hostPolicy !== (initial.hostPolicy || "") ||
      JSON.stringify(tripPolicyPdf || null) !==
        JSON.stringify(initial.tripPolicyPdf || null) ||
      autoStatus !== (initial.newTripStatus || "publish")
    );
  }, [
    initial,
    taxRatePct,
    cancellation,
    partialPay,
    requireId,
    requestSocial,
    hostPolicy,
    tripPolicyPdf,
    autoStatus,
  ]);

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfError(null);
    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setPdfError("File must be a PDF.");
      if (pdfInputRef.current) pdfInputRef.current.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPdfError("Keep it under 5 MB.");
      if (pdfInputRef.current) pdfInputRef.current.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setTripPolicyPdf({
        name: file.name,
        dataUrl: String(reader.result || ""),
        sizeBytes: file.size,
      });
    reader.readAsDataURL(file);
    if (pdfInputRef.current) pdfInputRef.current.value = "";
  };

  const handleSave = () => {
    const next: HostDefaults = {
      taxRate: Number(taxRatePct) / 100,
      cancellationPreset: cancellation,
      partialPaymentEnabled: partialPay || undefined,
      requireTravelerId: requireId || undefined,
      requestSocialMedia: requestSocial || undefined,
      hostPolicy: hostPolicy.trim() || undefined,
      tripPolicyPdf,
      newTripStatus: autoStatus,
    };
    saveHostDefaults(next);
    setInitial(next);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2200);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Trip defaults</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              These pre-fill every new trip you create. You can still override
              any field per trip in the wizard.
            </p>
          </div>
        </div>
      </div>

      {/* Tax rate */}
      <Card title="Default tax rate">
        <Field label="Applied to every new trip">
          <div className="relative max-w-[160px]">
            <Input
              type="number"
              min={0}
              max={30}
              step={0.01}
              value={taxRatePct}
              onChange={(e) => setTaxRatePct(e.target.value)}
              className="pr-8 text-right font-semibold"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              %
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Pack &amp; Pally&apos;s 3% platform fee is added automatically on
            top.
          </p>
        </Field>
      </Card>

      {/* Cancellation preset */}
      <Card title="Default cancellation policy">
        <p className="text-xs text-muted-foreground mb-3">
          Travelers see this on every trip page. You can pick a different
          preset per trip.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(["flexible", "moderate", "strict"] as const).map((p) => {
            const meta = CANCELLATION_PRESETS[p];
            const active = cancellation === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setCancellation(p)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all",
                  active
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/30"
                )}
              >
                <p className="font-semibold text-sm">{meta.label}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">
                  {meta.headline}
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Partial payment + guest data */}
      <Card title="Booking defaults">
        <ToggleRow
          title="Allow partial payment"
          hint="New trips default to letting travelers split into 3 installments."
          checked={partialPay}
          onToggle={() => setPartialPay((v) => !v)}
        />
        <ToggleRow
          title="Require government ID"
          hint="Travelers must upload a passport, driver's license, or national ID before booking."
          checked={requireId}
          onToggle={() => setRequireId((v) => !v)}
        />
        <ToggleRow
          title="Ask for social media profile"
          hint="Optional Instagram / LinkedIn link so the group recognizes each other."
          checked={requestSocial}
          onToggle={() => setRequestSocial((v) => !v)}
        />
      </Card>

      {/* Default trip policy PDF */}
      <Card title="Default trip policy (PDF)">
        <p className="text-xs text-muted-foreground mb-3">
          New trips inherit this PDF unless you upload a different one in the
          wizard. Travelers can download it before joining.
        </p>
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handlePdfUpload}
          className="hidden"
        />
        {tripPolicyPdf ? (
          <div className="rounded-xl border bg-muted/30 p-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 shrink-0">
              <FileText className="h-4 w-4 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {tripPolicyPdf.name}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {tripPolicyPdf.sizeBytes
                  ? `${(tripPolicyPdf.sizeBytes / 1024).toFixed(0)} KB · PDF`
                  : "PDF"}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setTripPolicyPdf(undefined)}
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-red-600"
              aria-label="Remove PDF"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => pdfInputRef.current?.click()}
            className="flex h-24 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed text-xs text-muted-foreground gap-1.5 hover:border-primary/40 hover:text-foreground transition-colors"
          >
            <Upload className="h-4 w-4" />
            Click to upload PDF
            <span className="text-[10px]">Up to 5 MB</span>
          </button>
        )}
        {pdfError && <p className="mt-2 text-xs text-red-600">{pdfError}</p>}
      </Card>

      {/* Default host policy */}
      <Card title="Default host policy">
        <p className="text-xs text-muted-foreground mb-3">
          House rules / expectations applied to every new trip. Editable per
          trip.
        </p>
        <Textarea
          value={hostPolicy}
          onChange={(e) => setHostPolicy(e.target.value)}
          placeholder="e.g. Be on time at every meeting point. No drugs or substance abuse on the trip. Travel insurance strongly recommended…"
          rows={5}
          maxLength={1500}
        />
        <p className="mt-1 text-[10px] text-muted-foreground text-right">
          {hostPolicy.length}/1500
        </p>
      </Card>

      {/* Auto-publish vs draft */}
      <Card title="When you create a new trip">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            {
              v: "publish" as const,
              title: "Publish immediately",
              hint: "New trips go live the moment you finish the wizard.",
            },
            {
              v: "draft" as const,
              title: "Save as draft",
              hint: "New trips start hidden — publish manually when ready.",
            },
          ].map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setAutoStatus(o.v)}
              className={cn(
                "rounded-xl border p-4 text-left transition-all",
                autoStatus === o.v
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/30"
              )}
            >
              <p className="font-semibold text-sm">{o.title}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">
                {o.hint}
              </p>
            </button>
          ))}
        </div>
      </Card>

      {/* Save bar */}
      <div className="sticky bottom-0 -mx-6 lg:-mx-0 bg-white border-t px-6 lg:px-0 py-4 flex justify-end gap-2">
        <Button
          onClick={handleSave}
          disabled={!dirty}
          size="lg"
          className="gap-2"
        >
          {savedToast ? (
            <>
              <Check className="h-4 w-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save defaults
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6">
      <h3 className="font-bold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function ToggleRow({
  title,
  hint,
  checked,
  onToggle,
}: {
  title: string;
  hint: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-3 mb-2 last:mb-0">
      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
          {hint}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-primary" : "bg-muted-foreground/25"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
