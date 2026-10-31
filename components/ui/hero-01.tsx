"use client";

import HeroSection from "@/components/ui/hero-01-utils/hero";
import type { NavigationSection } from "@/components/ui/hero-01-utils/header";
import Header from "@/components/ui/hero-01-utils/header";
import DyeWhorl from "@/components/ui/dye-whorl";

type AgencyHeroSectionProps = {
  navigationData?: NavigationSection[];
};

export default function AgencyHeroSection({
  navigationData,
}: AgencyHeroSectionProps = {}) {
  return (
    <div className="dark bg-[rgb(10,10,10)]">
      <DyeWhorl interactive={false} className="min-h-screen" style={{ touchAction: "auto" }}>
        <Header navigationData={navigationData} />
        <div>
          <HeroSection />
        </div>
      </DyeWhorl>
    </div>
  );
}
