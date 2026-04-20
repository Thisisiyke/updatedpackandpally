import { Search, Users, Plane } from "lucide-react";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { ScrollReveal } from "@/components/shared/scroll-reveal";

const steps = [
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
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-20 lg:py-28">
      <Container>
        <ScrollReveal>
          <SectionHeader
            title="How It Works"
            subtitle="Three simple steps to your next adventure"
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 150} distance={30}>
              <div className="group relative rounded-2xl border bg-card p-8 transition-all hover:shadow-lg h-full">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-primary/40">
                    {step.number}
                  </span>
                </div>
                <h3 className="mb-3 text-xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
