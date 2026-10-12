import Link from "next/link";
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
import { ProposalCard } from "@/components/ProposalCard";
import { PitchService } from "@/lib/services/pitch.service";

export const dynamic = "force-dynamic";

export default async function VettedInboxPage({
  params,
}: {
  params: { id: string };
}) {
  let inboxData;
  try {
    inboxData = await PitchService.getVettedInbox(params.id);
  } catch {
    return (
      <div className="py-24 text-center max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Problem not found</h2>
        <Link href="/problems" className="text-sm font-semibold text-brand-600">
          Back to all challenges
        </Link>
      </div>
    );
  }

  const { problem, totalSubmissions, blockedNoise, proposals: vettedProposals } = inboxData;

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
            <span className="text-[11px] font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md uppercase">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vettedProposals.map((proposal) => {
              const stepData = (proposal.stepDataParsed || {}) as any;
              const altCount = Array.isArray(stepData.step3Alternatives)
                ? stepData.step3Alternatives.length
                : 2;

              return (
                <ProposalCard
                  key={proposal.id}
                  proposalId={proposal.id}
                  solverName={proposal.solver.name}
                  score={proposal.score}
                  passed={proposal.passed}
                  fixedQuote={stepData.step4Budget || "Quoted in Proposal"}
                  deliveryTime={stepData.step2Milestones ? "2-3 Sprints" : "3 Weeks"}
                  alternativesCount={altCount}
                  targetOrgName={problem.organization.name}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
