import Link from "next/link";
import Image from "next/image";
import {
  DollarSign,
  Globe,
  Heart,
  ClipboardList,
  Map,
  Users,
  Wallet,
  ChevronRight,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";

const benefits = [
  {
    icon: DollarSign,
    title: "Earn Extra Income",
    description:
      "Hosts earn an average of $3,200 per trip. Set your own prices and create as many trips as you like.",
  },
  {
    icon: Globe,
    title: "Share Your Expertise",
    description:
      "Turn your local knowledge and travel experience into curated adventures that others will love.",
  },
  {
    icon: Heart,
    title: "Build Community",
    description:
      "Connect with like-minded travelers from around the world and build lasting relationships.",
  },
];

const steps = [
  {
    icon: ClipboardList,
    title: "Apply",
    description:
      "Fill out a simple host application. Tell us about your travel experience and the adventures you want to create.",
  },
  {
    icon: Map,
    title: "Plan",
    description:
      "Create your trip using our tools — or let AI generate an itinerary. Set dates, pricing, and group size.",
  },
  {
    icon: Users,
    title: "Host",
    description:
      "Lead your group adventure. We handle payments and logistics so you can focus on the experience.",
  },
  {
    icon: Wallet,
    title: "Earn",
    description:
      "Get paid within 48 hours of your trip ending. Build your reputation with reviews and ratings.",
  },
];

const faqs = [
  {
    q: "Who can become a host?",
    a: "Anyone with a passion for travel and a desire to share unique experiences. We welcome local guides, travel enthusiasts, adventure seekers, and cultural experts from all backgrounds.",
  },
  {
    q: "How much does it cost to become a host?",
    a: "Absolutely nothing! Signing up is free. We take a small commission (15%) from each booking to cover platform, payment processing, and support costs.",
  },
  {
    q: "How do I set my trip pricing?",
    a: "You have full control over pricing. We provide market data and pricing suggestions based on similar trips, but the final price is always up to you.",
  },
  {
    q: "What if I need to cancel a trip?",
    a: "We understand plans change. You can cancel a trip up to 30 days before departure with no penalty. Closer to the date, our support team will work with you on a case-by-case basis.",
  },
  {
    q: "Do I need professional guide certifications?",
    a: "Not necessarily! While certifications are valued, they're not required for all trip types. Cultural tours, food experiences, and city explorations don't typically need certifications. Adventure activities may require specific qualifications.",
  },
  {
    q: "How does Pack & Pally support hosts?",
    a: "We provide trip planning tools, AI itinerary generation, marketing support, 24/7 emergency assistance, payment processing, and a dedicated host success team to help you grow.",
  },
];

export default function BecomeAHostPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
        <Container className="relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Turn Your Passion Into Adventures
            </h1>
            <p className="mt-6 text-lg text-white/80 leading-relaxed">
              Become a Pack & Pally host and lead group trips to your favorite
              places. Share your world, meet amazing people, and earn while doing
              what you love.
            </p>
            <Button size="lg" className="mt-8 text-base px-8 h-12">
              Apply to Host
            </Button>
          </div>
        </Container>
      </section>

      {/* Benefits */}
      <section className="py-20 lg:py-28">
        <Container>
          <SectionHeader
            title="Why Become a Host?"
            subtitle="Join hundreds of hosts who are already earning and connecting with travelers"
          />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border bg-card p-8 text-center transition-all hover:shadow-lg"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <b.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-5 text-xl font-bold">{b.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* How Hosting Works */}
      <section className="bg-warm-bg py-20 lg:py-28">
        <Container>
          <SectionHeader
            title="How Hosting Works"
            subtitle="From application to earning — it's simple"
          />
          <div className="relative mx-auto max-w-2xl">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border md:left-1/2 md:-translate-x-px" />

            <div className="space-y-12">
              {steps.map((step, i) => (
                <div key={step.title} className="relative flex gap-6 md:gap-12">
                  {/* Circle */}
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white md:absolute md:left-1/2 md:-translate-x-1/2">
                    <step.icon className="h-5 w-5" />
                  </div>
                  {/* Content */}
                  <div className={`md:w-1/2 ${i % 2 === 0 ? 'md:pr-16' : 'md:ml-auto md:pl-16'}`}>
                    <span className="text-sm font-medium text-primary">
                      Step {i + 1}
                    </span>
                    <h3 className="mt-1 text-lg font-bold">{step.title}</h3>
                    <p className="mt-2 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Host Testimonial */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="h-5 w-5 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <blockquote className="text-xl leading-relaxed text-muted-foreground italic sm:text-2xl">
              &ldquo;Hosting on Pack & Pally has been the most rewarding
              experience of my career. I get to share my love for African
              wildlife with incredible people from all over the world — and earn
              a great living doing it.&rdquo;
            </blockquote>
            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-full">
                <Image
                  src="https://randomuser.me/api/portraits/women/68.jpg"
                  alt="Amara Okafor"
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div className="text-left">
                <p className="font-semibold">Amara Okafor</p>
                <p className="text-sm text-muted-foreground">
                  Safari Host · 52 trips hosted
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="bg-warm-bg py-20 lg:py-28">
        <Container>
          <SectionHeader
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about hosting"
          />
          <div className="mx-auto max-w-2xl">
            <Accordion defaultValue={[]}>
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-base font-medium">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="bg-dark-section py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to Start Hosting?
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Join our community of hosts and start leading adventures today.
            </p>
            <Button size="lg" className="mt-8 text-base px-8 h-12">
              Apply Now
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
