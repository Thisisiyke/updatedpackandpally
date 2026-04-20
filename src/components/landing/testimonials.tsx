import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { testimonials } from "@/data/testimonials";

export function Testimonials() {
  const featured = testimonials.slice(0, 6);

  return (
    <section className="py-20 lg:py-28">
      <Container>
        <ScrollReveal>
          <SectionHeader
            title="What Travelers Say"
            subtitle="Stories from our community of adventurers"
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((t, i) => (
            <ScrollReveal key={t.id} delay={i * 100} distance={30}>
              <div className="relative rounded-2xl border bg-card p-6 transition-all hover:shadow-md h-full">
                <Quote className="absolute top-6 right-6 h-8 w-8 text-primary/10" />
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${
                        s <= t.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3 border-t pt-4">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full">
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.location} &middot; {t.tripTitle}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
