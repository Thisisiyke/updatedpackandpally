"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const APPLE_SCRIPT =
  "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";

export type SocialSignInDetail = {
  displayName?: string;
};

type Props = {
  disabled?: boolean;
  onError: (message: string) => void;
  onSignedIn: (detail?: SocialSignInDetail) => void | Promise<void>;
};

export function WebSocialAuthRows({ disabled, onError, onSignedIn }: Props) {
  const [busy, setBusy] = useState<"google" | "apple" | null>(null);
  const appleReady = useRef(false);
  const appleInit = useRef(false);

  const runGoogle = useCallback(
    async (credential: string | undefined) => {
      if (!credential) {
        onError("Google did not return a credential.");
        return;
      }
      setBusy("google");
      try {
        const res = await fetch("/api/auth/oauth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ credential }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          onError(typeof data.error === "string" ? data.error : "Google sign-in failed.");
          return;
        }
        const u = data.user as { name?: string; fullName?: string; firstName?: string } | undefined;
        const displayName =
          u?.name ||
          u?.fullName ||
          [u?.firstName].filter(Boolean).join(" ").trim() ||
          undefined;
        await onSignedIn(displayName ? { displayName } : undefined);
      } catch {
        onError("Network error during Google sign-in.");
      } finally {
        setBusy(null);
      }
    },
    [onError, onSignedIn]
  );

  const runApple = useCallback(async () => {
    const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
    const redirectURI =
      process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI ||
      (typeof window !== "undefined" ? window.location.origin : "");
    if (!clientId || !redirectURI) {
      onError("Apple Sign-In is not configured for this site.");
      return;
    }
    if (!window.AppleID?.auth) {
      onError("Apple Sign-In script is still loading. Try again in a moment.");
      return;
    }
    setBusy("apple");
    try {
      if (!appleInit.current) {
        window.AppleID.auth.init({
          clientId,
          scope: "name email",
          redirectURI,
          usePopup: true,
        });
        appleInit.current = true;
      }
      const res = await window.AppleID.auth.signIn();
      const idToken = res.authorization?.id_token;
      if (!idToken) {
        onError("Apple did not return a token.");
        return;
      }
      const fn = res.user?.name?.firstName || "";
      const ln = res.user?.name?.lastName || "";
      const email = res.user?.email || "";
      const r = await fetch("/api/auth/oauth/apple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          idToken,
          firstName: fn,
          lastName: ln,
          email,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        onError(typeof data.error === "string" ? data.error : "Apple sign-in failed.");
        return;
      }
      const u = data.user as { name?: string; fullName?: string; firstName?: string } | undefined;
      const displayName =
        u?.name ||
        u?.fullName ||
        [u?.firstName].filter(Boolean).join(" ").trim() ||
        undefined;
      await onSignedIn(displayName ? { displayName } : undefined);
    } catch (e: unknown) {
      const err = e as { error?: string };
      if (err?.error === "popup_closed_by_user") {
        /* ignore */
      } else {
        onError("Apple sign-in was cancelled or failed.");
      }
    } finally {
      setBusy(null);
    }
  }, [onError, onSignedIn]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (appleReady.current) return;
    if (document.querySelector(`script[src="${APPLE_SCRIPT}"]`)) {
      appleReady.current = true;
      return;
    }
    const s = document.createElement("script");
    s.src = APPLE_SCRIPT;
    s.async = true;
    s.onload = () => {
      appleReady.current = true;
    };
    document.body.appendChild(s);
  }, []);

  const googleConfigured = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  const appleConfigured = Boolean(process.env.NEXT_PUBLIC_APPLE_CLIENT_ID);

  const blocked = disabled || busy !== null;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div
        className={`flex min-h-11 items-stretch justify-center [&>div]:w-full [&>div]:flex [&>div]:justify-center ${blocked ? "pointer-events-none opacity-60" : ""}`}
      >
        {googleConfigured ? (
          <GoogleLogin
            onSuccess={(cred) => runGoogle(cred.credential)}
            onError={() => onError("Google sign-in was interrupted.")}
            useOneTap={false}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
            width={200}
          />
        ) : (
          <Button variant="outline" className="h-11 w-full" type="button" disabled title="Set NEXT_PUBLIC_GOOGLE_CLIENT_ID">
            Google
          </Button>
        )}
      </div>
      <Button
        variant="outline"
        className="h-11 gap-2"
        type="button"
        disabled={!appleConfigured || blocked}
        onClick={() => void runApple()}
        title={
          appleConfigured
            ? "Sign in with Apple"
            : "Set NEXT_PUBLIC_APPLE_CLIENT_ID and NEXT_PUBLIC_APPLE_REDIRECT_URI"
        }
      >
        {busy === "apple" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Apple
      </Button>
    </div>
  );
}
