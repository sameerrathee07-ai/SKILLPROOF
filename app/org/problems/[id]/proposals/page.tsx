import Link from "next/link";
import { prisma } from "@/lib/db";
import { 
  Building2, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Star, 
  Clock, 
  DollarSign, 
  Filter,
  Eye,
  AlertTriangle
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VettedInboxPage({
  params,
}: {
  params: { id: string };
}) {
  const problem = await prisma.problem.findUnique({
    where: { id: params.id },
    include: {
      organization: true,
      pitches: {
        include: {
          solver: true,
        },
        orderBy: {
          score: "desc",
        },
      },
    },
  });

  if (!problem) {
    return (
      <div className="py-24 text-center max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Problem not found</h2>
        <Link href="/problems" className="text-sm font-semibold text-brand-600">
          Back to all challenges
        </Link>
      </div>
    );
  }

  // Filter ONLY vetted proposals that passed (>= 6.0 and not knocked out)
  const vettedProposals = problem.pitches.filter((p) => p.passed);
  const totalSubmissions = problem.pitches.length;
  const blockedNoise = totalSubmissions - vettedProposals.length;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Breadcrumb & Problem Summary */}
      <div className="space-y-3">
        <Link
          href="/problems"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to all challenges
        </Link>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase">
              {problem.frictionCategory.replace("_", " ")}
            </span>
            <span className="text-xs font-medium text-slate-500">
              Organization: <strong className="text-slate-800">{problem.organization.name}</strong>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 leading-tight">
            {problem.title}
          </h1>

          <p className="text-sm text-slate-600 line-clamp-2">
            {problem.description}
          </p>
        </div>
      </div>

      {/* Noise Gate Shielding Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-center">
          <div className="text-2xl font-black text-slate-800">{totalSubmissions}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Total Submissions Received</div>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 shadow-sm text-center">
          <div className="text-2xl font-black text-rose-600">{blockedNoise}</div>
          <div className="text-xs text-rose-700 font-medium mt-1">
            Low-Quality Pitches Blocked at Gate
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 shadow-sm text-center">
          <div className="text-2xl font-black text-emerald-700">{vettedProposals.length}</div>
          <div className="text-xs text-emerald-800 font-semibold mt-1">
            Vetted Proposals in Poster Inbox (Score ≥ 6.0)
          </div>
        </div>
      </div>

      {/* Vetted Inbox Proposals List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Vetted Proposal Inbox
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Strict Filter: passed === true
          </span>
        </div>

        {vettedProposals.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-800">
              No pitches have cleared the 6.0 quality threshold yet.
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              SkillProof shields your inbox from half-baked submissions. Only pitches passing Tier 1 knockouts and scoring ≥ 6.0 appear here.
            </p>
            <div className="pt-2">
              <Link
                href={`/problems/${problem.id}/pitch`}
                className="inline-block px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold"
              >
                Submit a Qualifying Pitch as Solver
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {vettedProposals.map((proposal) => {
              let stepDataParsed: any = {};
              try {
                stepDataParsed = JSON.parse(proposal.stepData);
              } catch (e) {}

              return (
                <div
                  key={proposal.id}
                  className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-brand-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Score Badge */}
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Gate Score: {proposal.score.toFixed(1)} / 10.0
                      </span>

                      {/* Solver info */}
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-700 font-bold">
                          {proposal.solver.name.charAt(0)}
                        </div>
                        {proposal.solver.name}
                      </span>

                      {/* Credibility pill */}
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        Credibility: ★ {proposal.solver.credibilityScore.toFixed(2)}
                      </span>

                      {proposal.revisionCount > 0 && (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {proposal.revisionCount} revisions
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-semibold text-slate-900 line-clamp-1">
                      {stepDataParsed.step2Solution || "Comprehensive educational solution"}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {stepDataParsed.step1Diagnosis}
                    </p>

                    {/* Deliverables and Budget Preview */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      {stepDataParsed.step4Budget && (
                        <span className="font-medium text-slate-800">
                          <strong>Budget:</strong> {stepDataParsed.step4Budget.substring(0, 50)}
                        </span>
                      )}
                      <span>
                        Submitted: {new Date(proposal.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Review Proposal CTA */}
                  <div className="shrink-0 flex items-center gap-2">
                    <Link
                      href={`/org/proposals/${proposal.id}`}
                      className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all hover:scale-[1.02]"
                    >
                      <FileText className="w-3.5 h-3.5 text-brand-400" />
                      <span>Review Proposal (PDF)</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
