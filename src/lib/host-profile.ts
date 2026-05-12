/**
 * Host's public-facing profile editable from /partner/settings/profile.
 * Stored in localStorage; in production this would live on the host record.
 */

const KEY = "packpally_host_profile";
const CHANGE_EVENT = "packpally_host_profile_change";

export interface HostProfile {
  displayName?: string;
  /** One-line tagline shown under the host's name on the trip page. */
  headline?: string;
  /** Markdown-light bio. */
  bio?: string;
  /** Languages the host speaks. */
  languages?: string[];
  /** Country / based-in. */
  country?: string;
  /** Avatar data URL or external URL. */
  avatar?: string;
  /** Optional social links. */
  instagram?: string;
  website?: string;
}

export function getHostProfile(): HostProfile {
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

export function saveHostProfile(next: HostProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {}
}

export function subscribeToHostProfile(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
