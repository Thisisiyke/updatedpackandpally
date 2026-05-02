"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { usePackPallyAuth } from "@/components/providers/session-provider";
import { WebSocialAuthRows } from "@/components/auth/web-social-auth";

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  if (next.startsWith("/login")) return "/dashboard";
  return next;
}

async function readJson(res: Response): Promise<{ error?: string } & Record<string, unknown>> {
  try {
    return (await res.json()) as { error?: string } & Record<string, unknown>;
  } catch {
    return { error: `Request failed (${res.status})` };
  }
}

export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = usePackPallyAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function completeSignIn() {
    await refresh();
    const dest = safeNextPath(searchParams.get("next"));
    router.push(dest);
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await readJson(res);
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Login failed");
        return;
      }
      await completeSignIn();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

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

          <h1 className="text-2xl font-bold text-center">Welcome back</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Sign in to your account to continue your journey
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                disabled={loading}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={loading}
                className="h-11"
              />
            </div>
            <Button className="w-full h-11 gap-2" size="lg" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Login"
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
            disabled={loading}
            onError={setError}
            onSignedIn={completeSignIn}
          />

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
