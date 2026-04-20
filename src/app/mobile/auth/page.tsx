"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.53-3.23 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function MobileAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const params = new URLSearchParams({ email, mode });
    router.push(`/mobile/verify?${params.toString()}`);
  };

  const handleSocial = (provider: "google" | "apple") => {
    setLoading(true);
    setTimeout(() => {
      const params = new URLSearchParams({
        email: `user@${provider}.com`,
        mode,
        provider,
      });
      router.push(`/mobile/verify?${params.toString()}`);
    }, 400);
  };

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
          <div className="relative h-12 w-12 mb-3">
            <Image
              src="/logo.png"
              alt=""
              fill
              className="object-contain"
              sizes="48px"
            />
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

        {/* Tabs */}
        <div className="flex rounded-xl bg-muted p-1 mb-6">
          <button
            onClick={() => setMode("login")}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm font-semibold transition-all",
              mode === "login"
                ? "bg-white shadow-sm"
                : "text-muted-foreground"
            )}
          >
            Sign in
          </button>
          <button
            onClick={() => setMode("signup")}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm font-semibold transition-all",
              mode === "signup"
                ? "bg-white shadow-sm"
                : "text-muted-foreground"
            )}
          >
            Sign up
          </button>
        </div>

        {/* Form */}
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
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Password</Label>
              {mode === "login" && (
                <Link
                  href="#"
                  className="text-xs text-primary font-medium"
                >
                  Forgot?
                </Link>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={mode === "signup" ? "At least 6 characters" : "Enter password"}
                className="pl-9 pr-9 h-12"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-12 text-base"
            disabled={loading}
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-muted-foreground">
            or continue with
          </span>
        </div>

        {/* Social */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-12 gap-2"
            type="button"
            onClick={() => handleSocial("google")}
            disabled={loading}
          >
            <GoogleIcon />
            Google
          </Button>
          <Button
            variant="outline"
            className="h-12 gap-2"
            type="button"
            onClick={() => handleSocial("apple")}
            disabled={loading}
          >
            <AppleIcon />
            Apple
          </Button>
        </div>

        {mode === "signup" && (
          <p className="mt-6 text-center text-xs text-muted-foreground leading-relaxed">
            By signing up you agree to our{" "}
            <span className="text-primary">Terms</span> and{" "}
            <span className="text-primary">Privacy Policy</span>.
          </p>
        )}
      </div>

      <div className="p-6 pb-8 md:pb-10">
        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={() => {
            try {
              sessionStorage.setItem("packpally_just_signed_in", "1");
            } catch {}
            router.push("/mobile/home");
          }}
        >
          Continue as guest
        </Button>
      </div>
    </div>
  );
}

export default function MobileAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-[844px] items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      }
    >
      <MobileAuthContent />
    </Suspense>
  );
}
