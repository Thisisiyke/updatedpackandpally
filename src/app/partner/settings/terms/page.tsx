import { redirect } from "next/navigation";

/**
 * Legacy host-wide terms / cancellation editor. Cancellation policies and
 * trip-policy PDFs are now per-trip (in the wizard) plus host-level
 * defaults under /partner/settings/defaults. This route now redirects.
 */
export default function PartnerSettingsTermsRedirect() {
  redirect("/partner/settings/defaults");
}
