/**
 * Per-host terms & conditions.
 * Stored in localStorage keyed by host id so each partner can publish their own.
 * On the user side, when someone is about to join a trip, we look up the host's
 * terms by the trip's hostId. If none are set, the trip detail page falls back
 * to the platform default terms baked into TermsModal.
 */

export type CancellationPreset = "flexible" | "moderate" | "strict" | "custom";

export interface CancellationPolicy {
  preset: CancellationPreset;
  customText?: string;
}

export interface HostTerms {
  hostId: string;
  title?: string;
  content: string;
  cancellationPolicy?: CancellationPolicy;
  updatedAt: string;
}

export interface CancellationPresetDetails {
  label: string;
  headline: string;
  windows: string[];
}

export const CANCELLATION_PRESETS: Record<
  Exclude<CancellationPreset, "custom">,
  CancellationPresetDetails
> = {
  flexible: {
    label: "Flexible",
    headline: "Full refund up to 7 days before departure.",
    windows: [
      "More than 7 days before: 100% refund",
      "3–7 days before: 50% refund",
      "Less than 3 days before: no refund",
    ],
  },
  moderate: {
    label: "Moderate",
    headline: "Full refund up to 30 days before departure.",
    windows: [
      "More than 30 days before: 100% refund",
      "15–30 days before: 50% refund",
      "Less than 15 days before: no refund",
    ],
  },
  strict: {
    label: "Strict",
    headline: "Full refund up to 60 days before departure only.",
    windows: [
      "More than 60 days before: 100% refund",
      "30–60 days before: 25% refund",
      "Less than 30 days before: no refund",
    ],
  },
};

export const DEFAULT_CANCELLATION_POLICY: CancellationPolicy = {
  preset: "moderate",
};

const STORAGE_KEY = "packpally_host_terms";
const CHANGE_EVENT = "packpally_host_terms_change";

/**
 * The current logged-in partner's hostId.
 * In this mock universe, CURRENT_PARTNER ("Sofia Martinez") maps to host-1.
 */
export const CURRENT_PARTNER_HOST_ID = "host-1";

type Store = Record<string, HostTerms>;

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: Store) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {}
}

export function getHostTerms(hostId: string): HostTerms | null {
  const store = readStore();
  return store[hostId] ?? null;
}

export function saveHostTerms(
  hostId: string,
  content: string,
  title?: string,
  cancellationPolicy?: CancellationPolicy
): HostTerms {
  const record: HostTerms = {
    hostId,
    title: title?.trim() || undefined,
    content,
    cancellationPolicy,
    updatedAt: new Date().toISOString(),
  };
  const store = readStore();
  store[hostId] = record;
  writeStore(store);
  return record;
}

/**
 * Resolve a host's effective cancellation policy. If the host hasn't
 * customized one, falls back to the platform default (moderate).
 */
export function resolveCancellationPolicy(
  hostId: string | undefined
): CancellationPolicy {
  if (!hostId) return DEFAULT_CANCELLATION_POLICY;
  const record = getHostTerms(hostId);
  return record?.cancellationPolicy ?? DEFAULT_CANCELLATION_POLICY;
}

export function clearHostTerms(hostId: string): void {
  const store = readStore();
  if (store[hostId]) {
    delete store[hostId];
    writeStore(store);
  }
}

export function subscribeToHostTerms(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
