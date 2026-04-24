"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, CheckCircle2, PartyPopper, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { signup } from "@/lib/actions/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userName, setUserName] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const result = await signup(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setUserName(firstName);
    setSuccess(true);
    setLoading(false);
  }

  function goToDashboard() {
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Success Popup */}
        {success && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-[fade-in_200ms_ease-out]" />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-sm rounded-2xl border bg-white p-8 shadow-2xl animate-[pop-in_400ms_cubic-bezier(0.16,1,0.3,1)]">
                {/* Animated check */}
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 animate-[scale-in_500ms_cubic-bezier(0.16,1,0.3,1)_200ms_both]">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600 animate-[scale-in_400ms_cubic-bezier(0.16,1,0.3,1)_400ms_both]" />
                  </div>
                </div>

                {/* Confetti icon */}
                <div className="mt-4 flex justify-center">
                  <PartyPopper className="h-6 w-6 text-amber-500 animate-[bounce_1s_ease-in-out_600ms_both]" />
                </div>

                <h2 className="mt-4 text-center text-2xl font-bold animate-[fade-in-up_500ms_ease-out_300ms_both]">
                  Welcome aboard{userName ? `, ${userName}` : ""}!
                </h2>

                <p className="mt-2 text-center text-sm text-muted-foreground animate-[fade-in-up_500ms_ease-out_400ms_both]">
                  Your account has been created successfully. You&apos;re all
                  set to start exploring group adventures around the world.
                </p>

                <div className="mt-8 space-y-3 animate-[fade-in-up_500ms_ease-out_500ms_both]">
                  <Button
                    className="w-full h-11 gap-2"
                    size="lg"
                    onClick={goToDashboard}
                  >
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      router.push("/browse-trips");
                      router.refresh();
                    }}
                  >
                    Browse Trips
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Pack & Pally"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
              <span className="text-xl font-bold font-heading">
                Pack & Pally
              </span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-center">
            Create your account
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Start your journey with Pack & Pally today
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password (min 6 chars)"
                required
                minLength={6}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="host" name="host" />
              <Label htmlFor="host" className="text-sm font-normal">
                I want to host trips
              </Label>
            </div>

            <Button
              className="w-full h-11"
              size="lg"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up Free"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
              or continue with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-11">
              Google
            </Button>
            <Button variant="outline" className="h-11">
              Apple
            </Button>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
