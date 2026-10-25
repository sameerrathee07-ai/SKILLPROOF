import Link from "next/link";
import Header from "@/components/ui/hero-01-utils/header";
import { GradientBars } from "@/components/ui/gradient-bars-background";
import { Sliders, Cpu, Inbox, Shield, ArrowRight, Layers, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Services & Capabilities: SkillProof",
  description: "Enterprise and education quality gate verification services.",
};

export default function ServicesPage() {
  const services = [
    {
      icon: Shield,
      title: "Deterministic Quality Gate",
      description: "Automated, zero-hallucination screening that filters low-effort proposals through Tier 1 Knockouts and 6-dimensional scoring.",
      highlights: ["Minimum effort threshold checking", "Structured 5-step proposal schema", "Immediate feedback for applicants"],
    },
    {
      icon: Sliders,
      title: "Custom Sector Calibration",
      description: "Tailor the 6.0 quality bar to your specific operational criteria: student retention, scheduling workflows, or technical depth.",
      highlights: ["Configurable keyword sets", "Custom dimension weighting", "Empirical regression benchmark suites"],
    },
    {
      icon: Inbox,
      title: "Vetted Poster Inboxes",
      description: "Review only high-conviction proposals that achieved a passing grade (≥ 6.0), eliminating 80%+ of inbox noise.",
      highlights: ["Itemized proposal diagnostics", "One-click approval & contracting", "Integrated applicant credibility history"],
    },
    {
      icon: Cpu,
      title: "Talent Evaluation Engine",
      description: "API-driven verification pipeline that plugs directly into existing applicant portals or hackathon platforms.",
      highlights: ["REST API & Webhooks", "Deterministic grading audit trails", "Fast sub-second response times"],
    },
  ];

  return (
    <div className="relative min-h-screen bg-[rgb(10,10,10)] text-slate-100 overflow-hidden dark">
      {/* Background with Teal / Cyan scheme */}
      <GradientBars numBars={15} gradientFrom="rgb(20, 184, 166)" className="opacity-40" />

      <div className="relative z-10">
        <Header />

        <main className="max-w-6xl mx-auto px-4 py-8 md:py-16 space-y-12">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Layers className="w-4 h-4" />
              <span>Platform Capabilities</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
              End-to-End Proposal Quality Infrastructure
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Designed for organizations that need rigorous, auditable proof of capability before committing resources.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <div
                  key={i}
                  className="p-8 rounded-xl bg-slate-950/70 border border-white/10 backdrop-blur-xl shadow-lg hover:border-teal-500/30 transition-all flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-white">{svc.title}</h2>
                    <p className="text-sm text-slate-400 leading-relaxed">{svc.description}</p>
                    <ul className="space-y-2 pt-2 text-xs text-slate-300">
                      {svc.highlights.map((h, j) => (
                        <li key={j} className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <Link
                      href="/collaborate"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      <span>Inquire about this service</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
