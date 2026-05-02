"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Mail, Lock, Eye, EyeOff, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { usePackPallyAuth } from "@/components/providers/session-provider";
import {
  WebSocialAuthRows,
  type SocialSignInDetail,
} from "@/components/auth/web-social-auth";

async function readJson(res: Response): Promise<{ error?: string } & Record<string, unknown>> {
  try {
    return (await res.json()) as { error?: string } & Record<string, unknown>;
  } catch {
    return { error: `Request failed (${res.status})` };
  }
}

function MobileAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = usePackPallyAuth();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  /** `null` until /api/auth/signup/options loads — avoids flashing the wrong signup UI. */
  const [skipEmailVerification, setSkipEmailVerification] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/auth/signup/options")
      .then((r) => r.json())
      .then((d: { skipEmailVerification?: boolean }) => {
        if (!cancelled) setSkipEmailVerification(!!d.skipEmailVerification);
      })
      .catch(() => {
        if (!cancelled) setSkipEmailVerification(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function goHomeAfterAuth() {
    try {
      sessionStorage.setItem("packpally_just_signed_in", "1");
    } catch {
      /* ignore */
    }
    await refresh();
    router.push("/mobile/home");
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: email.trim(), password }),
        });
        const data = await readJson(res);
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : "Sign in failed");
          return;
        }
        await goHomeAfterAuth();
        return;
      }

      if (skipEmailVerification === false) {
        setError("Use the signup screen with email verification (same flow as the app).");
        return;
      }

      if (!skipEmailVerification) {
        setError("Checking signup options…");
        return;
      }

      const parts = fullName.trim().split(/\s+/);
      const firstName = parts[0] || "Traveler";
      const lastName = parts.slice(1).join(" ") || "User";

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName,
          lastName,
          email: email.trim(),
          password,
        }),
      });
      const data = await readJson(res);
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Sign up failed");
        return;
      }
      if (data.needsLogin) {
        setError(
          typeof data.message === "string"
            ? data.message
            : "Account created. Sign in with your password."
        );
        setMode("login");
        setPassword("");
        return;
      }
      await goHomeAfterAuth();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGuest() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/guest", {
        method: "POST",
        credentials: "include",
      });
      const data = await readJson(res);
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not continue as guest");
        return;
      }
      await goHomeAfterAuth();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialDone(detail?: SocialSignInDetail) {
    setError("");
    await goHomeAfterAuth();
    if (detail?.displayName) {
      try {
        sessionStorage.setItem("packpally_welcome_name", detail.displayName);
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <div className="h-full min-h-[844px] flex flex-col bg-white">
      <div className="flex items-center gap-2 px-4 py-3 md:pt-14">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/50 hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 px-6 pt-4">
        <div className="flex flex-col items-center mb-8">
          <div className="relative h-12 w-12 mb-3">
            <Image src="/logo.png" alt="" fill className="object-contain" sizes="48px" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight font-heading">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login"
              ? "Sign in to continue your adventures"
              : "Start your journey with Pack & Pally"}
          </p>
        </div>

        <div className="flex rounded-xl bg-muted p-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm font-semibold transition-all",
              mode === "login" ? "bg-white shadow-sm" : "text-muted-foreground"
            )}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
            }}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm font-semibold transition-all",
              mode === "signup" ? "bg-white shadow-sm" : "text-muted-foreground"
            )}
          >
            Sign up
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
            {error}
          </div>
        )}

        {mode === "signup" && skipEmailVerification === null ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : mode === "signup" && skipEmailVerification === false ? (
          <div className="rounded-xl border bg-muted/30 p-4 space-y-3 mb-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Email/password signup uses the same steps as the Pack &amp; Pally app: we send a code to
              your inbox, then you create your account (wanderly{" "}
              <code className="text-[10px] bg-muted px-1 rounded">send-SignupEmail</code> →{" "}
              <code className="text-[10px] bg-muted px-1 rounded">signupDetails</code>
              ).
            </p>
            <Button className="w-full h-12" size="lg" asChild>
              <Link href="/signup">Continue to signup</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Full name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Jane Doe"
                    className="pl-9 h-12"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-9 h-12"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Password</Label>
                {mode === "login" && (
                  <Link href="#" className="text-xs text-primary font-medium">
                    Forgot?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "At least 6 characters" : "Enter password"}
                  className="pl-9 pr-9 h-12"
                  required
                  minLength={6}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full h-12 text-base gap-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : mode === "login" ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        )}

        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-muted-foreground">
            or continue with
          </span>
        </div>

        <div className="rounded-xl border border-dashed border-muted-foreground/25 bg-muted/20 p-3">
          <p className="text-[10px] text-center text-muted-foreground mb-3">
            Google and Apple use the same wanderly-1 account as the mobile app.
          </p>
          <WebSocialAuthRows
            disabled={loading}
            onError={setError}
            onSignedIn={handleSocialDone}
          />
        </div>

        {mode === "signup" && (
          <p className="mt-6 text-center text-xs text-muted-foreground leading-relaxed">
            By signing up you agree to our <span className="text-primary">Terms</span> and{" "}
            <span className="text-primary">Privacy Policy</span>.
          </p>
        )}
      </div>

      <div className="p-6 pb-8 md:pb-10 space-y-2">
        <Button
          variant="outline"
          className="w-full"
          type="button"
          disabled={loading}
          onClick={() => void handleGuest()}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Continue as guest
        </Button>
        <Button variant="ghost" className="w-full text-muted-foreground text-xs" type="button" asChild>
          <Link href="/login">Open full web login</Link>
        </Button>
      </div>
    </div>
  );
}

export default function MobileAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-[844px] items-center justify-center text-sm text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      }
    >
      <MobileAuthContent />
    </Suspense>
  );
}
