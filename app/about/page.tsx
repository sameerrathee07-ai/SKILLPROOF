import Link from "next/link";
import Header from "@/components/ui/hero-01-utils/header";
import { GradientBars } from "@/components/ui/gradient-bars-background";
import { ShieldCheck, Target, CheckCircle2, Award, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About Us: SkillProof",
  description: "Learn about SkillProof's deterministic quality gate for technical problem solving.",
};

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-[rgb(10,10,10)] text-slate-100 overflow-hidden dark">
      {/* Background with Sky / Blue scheme */}
      <GradientBars numBars={15} gradientFrom="rgb(14, 165, 233)" className="opacity-40" />

      <div className="relative z-10">
        <Header />

        <main className="max-w-5xl mx-auto px-4 py-8 md:py-16 space-y-12">
          {/* Hero Heading */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <ShieldCheck className="w-4 h-4" />
              <span>Deterministic Verification</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
              Engineering Proof Over Résumé Promises
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              SkillProof was built to solve a critical operational bottleneck in technical hiring and pilot allocation:
              low-effort spam drowning out genuine engineering talent.
            </p>
          </div>

          {/* Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-slate-950/70 border border-white/10 backdrop-blur-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Two-Tier Quality Gate</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tier 1 Binary Knockouts filter incomplete specs, low character counts, and generic boilerplate before any reviewer spends a second.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-950/70 border border-white/10 backdrop-blur-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Zero LLM Hallucination</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scoring is 100% deterministic, rules-based, and calibrated against empirical benchmarks. No probabilistic models, no silent drifting.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-950/70 border border-white/10 backdrop-blur-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Award className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Verified Solvers</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Solvers build transparent credibility scores with every accepted proposal, unlocking priority inboxes and direct partner invitations.
              </p>
            </div>
          </div>

          {/* Mission Detail Card */}
          <div className="p-8 rounded-xl bg-slate-950/70 border border-white/10 backdrop-blur-xl space-y-6">
            <h2 className="text-2xl font-bold text-white">Our Single-Sector Wedge: Education</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              We started with coaching academies, tuition networks, and university computer science departments. 
              These institutions manage thousands of candidate projects every semester with zero bandwidth to filter low-effort submissions. 
              By establishing our 6.0 quality threshold, SkillProof delivers pre-vetted, high-signal technical proposals directly to poster inboxes.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link href="/problems">
                <Button className="bg-sky-600 hover:bg-sky-500 text-white rounded-lg h-10 px-5 text-xs font-semibold cursor-pointer">
                  Explore Active Challenges
                </Button>
              </Link>
              <Link href="/collaborate">
                <Button variant="outline" className="border-white/20 text-slate-200 hover:bg-white/10 rounded-lg h-10 px-5 text-xs font-semibold cursor-pointer">
                  Partner With Us
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
