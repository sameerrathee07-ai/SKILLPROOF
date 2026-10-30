import Header from "@/components/ui/hero-01-utils/header";
import PricingSection from "@/components/ui/pricing-section";

export const metadata = {
  title: "Pricing & Tokens: SkillProof",
  description:
    "Transparent, predictable pricing for student solvers and education partners.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />
      <PricingSection />
    </div>
  );
}
