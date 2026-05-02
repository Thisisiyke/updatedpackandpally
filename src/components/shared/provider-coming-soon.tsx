import Link from "next/link";
import { Plug, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";

interface ProviderComingSoonProps {
  title: string;
  description: string;
  provider: string;
  /** Where to send users while the integration is offline. */
  ctaHref?: string;
  ctaLabel?: string;
  /** Optional bullet points listing what will be available once live. */
  perks?: string[];
}

export function ProviderComingSoon({
  title,
  description,
  provider,
  ctaHref = "/browse-trips",
  ctaLabel = "Explore group trips",
  perks,
}: ProviderComingSoonProps) {
  return (
    <Container className="py-20">
      <div className="mx-auto max-w-2xl rounded-3xl border bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-violet-500/15">
          <Plug className="h-6 w-6 text-primary" />
        </div>
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          Coming soon
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-3 text-muted-foreground">{description}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Powered by{" "}
          <span className="font-semibold text-foreground">{provider}</span>{" "}
          (integration in progress).
        </p>

        {perks && perks.length > 0 && (
          <ul className="mt-6 space-y-2 text-left max-w-sm mx-auto">
            {perks.map((p) => (
              <li
                key={p}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        )}

        <Button asChild className="mt-8">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </div>
    </Container>
  );
}
