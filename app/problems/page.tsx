import Link from "next/link";
import { prisma } from "@/lib/db";
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Filter, 
  Calendar, 
  BookOpen, 
  Clock, 
  ShieldCheck,
  Inbox
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const selectedCategory = searchParams?.category || "ALL";

  const whereClause: any = {};
  if (selectedCategory !== "ALL") {
    whereClause.frictionCategory = selectedCategory;
  }

  const problems = await prisma.problem.findMany({
    where: whereClause,
    include: {
      organization: true,
      pitches: {
        select: {
          id: true,
          passed: true,
          score: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Education Wedge Challenges</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Open Education Challenges
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Submit your solution through the 5-step guided wizard. Pitches are evaluated instantly by our deterministic 6.0 gate.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/org/problems/new"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
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
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-sm">No problems found in this category.</p>
          </div>
        ) : (
          problems.map((problem) => {
            const passedPitches = problem.pitches.filter((p) => p.passed);
            const totalPitches = problem.pitches.length;
            const blockedNoise = totalPitches - passedPitches.length;

            return (
              <div
                key={problem.id}
                className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-brand-300 transition-all flex flex-col md:flex-row md:items-start justify-between gap-6"
              >
                <div className="space-y-3.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                      {problem.frictionCategory.replace("_", " ")}
                    </span>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <strong className="text-slate-700">{problem.organization.name}</strong> ({getOrgTypeLabel(problem.organization.type)})
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 leading-snug">
                    {problem.title}
                  </h2>

                  <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
                    {problem.description}
                  </p>

                  {/* Quality Filter Proof Metrics */}
                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/50">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{passedPitches.length} Vetted Proposals</span>
                    </div>

                    <div className="text-slate-500 font-medium">
                      <span>{totalPitches} submissions total</span>
                      {blockedNoise > 0 && (
                        <span className="text-rose-600 font-semibold ml-1">
                          ({blockedNoise} blocked at quality gate)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 justify-end md:w-48 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <Link
                    href={`/problems/${problem.id}/pitch`}
                    className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-md shadow-brand-500/20 hover:scale-[1.02] text-center"
                  >
                    <span>Submit Pitch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/org/problems/${problem.id}/proposals`}
                    className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors text-center"
                  >
                    <Inbox className="w-3.5 h-3.5 text-slate-500" />
                    <span>Poster Inbox</span>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
