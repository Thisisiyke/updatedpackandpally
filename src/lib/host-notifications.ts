/**
 * Host notification preferences. Each event row has a per-channel toggle:
 * email / push / in-app. Plus a top-level "weekly digest" opt-in.
 *
 * Persisted in localStorage; backs onto a host record server-side later.
 */

const KEY = "packpally_host_notifications";
const CHANGE_EVENT = "packpally_host_notifications_change";

export type NotificationChannel = "email" | "push" | "inApp";

export type NotificationEventKey =
  | "newBooking"
  | "cancellation"
  | "travelerMessage"
  | "depositReceived"
  | "installmentPaid"
  | "payoutSent"
  | "payoutFailed"
  | "tripFlagged"
  | "disputeOpened"
  | "reviewLeft";

export interface NotificationEventMeta {
  key: NotificationEventKey;
  label: string;
  hint: string;
  group: "Bookings" | "Payments" | "Platform";
}

export const NOTIFICATION_EVENTS: NotificationEventMeta[] = [
  {
    key: "newBooking",
    label: "New booking",
    hint: "A traveler joined one of your trips.",
    group: "Bookings",
  },
  {
    key: "cancellation",
    label: "Cancellation",
    hint: "A traveler cancelled their booking.",
    group: "Bookings",
  },
  {
    key: "travelerMessage",
    label: "Traveler message",
    hint: "Someone sent you a message about a trip.",
    group: "Bookings",
  },
  {
    key: "depositReceived",
    label: "Deposit received",
    hint: "First installment from a traveler landed.",
    group: "Payments",
  },
  {
    key: "installmentPaid",
    label: "Installment paid",
    hint: "Second or final installment from a traveler landed.",
    group: "Payments",
  },
  {
    key: "payoutSent",
    label: "Payout sent",
    hint: "Stripe transferred funds to your bank.",
    group: "Payments",
  },
  {
    key: "payoutFailed",
    label: "Payout failed",
    hint: "A scheduled payout couldn't be processed.",
    group: "Payments",
  },
  {
    key: "tripFlagged",
    label: "Trip flagged by admin",
    hint: "Pack & Pally moderation flagged or took down one of your trips.",
    group: "Platform",
  },
  {
    key: "disputeOpened",
    label: "Dispute opened",
    hint: "A traveler raised a refund or quality dispute.",
    group: "Platform",
  },
  {
    key: "reviewLeft",
    label: "Review left",
    hint: "A traveler posted a review on one of your trips.",
    group: "Platform",
  },
];

export type NotificationPrefs = Record<
  NotificationEventKey,
  Record<NotificationChannel, boolean>
>;

export interface HostNotificationSettings {
  prefs: NotificationPrefs;
  weeklyDigest: boolean;
}

/** Sensible defaults — important events on across all channels, low-signal ones email-only. */
function defaultSettings(): HostNotificationSettings {
  const allOn: Record<NotificationChannel, boolean> = {
    email: true,
    push: true,
    inApp: true,
  };
  const emailOnly: Record<NotificationChannel, boolean> = {
    email: true,
    push: false,
    inApp: true,
  };

  return {
    prefs: {
      newBooking: { ...allOn },
      cancellation: { ...allOn },
      travelerMessage: { ...allOn },
      depositReceived: { ...emailOnly },
      installmentPaid: { ...emailOnly },
      payoutSent: { ...emailOnly },
      payoutFailed: { ...allOn },
      tripFlagged: { ...allOn },
      disputeOpened: { ...allOn },
      reviewLeft: { ...emailOnly },
    },
    weeklyDigest: true,
  };
}

export function getHostNotificationSettings(): HostNotificationSettings {
  const fallback = defaultSettings();
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return fallback;
    // Merge with fallback so newly-added events get sane defaults.
    const merged: HostNotificationSettings = {
      weeklyDigest:
        typeof parsed.weeklyDigest === "boolean"
          ? parsed.weeklyDigest
          : fallback.weeklyDigest,
      prefs: { ...fallback.prefs },
    };
    if (parsed.prefs && typeof parsed.prefs === "object") {
      for (const k of Object.keys(merged.prefs) as NotificationEventKey[]) {
        const incoming = parsed.prefs[k];
        if (incoming && typeof incoming === "object") {
          merged.prefs[k] = {
            email:
              typeof incoming.email === "boolean"
                ? incoming.email
                : merged.prefs[k].email,
            push:
              typeof incoming.push === "boolean"
                ? incoming.push
                : merged.prefs[k].push,
            inApp:
              typeof incoming.inApp === "boolean"
                ? incoming.inApp
                : merged.prefs[k].inApp,
          };
        }
      }
    }
    return merged;
  } catch {
    return fallback;
  }
}

export function saveHostNotificationSettings(
  next: HostNotificationSettings
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {}
}

export function subscribeToHostNotificationSettings(
  cb: () => void
): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
