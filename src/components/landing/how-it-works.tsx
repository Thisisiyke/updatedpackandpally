import Link from "next/link";
import { Search, Users, Plane, Compass, ArrowRight } from "lucide-react";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { ScrollReveal } from "@/components/shared/scroll-reveal";

interface Step {
  icon: typeof Search;
  number: string;
  title: string;
  description: string;
  cta?: { label: string; href: string };
  accent?: boolean;
}

const steps: Step[] = [
  {
    icon: Search,
    number: "01",
    title: "Discover",
    description:
      "Browse curated group trips by destination, date, or interest. Find the perfect adventure that matches your travel style.",
  },
  {
    icon: Users,
    number: "02",
    title: "Connect",
    description:
      "Join a group and meet your host and fellow travelers. Build connections with like-minded adventurers from around the world.",
  },
  {
    icon: Plane,
    number: "03",
    title: "Adventure",
    description:
      "Pack your bags and create memories that last a lifetime. Every detail is handled so you can focus on the experience.",
  },
  {
    icon: Compass,
    number: "04",
    title: "Become a host",
    description:
      "Loved your trip? Flip the switch and run your own. Stripe handles payouts, our AI helps you draft the itinerary, and your travelers join in seconds.",
    cta: { label: "Apply to host", href: "/partner/onboarding" },
    accent: true,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-20 lg:py-28">
      <Container>
        <ScrollReveal>
          <SectionHeader
            title="How It Works"
            subtitle="From your first booking to leading your own group trip"
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 150} distance={30}>
              <div
                className={
                  step.accent
                    ? "group relative rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/10 via-card to-violet-500/10 p-8 transition-all hover:shadow-lg h-full flex flex-col"
                    : "group relative rounded-2xl border bg-card p-8 transition-all hover:shadow-lg h-full flex flex-col"
                }
              >
                <div className="mb-6 flex items-center gap-4">
                  <div
                    className={
                      step.accent
                        ? "flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white"
                        : "flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"
                    }
                  >
                    <step.icon
                      className={
                        step.accent
                          ? "h-6 w-6 text-white"
                          : "h-6 w-6 text-primary"
                      }
                    />
                  </div>
                  <span
                    className={
                      step.accent
                        ? "text-sm font-bold text-primary"
                        : "text-sm font-bold text-primary/40"
                    }
                  >
                    {step.number}
                  </span>
                </div>
                <h3 className="mb-3 text-xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
                {step.cta && (
                  <Link
                    href={step.cta.href}
                    className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                  >
                    {step.cta.label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
