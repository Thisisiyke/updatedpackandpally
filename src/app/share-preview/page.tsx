import Image from "next/image";
import Link from "next/link";
import { trips } from "@/data/trips";
import { partnerTrips } from "@/data/partner-trips";
import { buildTripMetadata } from "@/lib/trip-metadata";
import { siteConfig } from "@/lib/constants";
import { Container } from "@/components/shared/container";

export const dynamic = "force-dynamic";

interface UnfurlData {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName: string;
  noIndex: boolean;
}

function getString(v: unknown): string | undefined {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && "default" in v) {
    const d = (v as { default: unknown }).default;
    return typeof d === "string" ? d : undefined;
  }
  return undefined;
}

function extract(
  meta: ReturnType<typeof buildTripMetadata>,
  fallbackUrl: string
): UnfurlData {
  const og = meta.openGraph;
  const tw = meta.twitter;

  const ogTitle = og && "title" in og ? getString(og.title) : undefined;
  const ogDesc = og && "description" in og ? og.description : undefined;
  const twTitle = tw && "title" in tw ? getString(tw.title) : undefined;
  const twDesc = tw && "description" in tw ? tw.description : undefined;

  const title =
    ogTitle ||
    twTitle ||
    getString(meta.title) ||
    "Pack & Pally";

  const description =
    (typeof ogDesc === "string" ? ogDesc : undefined) ||
    (typeof twDesc === "string" ? twDesc : undefined) ||
    (typeof meta.description === "string" ? meta.description : "") ||
    "";

  let image = "/og-default.jpg";
  if (og && "images" in og && Array.isArray(og.images) && og.images[0]) {
    const first = og.images[0];
    if (typeof first === "string") image = first;
    else if (typeof first === "object" && "url" in first) {
      image = typeof first.url === "string" ? first.url : String(first.url);
    }
  }

  const url =
    (og && "url" in og && typeof og.url === "string" ? og.url : undefined) ||
    fallbackUrl;

  const siteName =
    og && "siteName" in og && typeof og.siteName === "string"
      ? og.siteName
      : "Pack & Pally";

  const noIndex =
    !!meta.robots &&
    typeof meta.robots === "object" &&
    "index" in meta.robots &&
    meta.robots.index === false;

  return { title, description, image, url, siteName, noIndex };
}

