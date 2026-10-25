import Link from "next/link";
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Filter, 
  BookOpen, 
  Inbox,
  Sparkles
} from "lucide-react";

import { ProblemService } from "@/lib/services/problem.service";
import { SlideButton } from "@/components/SlideButton";
import Header from "@/components/ui/hero-01-utils/header";
import { GradientBars } from "@/components/ui/gradient-bars-background";

export const dynamic = "force-dynamic";

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const selectedCategory = searchParams?.category || "ALL";

  const problems = await ProblemService.listProblems({
    category: selectedCategory,
  });

  const categories = [
    { id: "ALL", label: "All Friction Categories" },
    { id: "STUDENT_RETENTION", label: "Student Retention" },
    { id: "SCHEDULING", label: "Scheduling & Rescheduling" },
    { id: "ADMIN_WORKFLOW", label: "Admin Workflow & Quotas" },
  ];

  const getOrgTypeLabel = (type: string) => {
    switch (type) {
      case "COACHING_CENTER":
        return "Coaching Center";
      case "TUITION_ACADEMY":
        return "Tuition Academy";
      case "COLLEGE_DEPT":
        return "College Department";
      default:
        return "Education Org";
    }
  };

  return (
    <div className="relative min-h-screen bg-[rgb(10,10,10)] text-slate-100 overflow-hidden dark">
      {/* Background with Emerald scheme */}
      <GradientBars numBars={15} gradientFrom="rgb(16, 185, 129)" className="opacity-40" />

      <div className="relative z-10">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Education Wedge Challenges</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Open Education Challenges
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Submit your solution through the 5-step guided wizard. Pitches are evaluated instantly by our deterministic 6.0 gate.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/org/problems/new"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <Building2 className="w-4 h-4" />
                <span>Post New Challenge</span>
              </Link>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <Link
                  key={cat.id}
                  href={`/problems${cat.id === "ALL" ? "" : `?category=${cat.id}`}`}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-900/80 text-slate-300 border border-white/10 hover:bg-slate-800"
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}
          </div>

          {/* Problems List */}
          <div className="grid grid-cols-1 gap-6">
            {problems.length === 0 ? (
              <div className="p-16 text-center bg-slate-950/70 rounded-2xl border border-white/10 backdrop-blur-xl shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-slate-400 mx-auto flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">No Education Challenges Posted Yet</h3>
                <p className="text-slate-400 text-xs max-w-md mx-auto">
                  Your challenge feed is ready. Post an operational problem to start receiving quality-vetted pitches from student solvers.
                </p>
                <div className="pt-2">
                  <Link href="/org/problems/new">
                    <SlideButton variant="primary" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Post the First Challenge
                    </SlideButton>
                  </Link>
                </div>
              </div>
            ) : (
              problems.map((problem) => {
                const passedPitches = problem.pitches.filter((p) => p.passed);
                const totalPitches = problem.pitches.length;
                const blockedNoise = totalPitches - passedPitches.length;

                return (
                  <div
                    key={problem.id}
                    className="p-6 sm:p-7 rounded-xl bg-slate-950/70 border border-white/10 backdrop-blur-xl shadow-lg hover:border-emerald-500/40 transition-all flex flex-col md:flex-row md:items-start justify-between gap-6"
                  >
                    <div className="space-y-3.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-900 text-slate-300 border border-white/10 uppercase tracking-wider">
                          {problem.frictionCategory.replace("_", " ")}
                        </span>
                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          <strong className="text-slate-200">{problem.organization.name}</strong> ({getOrgTypeLabel(problem.organization.type)})
                        </span>
                      </div>

                      <h2 className="text-xl font-bold text-white leading-snug">
                        {problem.title}
                      </h2>

                      <p className="text-sm text-slate-400 leading-relaxed max-w-4xl">
                        {problem.description}
                      </p>

                      {/* Quality Filter Proof Metrics */}
                      <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{passedPitches.length} Vetted Proposals</span>
                        </div>

                        <div className="text-slate-400 font-medium">
                          <span>{totalPitches} submissions total</span>
                          {blockedNoise > 0 && (
                            <span className="text-rose-400 font-semibold ml-1">
                              ({blockedNoise} filtered by gate)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action CTA */}
                    <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 justify-end md:w-52 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                      <Link href={`/problems/${problem.id}/pitch`} className="w-full">
                        <SlideButton
                          variant="primary"
                          icon={<ArrowRight className="w-3.5 h-3.5" />}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white border-none"
                        >
                          Submit Pitch
                        </SlideButton>
                      </Link>

                      <Link href={`/org/problems/${problem.id}/proposals`} className="w-full">
                        <SlideButton
                          variant="emerald"
                          icon={<Inbox className="w-3.5 h-3.5" />}
                          className="w-full py-2.5"
                        >
                          Poster Inbox
                        </SlideButton>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
