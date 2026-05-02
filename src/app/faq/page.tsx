import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle, Search, Compass, Sparkles } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { faqGroups } from "@/data/faqs";

export const metadata: Metadata = {
  title: "FAQ — Pack & Pally",
  description:
    "Frequently asked questions about booking, hosting, payments, cancellations, and the Pack & Pally app.",
};

export default function FaqPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-white to-violet-500/10 py-20 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary" />
              Help center
            </div>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Frequently asked questions
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Everything about booking, hosting, payments, cancellations, AI
              features, and the Pack &amp; Pally app — answered in one place.
            </p>

            {/* Quick category links */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {faqGroups.map((g, i) => (
                <a
                  key={i}
                  href={`#${slugify(g.title)}`}
                  className="rounded-full border bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  {g.title}
                </a>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Sections */}
      <section className="py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-3xl space-y-14">
            {faqGroups.map((g, gi) => (
              <div key={gi} id={slugify(g.title)} className="scroll-mt-24">
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <CategoryIcon index={gi} />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                    {g.title}
                  </h2>
                </div>
                <Accordion defaultValue={[]}>
                  {g.items.map((f, i) => (
                    <AccordionItem key={i} value={`${gi}-${i}`}>
                      <AccordionTrigger className="text-left text-base font-medium">
                        {f.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {f.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Still need help */}
      <section className="bg-warm-bg py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ContactCard
                icon={<MessageCircle className="h-5 w-5 text-primary" />}
                title="Chat with Pally"
                body="Pack & Pally's AI is online 24/7 for quick questions about your trips, packing, or destinations."
                cta="Open Pally"
                href="/ai-features"
              />
              <ContactCard
                icon={<Mail className="h-5 w-5 text-primary" />}
                title="Email support"
                body="Reach our team for booking issues, refunds, or anything urgent."
                cta="support@packandpally.com"
                href="mailto:support@packandpally.com"
              />
            </div>

            <div className="mt-8 rounded-2xl border bg-white p-6 text-center">
              <Search className="mx-auto h-5 w-5 text-muted-foreground" />
              <h3 className="mt-3 font-bold">Looking for something specific?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse trips to find your next adventure or apply to host one.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/browse-trips">Browse trips</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/become-a-host">Become a host</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function ContactCard({
  icon,
  title,
  body,
  cta,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border bg-white p-5 transition-all hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
        {icon}
      </div>
      <h3 className="mt-4 font-bold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
        {body}
      </p>
      <span className="mt-4 text-sm font-semibold text-primary group-hover:underline">
        {cta} →
      </span>
    </Link>
  );
}

function CategoryIcon({ index }: { index: number }) {
  // Lightweight per-category accent — keeps the page visually rhythmic
  switch (index) {
    case 0:
      return <Compass className="h-4 w-4 text-primary" />;
    case 1:
      return <Sparkles className="h-4 w-4 text-primary" />;
    case 2:
      return <Search className="h-4 w-4 text-primary" />;
    case 3:
      return <Sparkles className="h-4 w-4 text-primary" />;
    default:
      return <MessageCircle className="h-4 w-4 text-primary" />;
  }
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
