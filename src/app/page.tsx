import { HeroSection } from "@/components/landing/hero-section";
import { StatsBar } from "@/components/landing/stats-bar";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturedTrips } from "@/components/landing/featured-trips";
import { FeaturedHotels } from "@/components/landing/featured-hotels";
import { AiPreview } from "@/components/landing/ai-preview";
import { HostCta } from "@/components/landing/host-cta";
import { Testimonials } from "@/components/landing/testimonials";
import { DownloadApp } from "@/components/landing/download-app";
import { FaqSection } from "@/components/landing/faq-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <FeaturedTrips />
      <FeaturedHotels />
      <AiPreview />
      <HostCta />
      <Testimonials />
      <DownloadApp />
      <FaqSection />
    </>
  );
}