export default async function SharePreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const sp = await searchParams;
  const selectedId = sp.id || trips[0]?.id || "";

  // Build the catalog of selectable trips (seed only — host-created trips
  // live in localStorage on the client).
  const allOptions = [
    ...trips.map((t) => ({
      id: t.id,
      title: t.title,
      slug: t.slug,
      origin: "Traveler seed" as const,
    })),
    ...partnerTrips.map((t) => ({
      id: t.id,
      title: t.title,
      slug: t.slug,
      origin: "Partner seed" as const,
    })),
  ];
  const seen = new Set<string>();
  const options = allOptions.filter((o) =>
    seen.has(o.id) ? false : (seen.add(o.id), true)
  );

  const meta = buildTripMetadata(selectedId, "/trips");
  const selected = options.find((o) => o.id === selectedId);
  const fallbackUrl = `${siteConfig.url}/trips/${
    selected?.slug || selectedId
  }`;
  const data = extract(meta, fallbackUrl);

  // Brand label shown next to the favicon in chat-app cards. Chat apps
  // typically show the hostname here; we surface the brand name instead so
  // the unfurl reads as "Pack & Pally" rather than "packandpally.com".
  const brand = "Pack & Pally";

  return (
    <div className="bg-muted/30 min-h-screen pb-20">
      <Container className="py-10">
        <div className="mb-8 flex items-start gap-3">
          <Image
            src="/logo.png"
            alt="Pack & Pally"
            width={44}
            height={44}
            className="h-11 w-11 object-contain shrink-0"
            priority
          />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Share-card preview
            </h1>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              Pick a trip — these are the cards that&apos;ll unfurl when its
              URL is pasted into Slack, iMessage, WhatsApp, Facebook,
              LinkedIn, Twitter, or shown in Google search. Rendered locally
              from the same metadata your live route ships.
            </p>
          </div>
        </div>

        {/* Picker */}
        <form className="mb-8 rounded-2xl border bg-white p-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Trip
          </label>
          <select
            name="id"
            defaultValue={selectedId}
            className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm"
          >
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.title} · {o.origin}
              </option>
            ))}
            <option value="nonexistent">
              ↳ Non-existent id (fallback copy)
            </option>
          </select>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span>Currently previewing:</span>
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
              {data.url}
            </code>
          </div>
          <button
            type="submit"
            className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Update preview
          </button>
        </form>

        {data.noIndex && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">This trip is private.</p>
            <p className="mt-0.5">
              The share card strips the destination, image, and full title.
              Crawlers also get <code>robots: noindex,nofollow</code>.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Slack / iMessage / FB / WhatsApp large card */}
          <Card label="Slack · iMessage · Facebook · WhatsApp (large image)">
            <div className="rounded-xl border bg-white overflow-hidden shadow-sm max-w-[520px]">
              <div className="relative aspect-[1200/630] bg-muted">
                <Image
                  src={data.image}
                  alt={data.title}
                  fill
                  className="object-cover"
                  sizes="520px"
                />
              </div>
              <div className="p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <BrandFavicon size={14} />
                  {brand}
                </div>
                <p className="font-bold text-[15px] leading-snug line-clamp-2">
                  {data.title}
                </p>
                <p className="text-sm text-muted-foreground leading-snug line-clamp-3">
                  {data.description}
                </p>
              </div>
            </div>
          </Card>

          {/* Twitter summary_large_image */}
          <Card label="Twitter / X (summary_large_image)">
            <div className="rounded-2xl border bg-white overflow-hidden shadow-sm max-w-[520px]">
              <div className="relative aspect-[1200/630] bg-muted">
                <Image
                  src={data.image}
                  alt={data.title}
                  fill
                  className="object-cover"
                  sizes="520px"
                />
                <div className="absolute bottom-2 left-2 rounded bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[11px] text-white font-medium">
                  {data.title}
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 text-[11px] text-muted-foreground">
                <BrandFavicon size={14} />
                From {brand}
              </div>
            </div>
          </Card>

          {/* LinkedIn-style */}
          <Card label="LinkedIn">
            <div className="rounded-md border bg-white overflow-hidden shadow-sm max-w-[520px]">
              <div className="relative aspect-[1200/630] bg-muted">
                <Image
                  src={data.image}
                  alt={data.title}
                  fill
                  className="object-cover"
                  sizes="520px"
                />
              </div>
              <div className="p-3">
                <p className="font-bold text-[14px] leading-snug line-clamp-2">
                  {data.title}
                </p>
                <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground mt-1">
                  <BrandFavicon size={14} />
                  {brand}
                </div>
              </div>
            </div>
          </Card>

          {/* iMessage rich link compact */}
          <Card label="iMessage (compact list view)">
            <div className="rounded-2xl border bg-white overflow-hidden shadow-sm max-w-[420px] flex">
              <div className="relative w-24 shrink-0 bg-muted">
                <Image
                  src={data.image}
                  alt={data.title}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              <div className="p-3 min-w-0 flex-1">
                <p className="font-semibold text-[13px] leading-snug line-clamp-2">
                  {data.title}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1 min-w-0">
                  <BrandFavicon size={12} />
                  <span className="truncate">{brand}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Google search */}
          <Card label="Google search snippet" wide>
            <div className="rounded-lg border bg-white p-4 shadow-sm max-w-[640px]">
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground mb-1">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted overflow-hidden">
                  <Image
                    src="/logo.png"
                    alt="Pack & Pally"
                    width={16}
                    height={16}
                    className="object-contain"
                  />
                </span>
                <span className="truncate">
                  {brand} ›{" "}
                  {(() => {
                    try {
                      const p = new URL(data.url).pathname;
                      return p === "/" ? "" : p.replace(/^\//, "");
                    } catch {
                      return "";
                    }
                  })()}
                </span>
              </div>
              <h3 className="text-[20px] leading-snug text-blue-700 hover:underline cursor-pointer">
                {data.title}
              </h3>
              <p className="mt-1 text-[14px] text-slate-700 leading-snug">
                {data.description}
              </p>
            </div>
          </Card>
        </div>

        <div className="mt-12 rounded-2xl border bg-white p-6 max-w-3xl">
          <h2 className="text-lg font-bold">Seeing the real thing</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Slack, iMessage, Facebook, Twitter, LinkedIn, and Google all
            crawl your URL from their own servers — they can&apos;t reach
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-[11px]">
              localhost
            </code>
            . To verify the live unfurl:
          </p>
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              1. Expose your dev server with a tunnel:{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-[12px]">
                ngrok http 3000
              </code>{" "}
              or{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-[12px]">
                cloudflared tunnel --url http://localhost:3000
              </code>
              .
            </li>
            <li>
              2. Paste the public tunnel URL of a trip page (e.g.{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-[12px]">
                https://&lt;tunnel&gt;.ngrok-free.app/trips/trip-1
              </code>
              ) into one of these debuggers:
            </li>
            <li className="ml-4 list-disc list-inside space-y-1">
              <p>
                <Link
                  href="https://www.opengraph.xyz/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  opengraph.xyz
                </Link>{" "}
                — quick all-in-one preview
              </p>
              <p>
                <Link
                  href="https://developers.facebook.com/tools/debug/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  Facebook Sharing Debugger
                </Link>{" "}
                — Facebook + Messenger + WhatsApp
              </p>
              <p>
                <Link
                  href="https://www.linkedin.com/post-inspector/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  LinkedIn Post Inspector
                </Link>
              </p>
              <p>
                <Link
                  href="https://cards-dev.twitter.com/validator"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  X (Twitter) Card Validator
                </Link>
              </p>
            </li>
            <li>
              3. After you deploy, you can drop the production URL straight
              into any of those — no tunnel needed.
            </li>
          </ol>
        </div>
      </Container>
    </div>
  );
}

function Card({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={wide ? "lg:col-span-2" : ""}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        {label}
      </p>
      {children}
    </div>
  );
}

/** Tiny Pack & Pally favicon — mimics what chat apps render next to the
 *  hostname in unfurl cards. */
function BrandFavicon({ size = 14 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-muted overflow-hidden shrink-0"
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.png"
        alt="Pack & Pally"
        width={size}
        height={size}
        className="object-contain"
      />
    </span>
  );
}
