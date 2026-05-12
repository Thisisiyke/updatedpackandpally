/**
 * Host-level defaults that pre-fill the trip create wizard. Live in
 * localStorage in the demo; would back onto a host record server-side
 * later. Each value is independently optional — the wizard falls back
 * to legacy hard-coded defaults when a field isn't set.
 */

import type { CancellationPreset } from "@/lib/host-terms";

const KEY = "packpally_host_defaults";
const CHANGE_EVENT = "packpally_host_defaults_change";

export interface HostDefaults {
  /** Default tax rate as a decimal (e.g. 0.0825 for 8.25%). */
  taxRate?: number;
  /** Default cancellation preset for new trips. */
  cancellationPreset?: CancellationPreset;
  /** Default partial-payment toggle for new trips. */
  partialPaymentEnabled?: boolean;
  /** Default guest-data requirements. */
  requireTravelerId?: boolean;
  requestSocialMedia?: boolean;
  /** Default trip policy PDF (data URL — demo). */
  tripPolicyPdf?: {
    name: string;
    dataUrl: string;
    sizeBytes?: number;
  };
  /** Default free-form host policy text. */
  hostPolicy?: string;
  /** "publish" → publish on create, "draft" → always start as draft. */
  newTripStatus?: "publish" | "draft";
}

export function getHostDefaults(): HostDefaults {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveHostDefaults(next: HostDefaults): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {}
}

export function subscribeToHostDefaults(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
