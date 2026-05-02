"use client";

/**
 * Lightweight shell loaded by the Wanderly app WebView before Stripe onboarding.
 * Native code injects a same-origin POST to /api/auth/sync-mobile-session, then redirects.
 */

export default function StripeMobileBridgePage() {
  return (
    <div
      style={{
        padding: 24,
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        fontSize: 15,
        color: "#374151",
      }}>
      Signing you in for Stripe setup…
    </div>
  );
}
