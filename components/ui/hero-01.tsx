"use client";

import HeroSection from "@/components/ui/hero-01-utils/hero";
import type { NavigationSection } from "@/components/ui/hero-01-utils/header";
import Header from "@/components/ui/hero-01-utils/header";
import { GradientBars } from "@/components/ui/gradient-bars-background";

type AgencyHeroSectionProps = {
  navigationData?: NavigationSection[];
};

export default function AgencyHeroSection({
  navigationData,
}: AgencyHeroSectionProps = {}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[rgb(10,10,10)] dark">
      <GradientBars numBars={15} gradientFrom="rgb(255, 60, 0)" className="opacity-50" />
      <div className="relative z-10">
        <Header navigationData={navigationData} />
        <div>
          <HeroSection />
        </div>
      </div>
    </div>
  );
}
