import Link from "next/link";
import { DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { ScrollReveal } from "@/components/shared/scroll-reveal";

export function HostCta() {
  return (
    <section className="bg-dark-section py-20 lg:py-28">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
              Share Your World With Others
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Become a host and lead group adventures to your favorite places.
              Earn while doing what you love.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="mt-10 flex flex-col items-center justify-center gap-8 sm:flex-row">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold text-white">$3,200</p>
                  <p className="text-sm text-white/50">Avg. earned per trip</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold text-white">96%</p>
                  <p className="text-sm text-white/50">
                    Host satisfaction rate
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={350}>
            <Button size="lg" className="mt-10 text-base px-8 h-12" asChild>
              <Link href="/become-a-host">Start Hosting</Link>
            </Button>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
