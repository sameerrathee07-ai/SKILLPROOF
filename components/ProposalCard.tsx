import Link from "next/link";
import { CheckCircle2, FileText, Clock, DollarSign, Layers } from "lucide-react";

interface ProposalCardProps {
  proposalId: string;
  solverName: string;
  score: number;
  passed: boolean;
  fixedQuote: string;
  deliveryTime: string;
  alternativesCount: number;
  targetOrgName: string;
}

export function ProposalCard({
  proposalId,
  solverName,
  score,
  passed,
  fixedQuote,
  deliveryTime,
  alternativesCount,
  targetOrgName,
}: ProposalCardProps) {
  const initial = solverName.charAt(0).toUpperCase();

  return (
    <div className="group p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex flex-col justify-between gap-4">
      {/* Header: Score + Solver */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            {score.toFixed(1)} / 10
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px] font-bold">
              {initial}
            </div>
            <span className="text-xs font-semibold text-slate-800 truncate max-w-[100px]">
              {solverName}
            </span>
          </div>
        </div>

        {/* Quote + Delivery + Alternatives */}
        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-800 truncate">{fixedQuote.substring(0, 60)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{deliveryTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{alternativesCount} alternatives evaluated</span>
          </div>
        </div>
      </div>

      {/* Footer: Org + CTA */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">
          {targetOrgName}
        </span>
        <Link
          href={`/org/proposals/${proposalId}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition-colors group-hover:scale-[1.02]"
        >
          <FileText className="w-3 h-3 text-brand-400" />
          <span>Review</span>
        </Link>
      </div>
    </div>
  );
}
