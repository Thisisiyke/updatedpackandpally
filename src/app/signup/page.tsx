"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { WebSocialAuthRows } from "@/components/auth/web-social-auth";
import {
  validateSignupEmail,
  validateSignupName,
  validateSignupPassword,
} from "@/lib/auth-validation";

async function readJson(res: Response): Promise<{ error?: string } & Record<string, unknown>> {
  try {
    return (await res.json()) as { error?: string } & Record<string, unknown>;
  } catch {
    return { error: `Request failed (${res.status})` };
  }
}

function SignUpForm() {
  const router = useRouter();
  const [skipEmailVerification, setSkipEmailVerification] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [registered, setRegistered] = useState(false);

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/auth/signup/options")
      .then((r) => r.json())
      .then((d: { skipEmailVerification?: boolean }) => {
        if (!cancelled && d.skipEmailVerification) {
          setSkipEmailVerification(true);
          setEmailVerified(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  function validateFormFields(): string | null {
    if (!validateSignupName(firstName)) {
      return "First name must be 2–50 characters (letters and common punctuation).";
    }
    if (!validateSignupName(lastName)) {
      return "Last name must be 2–50 characters (letters and common punctuation).";
    }
    if (!validateSignupEmail(email.trim())) {
      return "Enter a valid email address.";
    }
    if (!validateSignupPassword(password)) {
      return "Password must be at least 6 characters (max 128).";
    }
    if (!termsAccepted) {
      return "Please accept the Terms of Service and Privacy Policy.";
    }
    return null;
  }

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    const v = validateFormFields();
    if (v) {
      setError(v);
      return;
    }
    setSendingOtp(true);
    try {
      const res = await fetch("/api/auth/signup/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await readJson(res);
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not send email.");
        return;
      }
      if (data.skipped) {
        setEmailVerified(true);
        setOtpSent(false);
        setInfo(
          typeof data.message === "string"
            ? data.message
            : "Email verification is skipped in this environment."
        );
        return;
      }
      setOtpSent(true);
      setOtp("");
      setInfo("Check your inbox for a 6-digit code (and spam). Enter it below.");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const code = otp.trim();
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await fetch("/api/auth/signup/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: code }),
      });
      const data = await readJson(res);
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Verification failed.");
        return;
      }
      setEmailVerified(true);
      setInfo("Email verified. You can create your account below.");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setVerifyingOtp(false);
    }
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    const v = validateFormFields();
    if (v) {
      setError(v);
      return;
    }
    if (!skipEmailVerification && !emailVerified) {
      setError("Verify your email with the code we sent first.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const data = await readJson(res);
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Signup failed");
        return;
      }
      setRegistered(true);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (registered) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-9 w-9 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold">You&apos;re registered</h1>
          <p className="text-sm text-muted-foreground">
            Your account was created. Sign in with your email and password to continue — same as the
            Pack &amp; Pally app after signup.
          </p>
          <Button className="w-full h-11" size="lg" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const canSendEmail = termsAccepted && !loading;
  const showOtpSection = !skipEmailVerification && otpSent && !emailVerified;
  const canSubmitAccount =
    termsAccepted &&
    (skipEmailVerification || emailVerified) &&
    !sendingOtp &&
    !verifyingOtp;

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <div className="flex justify-center mb-6">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Pack & Pally"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
              <span className="text-xl font-bold font-heading">Pack & Pally</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-center">Create your account</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Register the same way as the mobile app: verify your email, then sign up.
          </p>

          {info && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
              {info}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateAccount} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  autoComplete="given-name"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  autoComplete="family-name"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setOtpSent(false);
                  setEmailVerified(skipEmailVerification);
                  setOtp("");
                }}
                placeholder="you@example.com"
                autoComplete="email"
                required
                disabled={loading || (!!emailVerified && !skipEmailVerification)}
              />
              {emailVerified && !skipEmailVerification ? (
                <p className="text-xs text-emerald-700 font-medium">Email verified</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            {!skipEmailVerification && (
              <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Step 1 — We&apos;ll email you a one-time code (same API as the app:
                  /signUp/send-SignupEmail).
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  disabled={!canSendEmail || sendingOtp || emailVerified}
                  onClick={(e) => void handleSendEmail(e)}
                >
                  {sendingOtp ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : emailVerified ? (
                    "Email verified"
                  ) : (
                    "Send verification email"
                  )}
                </Button>

                {showOtpSection ? (
                  <div className="space-y-2 pt-1">
                    <Label htmlFor="otp">6-digit code</Label>
                    <Input
                      id="otp"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="000000"
                      disabled={verifyingOtp}
                    />
                    <Button
                      type="button"
                      className="w-full"
                      disabled={verifyingOtp || otp.length !== 6}
                      onClick={(e) => void handleVerifyOtp(e)}
                    >
                      {verifyingOtp ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Verifying…
                        </>
                      ) : (
                        "Verify email"
                      )}
                    </Button>
                  </div>
                ) : null}
              </div>
            )}

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(v) => setTermsAccepted(v === true)}
                disabled={loading}
              />
              <Label htmlFor="terms" className="text-sm font-normal leading-snug cursor-pointer">
                I agree to the{" "}
                <Link
                  href="https://packandpally.com/terms-of-service/"
                  className="underline underline-offset-2 text-primary"
                  target="_blank"
                  rel="noreferrer"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="https://packandpally.com/privacy-policy/"
                  className="underline underline-offset-2 text-primary"
                  target="_blank"
                  rel="noreferrer"
                >
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <Button
              className="w-full h-11 gap-2"
              size="lg"
              type="submit"
              disabled={loading || !canSubmitAccount}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
              or continue with
            </span>
          </div>

          <WebSocialAuthRows
            disabled={loading || sendingOtp || verifyingOtp}
            onError={(msg) => {
              setInfo("");
              setError(msg);
            }}
            onSignedIn={async () => {
              setInfo("");
              setError("");
              router.push("/dashboard");
              router.refresh();
            }}
          />

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center text-muted-foreground text-sm gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
