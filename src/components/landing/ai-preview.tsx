import Link from "next/link";
import { Sparkles, MessageCircle, ListChecks, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { ScrollReveal } from "@/components/shared/scroll-reveal";

const features = [
  {
    icon: Sparkles,
    title: "AI Trip Generator",
    description:
      "Let AI create your perfect itinerary based on your preferences, budget, and travel style.",
  },
  {
    icon: MessageCircle,
    title: "Travel Chatbot",
    description:
      "Get instant answers to any travel question — destinations, visas, weather, and more.",
  },
  {
    icon: ListChecks,
    title: "Smart Packing Lists",
    description:
      "Never forget essentials again. AI generates custom packing lists for every trip.",
  },
];

export function AiPreview() {
  return (
    <section className="py-20 lg:py-28">
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Text Content */}
          <ScrollReveal direction="left" distance={50}>
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-primary">
                Powered by AI
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
                AI-Powered Travel Planning
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Plan smarter, pack better, and travel with confidence using our
                suite of AI-powered tools.
              </p>

              <div className="mt-10 space-y-6">
                {features.map((feature) => (
                  <div key={feature.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button size="lg" className="mt-10 gap-2" asChild>
                <Link href="/ai-features">
                  Explore AI Features
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </ScrollReveal>

          {/* Mockup Card */}
          <ScrollReveal direction="right" distance={50} delay={200}>
            <div className="relative">
              <div className="rounded-2xl border bg-card p-6 shadow-xl">
                <div className="flex items-center gap-3 border-b pb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Pally AI</p>
                    <p className="text-xs text-emerald-600">Online</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5">
                    <p className="text-sm">
                      Hi! I&apos;m Pally, your AI travel assistant. Where would
                      you like to explore? ✨
                    </p>
                  </div>
                  <div className="ml-auto max-w-[70%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5">
                    <p className="text-sm text-white">
                      I want to visit Bali for 7 days
                    </p>
                  </div>
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5">
                    <p className="text-sm">
                      Great choice! Bali is perfect for a week-long trip.
                      I&apos;d recommend splitting your time between Ubud for
                      culture and Seminyak for beaches. Want me to generate a
                      full itinerary? 🌴
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    Generate itinerary
                  </div>
                  <div className="rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    Packing list
                  </div>
                </div>
              </div>
              {/* Decorative gradient */}
              <div className="absolute -z-10 -inset-4 rounded-3xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 blur-xl" />
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
