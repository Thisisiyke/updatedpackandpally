"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/components/providers/session-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RouteShell } from "@/components/layout/route-shell";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const inner = (
    <AuthProvider>
      <TooltipProvider>
        <RouteShell>{children}</RouteShell>
      </TooltipProvider>
    </AuthProvider>
  );

  if (!googleClientId) {
    return inner;
  }

  return <GoogleOAuthProvider clientId={googleClientId}>{inner}</GoogleOAuthProvider>;
}
