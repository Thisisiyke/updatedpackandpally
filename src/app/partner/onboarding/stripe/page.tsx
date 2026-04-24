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
  { key: "business", label: "Business type", icon: Building2 },
  { key: "personal", label: "Personal details", icon: User },
  { key: "bank", label: "Bank account", icon: Landmark },
  { key: "review", label: "Review", icon: ShieldCheck },
];

function StripeConnectFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safePartnerNext(searchParams.get("next"));
  const [step, setStep] = useState<Step>("business");

  // Business
  const [businessType, setBusinessType] = useState<"individual" | "company">(
    "individual"
  );
  const [country, setCountry] = useState("United States");

  // Personal
  const [legalName, setLegalName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [ssnLast4, setSsnLast4] = useState("");

  // Bank
  const [routing, setRouting] = useState("");
  const [account, setAccount] = useState("");
  const [accountConfirm, setAccountConfirm] = useState("");

  useEffect(() => {
    if (isStripeConnected()) {
      router.replace(next);
    }
  }, [router, next]);

  const currentStepIndex =
    STEPS.findIndex((s) => s.key === step) === -1 ? 3 : STEPS.findIndex((s) => s.key === step);

  const handleProcess = async () => {
    setStep("processing");
    await new Promise((r) => setTimeout(r, 2600));
    markStripeConnected();
    setStep("success");
    await new Promise((r) => setTimeout(r, 1600));
    router.replace(next);
  };

  const canContinuePersonal =
    legalName.trim() && dob && address.trim() && city.trim() && postal.trim() && ssnLast4.length === 4;
  const canContinueBank =
    routing.length >= 9 && account.length >= 6 && account === accountConfirm;

  return (
    <div className="min-h-screen bg-[#f6f9fc] flex flex-col">
      {/* Stripe-style top bar */}
      <header className="bg-white border-b border-[#e3e8ee]">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <StripeWordmark />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#697386]">
            <Lock className="h-3.5 w-3.5" />
            Secure onboarding
          </div>
        </div>
      </header>

      {/* Progress */}
      {step !== "processing" && step !== "success" && (
        <div className="bg-white border-b border-[#e3e8ee]">
          <div className="mx-auto max-w-3xl px-6 py-4">
            <div className="flex items-center gap-2">
              {STEPS.map((s, i) => {
                const done = i < currentStepIndex;
                const active = i === currentStepIndex;
                return (
                  <div key={s.key} className="flex items-center flex-1">
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold shrink-0 border",
                          done && "bg-[#635BFF] text-white border-[#635BFF]",
                          active && "bg-white text-[#635BFF] border-[#635BFF]",
                          !done && !active && "bg-white text-[#697386] border-[#e3e8ee]"
                        )}
                      >
                        {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                      </div>
                      <span
                        className={cn(
                          "text-xs font-medium hidden sm:inline",
                          (done || active) ? "text-[#1a1f36]" : "text-[#697386]"
                        )}
                      >
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className={cn(
                          "h-px flex-1 mx-2",
                          done ? "bg-[#635BFF]" : "bg-[#e3e8ee]"
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-10">
          {step === "business" && (
            <Card>
              <h1 className="text-2xl font-bold text-[#1a1f36]">
                Tell us about your business
              </h1>
              <p className="mt-1 text-sm text-[#697386]">
                This helps us tailor your account to the payouts you&apos;ll
                receive.
              </p>

              <div className="mt-6 space-y-5">
                <div>
                  <Label className="text-[#1a1f36]">Country</Label>
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
                  <Label className="text-[#1a1f36] mb-2 block">
                    Type of entity
                  </Label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <OptionCard
                      selected={businessType === "individual"}
                      onClick={() => setBusinessType("individual")}
                      icon={<User className="h-5 w-5 text-[#635BFF]" />}
                      title="Individual / Sole proprietor"
                      description="You host trips in your own name"
                    />
                    <OptionCard
                      selected={businessType === "company"}
                      onClick={() => setBusinessType("company")}
                      icon={<Building2 className="h-5 w-5 text-[#635BFF]" />}
                      title="Company"
                      description="You host under a registered business"
                    />
                  </div>
                </div>
              </div>

              <Footer
                right={
                  <StripeButton onClick={() => setStep("personal")}>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </StripeButton>
                }
              />
            </Card>
          )}

          {step === "personal" && (
            <Card>
              <h1 className="text-2xl font-bold text-[#1a1f36]">
                Personal details
              </h1>
              <p className="mt-1 text-sm text-[#697386]">
                We verify your identity to keep the platform secure.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <Label className="text-[#1a1f36]">Legal name</Label>
                  <Input
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="Jane A. Doe"
                    className="mt-1 border-[#e3e8ee]"
                  />
                </div>
                <div>
                  <Label className="text-[#1a1f36]">Date of birth</Label>
                  <Input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="mt-1 border-[#e3e8ee]"
                  />
                </div>
                <div>
                  <Label className="text-[#1a1f36]">Home address</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St"
                    className="mt-1 border-[#e3e8ee]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[#1a1f36]">City</Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Austin"
                      className="mt-1 border-[#e3e8ee]"
                    />
                  </div>
                  <div>
                    <Label className="text-[#1a1f36]">Postal code</Label>
                    <Input
                      value={postal}
                      onChange={(e) => setPostal(e.target.value)}
                      placeholder="78701"
                      className="mt-1 border-[#e3e8ee]"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-[#1a1f36]">
                    Last 4 of SSN / Tax ID
                  </Label>
                  <Input
                    value={ssnLast4}
                    onChange={(e) =>
                      setSsnLast4(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    placeholder="••••"
                    inputMode="numeric"
                    className="mt-1 border-[#e3e8ee] font-mono tracking-widest"
                    maxLength={4}
                  />
                  <p className="mt-1 text-xs text-[#697386]">
                    Stripe uses this to verify your identity. Encrypted at rest.
                  </p>
                </div>
              </div>

              <Footer
                left={
                  <button
                    onClick={() => setStep("business")}
                    className="flex items-center gap-1 text-sm text-[#635BFF] font-medium"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                }
                right={
                  <StripeButton
                    onClick={() => setStep("bank")}
                    disabled={!canContinuePersonal}
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </StripeButton>
                }
              />
            </Card>
          )}

          {step === "bank" && (
            <Card>
              <h1 className="text-2xl font-bold text-[#1a1f36]">
                Add your bank account
              </h1>
              <p className="mt-1 text-sm text-[#697386]">
                This is where Pack & Pally will send your payouts.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <Label className="text-[#1a1f36]">Routing number</Label>
                  <Input
                    value={routing}
                    onChange={(e) =>
                      setRouting(e.target.value.replace(/\D/g, "").slice(0, 9))
                    }
                    placeholder="110000000"
                    inputMode="numeric"
                    className="mt-1 border-[#e3e8ee] font-mono"
                    maxLength={9}
                  />
                </div>
                <div>
                  <Label className="text-[#1a1f36]">Account number</Label>
                  <Input
                    value={account}
                    onChange={(e) =>
                      setAccount(e.target.value.replace(/\D/g, "").slice(0, 17))
                    }
                    placeholder="000123456789"
                    inputMode="numeric"
                    className="mt-1 border-[#e3e8ee] font-mono"
                  />
                </div>
                <div>
                  <Label className="text-[#1a1f36]">Confirm account number</Label>
                  <Input
                    value={accountConfirm}
                    onChange={(e) =>
                      setAccountConfirm(
                        e.target.value.replace(/\D/g, "").slice(0, 17)
                      )
                    }
                    placeholder="000123456789"
                    inputMode="numeric"
                    className="mt-1 border-[#e3e8ee] font-mono"
                  />
                  {account && accountConfirm && account !== accountConfirm && (
                    <p className="mt-1 text-xs text-red-600">
                      Account numbers don&apos;t match.
                    </p>
                  )}
                </div>

                <div className="rounded-md bg-[#f6f9fc] border border-[#e3e8ee] p-3 text-xs text-[#697386] flex items-start gap-2">
                  <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  Stripe encrypts your bank details end-to-end. Pack & Pally never
                  sees this information.
                </div>
              </div>

              <Footer
                left={
                  <button
                    onClick={() => setStep("personal")}
                    className="flex items-center gap-1 text-sm text-[#635BFF] font-medium"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                }
                right={
                  <StripeButton
                    onClick={() => setStep("review")}
                    disabled={!canContinueBank}
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </StripeButton>
                }
              />
            </Card>
          )}

          {step === "review" && (
            <Card>
              <h1 className="text-2xl font-bold text-[#1a1f36]">
                Review and submit
              </h1>
              <p className="mt-1 text-sm text-[#697386]">
                Make sure everything looks right. Stripe may request additional
                info later if needed.
              </p>

              <div className="mt-6 space-y-3 text-sm">
                <ReviewRow label="Country" value={country} />
                <ReviewRow
                  label="Entity"
                  value={businessType === "individual" ? "Individual" : "Company"}
                />
                <ReviewRow label="Legal name" value={legalName} />
                <ReviewRow
                  label="Address"
                  value={`${address}, ${city} ${postal}`}
                />
                <ReviewRow
                  label="Tax ID"
                  value={`••• •• ${ssnLast4}`}
                  mono
                />
                <ReviewRow
                  label="Bank"
                  value={`Routing ${routing.slice(0, 3)}••• · Acct ••••${account.slice(-4)}`}
                  mono
                />
              </div>

              <div className="mt-5 rounded-md bg-[#f6f9fc] border border-[#e3e8ee] p-3 text-xs text-[#697386]">
                By submitting, you agree to Stripe&apos;s{" "}
                <span className="text-[#635BFF] underline underline-offset-2">
                  Services Agreement
                </span>{" "}
                and{" "}
                <span className="text-[#635BFF] underline underline-offset-2">
                  Connected Account Agreement
                </span>
                .
              </div>

              <Footer
                left={
                  <button
                    onClick={() => setStep("bank")}
                    className="flex items-center gap-1 text-sm text-[#635BFF] font-medium"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                }
                right={
                  <StripeButton onClick={handleProcess}>
                    Submit
                    <ArrowRight className="h-4 w-4" />
                  </StripeButton>
                }
              />
            </Card>
          )}

          {step === "processing" && (
            <Card>
              <div className="py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#635BFF]/10">
                  <Loader2 className="h-7 w-7 text-[#635BFF] animate-spin" />
                </div>
                <h2 className="mt-5 text-xl font-bold text-[#1a1f36]">
                  Verifying your account
                </h2>
                <p className="mt-2 text-sm text-[#697386]">
                  This usually takes a few seconds…
                </p>
              </div>
            </Card>
          )}

          {step === "success" && (
            <Card>
              <div className="py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                  <Check className="h-7 w-7 text-emerald-600" />
                </div>
                <h2 className="mt-5 text-xl font-bold text-[#1a1f36]">
                  You&apos;re all set
                </h2>
                <p className="mt-2 text-sm text-[#697386]">
                  {next === "/partner"
                    ? "Redirecting you to your partner dashboard…"
                    : "Taking you where you left off…"}
                </p>
              </div>
            </Card>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-[#697386]">
        Powered by Stripe · Pack &amp; Pally partner onboarding
      </footer>
    </div>
  );
}

export default function StripeConnectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f6f9fc] flex items-center justify-center text-sm text-[#697386]">
          Loading…
        </div>
      }
    >
      <StripeConnectFlow />
    </Suspense>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white border border-[#e3e8ee] shadow-sm p-6 sm:p-8">
      {children}
    </div>
  );
}

function Footer({
  left,
  right,
}: {
  left?: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

function OptionCard({
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
        "rounded-lg border p-4 text-left transition-all",
        selected
          ? "border-[#635BFF] bg-[#635BFF]/5 ring-2 ring-[#635BFF]/15"
          : "border-[#e3e8ee] hover:border-[#635BFF]/60"
      )}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-semibold text-sm text-[#1a1f36]">{title}</span>
      </div>
      <p className="mt-2 text-xs text-[#697386]">{description}</p>
    </button>
  );
}

function ReviewRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-[#e3e8ee] last:border-0">
      <span className="text-[#697386]">{label}</span>
      <span
        className={cn(
          "text-[#1a1f36] font-medium text-right",
          mono && "font-mono"
        )}
      >
        {value}
      </span>
    </div>
  );
}

function StripeButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="h-10 gap-2 bg-[#635BFF] hover:bg-[#4f46e5] text-white px-5 shadow-sm disabled:opacity-60"
    >
      {children}
    </Button>
  );
}

function StripeWordmark() {
  return (
    <span className="text-[#635BFF] text-xl font-bold tracking-tight">
      stripe
    </span>
  );
}
