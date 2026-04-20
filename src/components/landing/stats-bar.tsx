"use client";

import { useEffect, useRef, useState } from "react";
import { Users, Map, Globe, Compass } from "lucide-react";
import { Container } from "@/components/shared/container";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { cn } from "@/lib/utils";

const stats = [
  {
    value: 4000,
    suffix: "+",
    label: "Happy travelers",
    icon: Users,
    ringColor: "stroke-primary",
    accentColor: "bg-primary",
    gradient: "from-primary to-blue-400",
    percent: 80,
  },
  {
    value: 200,
    suffix: "+",
    label: "Trips completed",
    icon: Map,
    ringColor: "stroke-emerald-500",
    accentColor: "bg-emerald-500",
    gradient: "from-emerald-500 to-teal-400",
    percent: 65,
  },
  {
    value: 50,
    suffix: "+",
    label: "Countries covered",
    icon: Globe,
    ringColor: "stroke-amber-500",
    accentColor: "bg-amber-500",
    gradient: "from-amber-500 to-orange-400",
    percent: 50,
  },
  {
    value: 100,
    suffix: "%",
    label: "Adventure focus",
    icon: Compass,
    ringColor: "stroke-violet-500",
    accentColor: "bg-violet-500",
    gradient: "from-violet-500 to-purple-400",
    percent: 100,
  },
];

function CountUp({
  target,
  suffix,
}: {
  target: number;
  suffix: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1800;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const interval = setInterval(() => {
            current += increment;
            if (current >= target) {
              current = target;
              clearInterval(interval);
            }
            setCount(current);
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  const display = Math.floor(count).toLocaleString();

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

function ProgressRing({
  percent,
  colorClass,
  inView,
}: {
  percent: number;
  colorClass: string;
  inView: boolean;
}) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width="88" height="88" viewBox="0 0 80 80" className="shrink-0">
      {/* Background track */}
      <circle
        cx="40"
        cy="40"
        r="36"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="text-muted/40"
      />
      {/* Animated fill */}
      <circle
        cx="40"
        cy="40"
        r="36"
        fill="none"
        strokeWidth="3.5"
        strokeLinecap="round"
        className={cn(colorClass, "transition-all duration-[1800ms] ease-out")}
        style={{
          strokeDasharray: circumference,
          strokeDashoffset: inView ? offset : circumference,
          transform: "rotate(-90deg)",
          transformOrigin: "center",
        }}
      />
    </svg>
  );
}

function Sparkles({ gradient }: { gradient: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "absolute h-1 w-1 rounded-full bg-gradient-to-r opacity-0",
            gradient,
            "animate-[sparkle_3s_ease-in-out_infinite]"
          )}
          style={{
            left: `${15 + i * 18}%`,
            bottom: "10%",
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}

function StatCard({
  stat,
  index,
}: {
  stat: (typeof stats)[0];
  index: number;
}) {
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <ScrollReveal delay={index * 120} distance={24}>
      <div
        ref={ref}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group relative overflow-hidden rounded-2xl bg-[#f9f9f9] p-8 sm:p-10 lg:p-12 transition-all duration-500 hover:shadow-xl"
        style={{
          transform: hovered
            ? "perspective(800px) rotateX(-2deg) rotateY(2deg) scale(1.02)"
            : "perspective(800px) rotateX(0) rotateY(0) scale(1)",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease",
        }}
      >
        {/* Animated gradient border top */}
        <div
          className={cn(
            "absolute top-0 left-0 h-1 bg-gradient-to-r transition-all duration-700 ease-out",
            stat.gradient,
            inView ? "w-full" : "w-0"
          )}
        />

        {/* Background watermark icon */}
        <div className="absolute -right-4 -bottom-4 opacity-[0.04] transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
          <stat.icon className="h-40 w-40 sm:h-48 sm:w-48" strokeWidth={1} />
        </div>

        {/* Sparkle particles */}
        <Sparkles gradient={stat.gradient} />

        {/* Content */}
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {/* Accent dot */}
            <div className={cn("h-2 w-8 rounded-full mb-5", stat.accentColor)} />

            {/* Number with gradient */}
            <p
              className={cn(
                "text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl bg-gradient-to-r bg-clip-text transition-all duration-500",
                stat.gradient,
                hovered ? "text-transparent" : "text-foreground"
              )}
            >
              <CountUp target={stat.value} suffix={stat.suffix} />
            </p>

            {/* Label */}
            <p className="mt-4 text-base text-muted-foreground">
              {stat.label}
            </p>
          </div>

          {/* Progress ring */}
          <div className="hidden sm:block relative">
            <ProgressRing
              percent={stat.percent}
              colorClass={stat.ringColor}
              inView={inView}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <stat.icon
                className={cn(
                  "h-5 w-5 transition-all duration-500",
                  hovered ? stat.ringColor.replace("stroke-", "text-") : "text-muted-foreground/60"
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

export function StatsBar() {
  return (
    <section className="bg-[#ffffff] py-16 lg:py-20">
      <Container>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
