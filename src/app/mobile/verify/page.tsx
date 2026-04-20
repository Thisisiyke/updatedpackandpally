"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const mode = searchParams.get("mode") || "login";

  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleChange = (idx: number, value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 1);
    const next = [...code];
    next[idx] = clean;
    setCode(next);
    setError("");

    // Auto-advance
    if (clean && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }

    // Auto-submit when all 6 are filled
    if (clean && idx === 5 && next.every((c) => c)) {
      handleVerify(next.join(""));
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowRight" && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const next = pasted.split("");
      setCode(next);
      handleVerify(pasted);
    }
  };

  const handleVerify = async (fullCode: string) => {
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 900));

    // Mock validation: any code works for demo, but reject "000000"
    if (fullCode === "000000") {
      setError("Invalid code. Please try again.");
      setCode(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
      setLoading(false);
      return;
    }

    // Signal the home page to show its skeleton loader
    try {
      sessionStorage.setItem("packpally_just_signed_in", "1");
    } catch {}

    router.push("/mobile/home");
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
    // Could show a toast in a real app
  };

  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => `${a}${"•".repeat(Math.max(2, b.length))}${c}`)
    : "your email";

  return (
    <div className="h-full min-h-[844px] flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 md:pt-14">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/50 hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-4">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight font-heading text-center">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-muted-foreground text-center max-w-[280px]">
            We sent a 6-digit verification code to
            <br />
            <span className="font-semibold text-foreground">{maskedEmail}</span>
          </p>
        </div>

        {/* Code inputs */}
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {code.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputsRef.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              disabled={loading}
              className={cn(
                "h-14 w-12 rounded-xl border-2 text-center text-xl font-bold transition-all",
                "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                "disabled:opacity-50",
                error
                  ? "border-red-300 bg-red-50 text-red-900"
                  : digit
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-muted/30"
              )}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="mt-3 text-center text-xs text-red-600 font-medium">
            {error}
          </p>
        )}

        {/* Resend */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Didn&apos;t receive the code?{" "}
            {resendCooldown > 0 ? (
              <span className="text-muted-foreground/70">
                Resend in {resendCooldown}s
              </span>
            ) : (
              <button
                onClick={handleResend}
                className="text-primary font-semibold hover:underline"
              >
                Resend code
              </button>
            )}
          </p>
        </div>

        {/* Help */}
        <div className="mt-8 rounded-xl bg-muted/30 border p-4 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">Can&apos;t find it?</p>
          <p className="leading-relaxed">
            Check your spam folder or make sure{" "}
            <span className="font-medium text-foreground">{email}</span> is correct.
          </p>
        </div>
      </div>

      {/* Bottom */}
      <div className="p-6 pb-8 md:pb-10">
        <Button
          size="lg"
          className="w-full h-12 text-base"
          disabled={loading || code.some((c) => !c)}
          onClick={() => handleVerify(code.join(""))}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify & continue"
          )}
        </Button>
        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          Demo tip: any 6-digit code works (except 000000)
        </p>
      </div>
    </div>
  );
}

export default function MobileVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-[844px] items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
