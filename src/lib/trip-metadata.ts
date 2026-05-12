import type { Metadata } from "next";
import { trips } from "@/data/trips";
import { partnerTrips } from "@/data/partner-trips";
import { siteConfig } from "@/lib/constants";

const FALLBACK_OG_IMAGE = "/og-default.jpg";

/** Truncate without slicing mid-word; appends an ellipsis when cut. */
function trim(text: string, max: number): string {
  if (!text) return "";
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  const slice = cleaned.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${cut.trimEnd()}…`;
}

/**
 * Resolve a trip from the merged seed pool. localStorage-backed
 * user-created trips aren't visible server-side (where this metadata is
 * generated) — that's fine; their share-cards fall back to site defaults.
 */
function findTripById(id: string) {
  return trips.find((t) => t.id === id) || partnerTrips.find((p) => p.id === id);
}

/**
 * Returns absolute URL for OG image. Data URLs (host-uploaded covers) can't
 * be fetched by crawlers, so they fall back to the site default. Swap this
 * out when real image hosting (Cloudinary / S3 / Vercel Blob) lands.
 */
function safeOgImage(coverImage: string | undefined): string {
  if (!coverImage) return FALLBACK_OG_IMAGE;
  if (coverImage.startsWith("data:")) return FALLBACK_OG_IMAGE;
  return coverImage;
}

/**
 * Build per-trip metadata for OG / Twitter / search-engine unfurls.
 * `basePath` is "/trips" for the web traveler page and "/mobile/trips"
 * for the mobile share path.
 */
export function buildTripMetadata(
  id: string,
  basePath: "/trips" | "/mobile/trips"
): Metadata {
  const trip = findTripById(id);

  if (!trip) {
    return {
      title: "Trip not found",
      description:
        "This trip is no longer available. Browse curated group adventures on Pack & Pally.",
    };
  }

  // Private trips don't leak destination, image, or description into share
  // cards. They unfurl as an invite-only nudge instead.
  if ("visibility" in trip && trip.visibility === "private") {
    return {
      title: "Private trip · Pack & Pally",
      description:
        "This trip is private — ask the host for an invite link to view it.",
      robots: { index: false, follow: false },
      openGraph: {
        type: "website",
        siteName: "Pack & Pally",
        title: "Private trip · Pack & Pally",
        description:
          "This trip is private — ask the host for an invite link to view it.",
        url: `${basePath}/${trip.slug || trip.id}`,
        images: [
          {
            url: FALLBACK_OG_IMAGE,
            width: 1200,
            height: 630,
            alt: "Pack & Pally",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Private trip · Pack & Pally",
        description:
          "This trip is private — ask the host for an invite link to view it.",
        images: [FALLBACK_OG_IMAGE],
      },
    };
  }

  const title = trip.title;
  // Prefer the full trip description (richer preview), trimmed to a normal
  // share-card length. Falls back to shortDescription, then a generic line.
  // 160 chars is the standard ceiling for Google search snippets and looks
  // clean in Slack, iMessage, WhatsApp, FB, and Twitter unfurls.
  const rawDescription =
    trip.description ||
    ("shortDescription" in trip && trip.shortDescription) ||
    `Join "${trip.title}" — a curated group adventure in ${trip.destination}, ${trip.country}.`;
  const description = trim(rawDescription, 160);
  const og = safeOgImage(trip.coverImage);
  const url = `${siteConfig.url}${basePath}/${trip.slug || trip.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "Pack & Pally",
      title: `${title} · Pack & Pally`,
      description,
      url,
      images: [
        {
          url: og,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · Pack & Pally`,
      description,
      images: [og],
    },
  };
}
