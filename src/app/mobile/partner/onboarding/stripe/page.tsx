"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Lock,
  Building2,
  User,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  markStripeConnected,
  isStripeConnected,
  safePartnerNext,
} from "@/lib/partner-stripe";

type Step = "business" | "personal" | "bank" | "review" | "processing" | "success";

const STEPS: { key: Step; label: string; icon: typeof User }[] = [
  { key: "business", label: "Business", icon: Building2 },
  { key: "personal", label: "Personal", icon: User },
  { key: "bank", label: "Bank", icon: Landmark },
  { key: "review", label: "Review", icon: ShieldCheck },
];

function StripeFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safePartnerNext(searchParams.get("next"), "/mobile/partner");

  const [step, setStep] = useState<Step>("business");

  const [businessType, setBusinessType] = useState<"individual" | "company">(
    "individual"
  );
  const [country, setCountry] = useState("United States");

  const [legalName, setLegalName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [ssnLast4, setSsnLast4] = useState("");

  const [routing, setRouting] = useState("");
  const [account, setAccount] = useState("");
  const [accountConfirm, setAccountConfirm] = useState("");

  useEffect(() => {
    if (isStripeConnected()) router.replace(next);
  }, [router, next]);

  const currentStepIndex =
    STEPS.findIndex((s) => s.key === step) === -1
      ? 3
      : STEPS.findIndex((s) => s.key === step);

  const canContinuePersonal =
    legalName.trim() &&
    dob &&
    address.trim() &&
    city.trim() &&
    postal.trim() &&
    ssnLast4.length === 4;
  const canContinueBank =
    routing.length >= 9 && account.length >= 6 && account === accountConfirm;

  const handleProcess = async () => {
    setStep("processing");
    await new Promise((r) => setTimeout(r, 2400));
    markStripeConnected();
    setStep("success");
    await new Promise((r) => setTimeout(r, 1500));
    router.replace(next);
  };

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-[#f6f9fc]">
      {/* Stripe top bar */}
      <header className="bg-white border-b border-[#e3e8ee] h-12 flex items-center justify-between px-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-[#635BFF] text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-0.5" />
          Back
        </button>
        <span className="text-[#635BFF] text-lg font-bold tracking-tight">
          stripe
        </span>
        <div className="flex items-center gap-1 text-[10px] text-[#697386]">
          <Lock className="h-3 w-3" />
          Secure
        </div>
      </header>

      {/* Step dots */}
      {step !== "processing" && step !== "success" && (
        <div className="bg-white border-b border-[#e3e8ee] px-4 py-3">
          <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => {
              const done = i < currentStepIndex;
              const active = i === currentStepIndex;
              return (
                <div key={s.key} className="flex items-center flex-1 gap-1">
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold shrink-0 border",
                      done && "bg-[#635BFF] text-white border-[#635BFF]",
                      active && "bg-white text-[#635BFF] border-[#635BFF]",
                      !done &&
                        !active &&
                        "bg-white text-[#697386] border-[#e3e8ee]"
                    )}
                  >
                    {done ? <Check className="h-3 w-3" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium truncate",
                      done || active
                        ? "text-[#1a1f36]"
                        : "text-[#697386]"
                    )}
                  >
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "h-px flex-1",
                        done ? "bg-[#635BFF]" : "bg-[#e3e8ee]"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        {step === "business" && (
          <Card>
            <h1 className="text-lg font-bold text-[#1a1f36]">
              Tell us about your business
            </h1>
            <p className="mt-1 text-xs text-[#697386]">
              Tailors your account to the payouts you&apos;ll receive.
            </p>
            <div className="mt-5 space-y-4">
              <div>
                <Label className="text-[#1a1f36] text-xs">Country</Label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#e3e8ee] bg-white px-3 py-2 text-sm"
                >
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>Australia</option>
                  <option>Germany</option>
                  <option>France</option>
                  <option>Spain</option>
                  <option>Italy</option>
                </select>
              </div>
              <div>
                <Label className="text-[#1a1f36] text-xs mb-2 block">
                  Type of entity
                </Label>
                <div className="space-y-2">
                  <OptionTile
                    selected={businessType === "individual"}
                    onClick={() => setBusinessType("individual")}
                    icon={<User className="h-4 w-4 text-[#635BFF]" />}
                    title="Individual / Sole proprietor"
                    description="You host trips in your own name"
                  />
                  <OptionTile
                    selected={businessType === "company"}
                    onClick={() => setBusinessType("company")}
                    icon={<Building2 className="h-4 w-4 text-[#635BFF]" />}
                    title="Company"
                    description="You host under a registered business"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {step === "personal" && (
          <Card>
            <h1 className="text-lg font-bold text-[#1a1f36]">
              Personal details
            </h1>
            <p className="mt-1 text-xs text-[#697386]">
              We verify your identity to keep the platform secure.
            </p>
            <div className="mt-5 space-y-3">
              <Field label="Legal name">
                <Input
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="Jane A. Doe"
                  className="border-[#e3e8ee]"
                />
              </Field>
              <Field label="Date of birth">
                <Input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="border-[#e3e8ee]"
                />
              </Field>
              <Field label="Home address">
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St"
                  className="border-[#e3e8ee]"
                />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="City">
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Austin"
                    className="border-[#e3e8ee]"
                  />
                </Field>
                <Field label="Postal">
                  <Input
                    value={postal}
                    onChange={(e) => setPostal(e.target.value)}
                    placeholder="78701"
                    className="border-[#e3e8ee]"
                  />
                </Field>
              </div>
              <Field label="Last 4 of SSN / Tax ID">
                <Input
                  value={ssnLast4}
                  onChange={(e) =>
                    setSsnLast4(
                      e.target.value.replace(/\D/g, "").slice(0, 4)
                    )
                  }
                  placeholder="••••"
                  inputMode="numeric"
                  className="border-[#e3e8ee] font-mono tracking-widest"
                  maxLength={4}
                />
              </Field>
              <p className="text-[10px] text-[#697386]">
                Stripe uses this to verify your identity. Encrypted at rest.
              </p>
            </div>
          </Card>
        )}

        {step === "bank" && (
          <Card>
            <h1 className="text-lg font-bold text-[#1a1f36]">
              Add your bank account
            </h1>
            <p className="mt-1 text-xs text-[#697386]">
              Where Pack &amp; Pally sends your payouts.
            </p>
            <div className="mt-5 space-y-3">
              <Field label="Routing number">
                <Input
                  value={routing}
                  onChange={(e) =>
                    setRouting(e.target.value.replace(/\D/g, "").slice(0, 9))
                  }
                  placeholder="110000000"
                  inputMode="numeric"
                  className="border-[#e3e8ee] font-mono"
                  maxLength={9}
                />
              </Field>
              <Field label="Account number">
                <Input
                  value={account}
                  onChange={(e) =>
                    setAccount(
                      e.target.value.replace(/\D/g, "").slice(0, 17)
                    )
                  }
                  placeholder="000123456789"
                  inputMode="numeric"
                  className="border-[#e3e8ee] font-mono"
                />
              </Field>
              <Field label="Confirm account number">
                <Input
                  value={accountConfirm}
                  onChange={(e) =>
                    setAccountConfirm(
                      e.target.value.replace(/\D/g, "").slice(0, 17)
                    )
                  }
                  placeholder="000123456789"
                  inputMode="numeric"
                  className="border-[#e3e8ee] font-mono"
                />
              </Field>
              {account && accountConfirm && account !== accountConfirm && (
                <p className="text-[11px] text-red-600">
                  Account numbers don&apos;t match.
                </p>
              )}
              <div className="rounded-md bg-[#f6f9fc] border border-[#e3e8ee] p-2 text-[11px] text-[#697386] flex items-start gap-1.5">
                <Lock className="h-3 w-3 mt-0.5 shrink-0" />
                Stripe encrypts your bank details end-to-end.
              </div>
            </div>
          </Card>
        )}

        {step === "review" && (
          <Card>
            <h1 className="text-lg font-bold text-[#1a1f36]">
              Review and submit
            </h1>
            <p className="mt-1 text-xs text-[#697386]">
              Stripe may request additional info later if needed.
            </p>
            <div className="mt-5 space-y-2 text-sm">
              <Row label="Country" value={country} />
              <Row
                label="Entity"
                value={
                  businessType === "individual" ? "Individual" : "Company"
                }
              />
              <Row label="Legal name" value={legalName} />
              <Row label="Address" value={`${address}, ${city} ${postal}`} />
              <Row label="Tax ID" value={`••• •• ${ssnLast4}`} mono />
              <Row
                label="Bank"
                value={`Routing ${routing.slice(0, 3)}••• · Acct ••••${account.slice(-4)}`}
                mono
              />
            </div>
            <div className="mt-4 rounded-md bg-[#f6f9fc] border border-[#e3e8ee] p-3 text-[11px] text-[#697386]">
              By submitting, you agree to Stripe&apos;s{" "}
              <span className="text-[#635BFF] underline underline-offset-2">
                Services Agreement
              </span>
              .
            </div>
          </Card>
        )}

        {step === "processing" && (
          <Card>
            <div className="py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#635BFF]/10">
                <Loader2 className="h-6 w-6 text-[#635BFF] animate-spin" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-[#1a1f36]">
                Verifying your account
              </h2>
              <p className="mt-2 text-xs text-[#697386]">
                This takes a few seconds…
              </p>
            </div>
          </Card>
        )}

        {step === "success" && (
          <Card>
            <div className="py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <Check className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-[#1a1f36]">
                You&apos;re all set
              </h2>
              <p className="mt-2 text-xs text-[#697386]">
                {next === "/mobile/partner"
                  ? "Taking you to your partner dashboard…"
                  : "Taking you where you left off…"}
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Sticky footer buttons */}
      {step !== "processing" && step !== "success" && (
        <div className="sticky bottom-0 bg-white border-t border-[#e3e8ee] px-4 py-3 flex items-center gap-2 md:pb-6">
          {step !== "business" && (
            <Button
              variant="outline"
              onClick={() =>
                setStep(
                  step === "personal"
                    ? "business"
                    : step === "bank"
                    ? "personal"
                    : "bank"
                )
              }
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          {step === "business" && (
            <Button
              onClick={() => setStep("personal")}
              className="flex-1 bg-[#635BFF] hover:bg-[#4f46e5]"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {step === "personal" && (
            <Button
              onClick={() => setStep("bank")}
              disabled={!canContinuePersonal}
              className="flex-1 bg-[#635BFF] hover:bg-[#4f46e5]"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {step === "bank" && (
            <Button
              onClick={() => setStep("review")}
              disabled={!canContinueBank}
              className="flex-1 bg-[#635BFF] hover:bg-[#4f46e5]"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {step === "review" && (
            <Button
              onClick={handleProcess}
              className="flex-1 bg-[#635BFF] hover:bg-[#4f46e5]"
            >
              Submit
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white border border-[#e3e8ee] shadow-sm p-5">
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
      <Label className="text-[#1a1f36] text-xs">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function OptionTile({
  selected,
  onClick,
  icon,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border p-3 text-left transition-colors",
        selected
          ? "border-[#635BFF] bg-[#635BFF]/5 ring-2 ring-[#635BFF]/15"
          : "border-[#e3e8ee]"
      )}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-semibold text-sm text-[#1a1f36]">{title}</span>
      </div>
      <p className="mt-1 text-[11px] text-[#697386]">{description}</p>
    </button>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-[#e3e8ee] last:border-0">
      <span className="text-[#697386] text-xs">{label}</span>
      <span
        className={cn(
          "text-[#1a1f36] font-medium text-right text-sm",
          mono && "font-mono text-xs"
        )}
      >
        {value}
      </span>
    </div>
  );
}

export default function MobileStripeConnectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[844px] flex items-center justify-center text-sm text-[#697386]">
          Loading…
        </div>
      }
    >
      <StripeFlow />
    </Suspense>
  );
}
