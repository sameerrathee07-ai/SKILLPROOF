import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Layers, 
  Sliders, 
  GraduationCap, 
  Award,
  AlertTriangle,
  Building2,
  Users
} from "lucide-react";
import { ProblemService } from "@/lib/services/problem.service";
import { SlideButton } from "@/components/SlideButton";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    { problemCount, orgCount, pitchCount, vettedPitchCount },
    recentProblems,
  ] = await Promise.all([
    ProblemService.getPlatformStats(),
    ProblemService.getRecentProblems(3),
  ]);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-800 border border-slate-700 text-sky-300 text-xs font-medium">
            <GraduationCap className="w-4 h-4" />
            <span>Phase 2: Single-Sector Wedge: Education First</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Quality-Gated Problem Solving for <span className="text-sky-400">Education</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            SkillProof protects coaching centers, tuition providers, and college departments from low-effort noise. 
            Every student pitch must pass an explainable, deterministic <strong className="text-white">Two-Tier Quality Gate</strong> before reaching the poster’s vetted inbox.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/problems">
              <SlideButton
                variant="emerald"
                icon={<ArrowRight className="w-4 h-4" />}
                className="px-6 py-3.5 text-sm font-bold shadow-lg"
              >
                Browse Challenges (Solver Flow)
              </SlideButton>
            </Link>

            <Link href="/org/problems/new">
              <SlideButton
                variant="primary"
                icon={<Building2 className="w-4 h-4 text-slate-300" />}
                className="px-6 py-3.5 text-sm font-bold border-slate-700 text-white hover:text-slate-900 bg-slate-800"
              >
                Post a Problem (Poster Flow)
              </SlideButton>
            </Link>

            <Link href="/admin/calibrate">
              <SlideButton
                variant="coral"
                icon={<Sliders className="w-4 h-4" />}
                className="px-5 py-3.5 text-sm font-bold"
              >
                Gate Calibration (VAL-1 to 6)
              </SlideButton>
            </Link>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-slate-800/80 text-center">
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="text-3xl font-black text-white">{orgCount}</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Education Partners</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="text-3xl font-black text-brand-400">{problemCount}</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Active Challenges</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="text-3xl font-black text-amber-400">{pitchCount}</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Total Pitches Graded</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="text-3xl font-black text-emerald-400">{vettedPitchCount}</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Vetted in Inboxes (≥ 6.0)</div>
          </div>
        </div>
      </div>

      {/* Two-Tier Architecture Explanation */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Deterministic Quality Gate Architecture
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            No probabilistic hallucination or external AI tokens. Pure mathematical grading calibrated against real problem sets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tier 1 Card */}
          <div className="p-6 rounded-2xl bg-white border border-rose-200 shadow-sm relative overflow-hidden">
            <div className="w-2 h-full bg-rose-500 absolute left-0 top-0" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                T1
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Tier 1: Binary Knockouts</h3>
                <p className="text-xs text-rose-600 font-semibold uppercase tracking-wider">Immediate Fail Prior to Scoring</p>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span><strong>Pricing Check:</strong> Must contain explicit numbers or currency symbols (₹, $, Rs) in Step 4.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span><strong>Alternatives Check:</strong> Step 3 must evaluate at least 2 distinct alternative approaches.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span><strong>Minimum Effort:</strong> Total submission must exceed 200 total characters.</span>
              </li>
            </ul>
          </div>

          {/* Tier 2 Card */}
          <div className="p-6 rounded-2xl bg-white border border-emerald-200 shadow-sm relative overflow-hidden">
            <div className="w-2 h-full bg-emerald-500 absolute left-0 top-0" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                T2
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Tier 2: 6-Dimension Score</h3>
                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Threshold: ≥ 6.0 / 10.0</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="font-semibold block text-slate-900">1. Problem Diagnosis</span>
                <span className="text-slate-500">Weight: 2.0 (Root cause vs symptom)</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="font-semibold block text-slate-900">2. Solution Actionability</span>
                <span className="text-slate-500">Weight: 2.0 (Milestones & specs)</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="font-semibold block text-slate-900">3. Alternatives Depth</span>
                <span className="text-slate-500">Weight: 1.5 (Trade-offs & reasons)</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="font-semibold block text-slate-900">4. Pricing Transparency</span>
                <span className="text-slate-500">Weight: 1.5 (Itemized breakdown)</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="font-semibold block text-slate-900">5. Solver Proof</span>
                <span className="text-slate-500">Weight: 1.5 (URLs, github, projects)</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="font-semibold block text-slate-900">6. Constraints & Risk</span>
                <span className="text-slate-500">Weight: 1.5 (Staff & tech limits)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Seeded Education Challenges */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Active Education Challenges</h2>
            <p className="text-xs text-slate-500">Directly posted by verified education partners</p>
          </div>
          <Link
            href="/problems"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentProblems.map((prob) => {
            const passedCount = prob.pitches.filter((p) => p.passed).length;
            return (
              <div
                key={prob.id}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      {prob.frictionCategory.replace("_", " ")}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
                      {passedCount} Vetted
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base line-clamp-2">
                    {prob.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {prob.description}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 font-medium truncate max-w-[140px]">
                    {prob.organization.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/org/problems/${prob.id}/proposals`}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    >
                      Inbox
                    </Link>
                    <Link
                      href={`/problems/${prob.id}/pitch`}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white"
                    >
                      Pitch
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
