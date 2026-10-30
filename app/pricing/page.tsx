import Link from "next/link";
import Header from "@/components/ui/hero-01-utils/header";
import { GradientBars } from "@/components/ui/gradient-bars-background";
import { Coins, Check, Zap, Building2, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Pricing & Tokens: SkillProof",
  description: "Transparent, predictable pricing for student solvers and education partners.",
};

export default function PricingPage() {
  const tiers = [
    {
      name: "Student Solver",
      badge: "Free Tier",
      price: "₹0",
      cadence: "forever free",
      alternates: [],
      description: "For student engineers and independent solvers submitting proposals to open challenges.",
      features: [
        "50 initial complimentary tokens",
        "Full 5-step structured pitch wizard",
        "Deterministic 6.0 scoring feedback",
        "Credibility score boost on passing pitches",
        "Direct poster inbox delivery",
      ],
      cta: "Browse Challenges",
      href: "/problems",
      popular: false,
    },
    {
      name: "Education Partner",
      badge: "Most Popular",
      price: "₹3,599",
      cadence: "month",
      alternates: [
        { price: "₹13,499", cadence: "quarter" },
        { price: "₹30,999", cadence: "year" },
      ],
      description: "For coaching centers, academies, and departments posting friction problems.",
      features: [
        "Unlimited vetted proposal reception",
        "Strict 6.0 deterministic quality gate",
        "Automated proposal knockouts",
        "Full applicant diagnostic breakdowns",
        "Direct candidate messaging & contracting",
        "Priority support & onboarding",
      ],
      cta: "Post a Challenge",
      href: "/org/problems/new",
      popular: true,
    },
    {
      name: "Campus & Enterprise",
      badge: "Custom Wedge",
      price: "Custom",
      cadence: "annual license",
      alternates: [],
      description: "For multi-department universities and training networks requiring custom calibration.",
      features: [
        "Custom domain keyword calibration",
        "Deterministic rubric fine-tuning",
        "White-glove sandbox onboarding",
        "Dedicated account manager & SLA",
        "Custom API & webhook integrations",
      ],
      cta: "Schedule Consultation",
      href: "/collaborate",
      popular: false,
    },
  ];

  return (
    <div className="relative min-h-screen bg-[rgb(10,10,10)] text-slate-100 overflow-hidden dark">
      {/* Background with Emerald scheme */}
      <GradientBars numBars={15} gradientFrom="rgb(34, 197, 94)" className="opacity-40" />

      <div className="relative z-10">
        <Header />

        <main className="max-w-6xl mx-auto px-4 py-8 md:py-16 space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Coins className="w-4 h-4" />
              <span>Simple, Value-Aligned Plans</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
              Zero Noise. Pay Only for High Signal.
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              No hidden fees, no opaque paywalls. Transparent tokens for solvers and dedicated vetting pipelines for posters.
            </p>
          </div>

          {/* Pricing Tiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {tiers.map((tier, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-xl border backdrop-blur-xl flex flex-col justify-between transition-all ${
                  tier.popular
                    ? "bg-slate-950/90 border-emerald-500/50 shadow-2xl shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                    : "bg-slate-950/70 border-white/10 shadow-lg"
                }`}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/10 text-slate-300 border border-white/10">
                      {tier.badge}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-white">{tier.name}</h2>
                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                      <span className="text-xs text-slate-400">/ {tier.cadence}</span>
                    </div>
                    {tier.alternates.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        {tier.alternates.map((alt) => (
                          <span key={alt.cadence}>
                            <span className="font-semibold text-slate-200">{alt.price}</span> / {alt.cadence}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                      {tier.description}
                    </p>
                  </div>

                  <div className="border-t border-white/10 pt-6 space-y-3">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                      Included features:
                    </span>
                    <ul className="space-y-2.5 text-xs text-slate-300">
                      {tier.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-8">
                  <Link href={tier.href} className="w-full block">
                    <Button
                      className={`w-full rounded-lg h-11 text-xs font-bold cursor-pointer transition ${
                        tier.popular
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                          : "bg-slate-900 hover:bg-slate-800 text-white border border-white/10"
                      }`}
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Token Purchase CTA Link */}
          <div className="p-6 rounded-xl bg-slate-950/80 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h3 className="text-base font-bold text-white">Need extra solver tokens?</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Top up your submission balance starting at ₹49 for 20 additional tokens.
              </p>
            </div>
            <Link href="/tokens">
              <Button variant="outline" className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 rounded-lg h-10 px-5 text-xs font-semibold cursor-pointer">
                <span>View Token Packs</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
