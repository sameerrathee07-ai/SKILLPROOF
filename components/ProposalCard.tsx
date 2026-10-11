import React from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Download, ExternalLink } from "lucide-react";
import { SlideButton } from "./SlideButton";

interface ProposalCardProps {
  proposalId: string;
  solverName: string;
  solverRole?: string;
  score: number;
  passed: boolean;
  fixedQuote?: string;
  deliveryTime?: string;
  alternativesCount?: number;
  targetOrgName?: string;
  onDownloadPdf?: () => void;
}

export function ProposalCard({
  proposalId,
  solverName,
  solverRole = "CS & EdTech Specialist",
  score,
  passed,
  fixedQuote = "Quoted in Proposal",
  deliveryTime = "2-4 Weeks",
  alternativesCount = 2,
  targetOrgName = "Partner School",
  onDownloadPdf,
}: ProposalCardProps) {
  const initials = solverName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative w-full max-w-[340px] shrink-0 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg group flex flex-col justify-between">
      {/* Top Banner & Status */}
      <div className="w-full bg-slate-900 px-4 py-2.5 flex items-center justify-between text-xs text-white">
        <span className="inline-flex items-center gap-1.5 font-bold tracking-wider uppercase text-[10px] text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          {passed ? "Gate Passed" : "Under Revision"}
        </span>
        <div className="flex items-center gap-1">
          <span className="font-mono text-emerald-300 font-bold text-sm">
            {score.toFixed(1)}
          </span>
          <span className="text-[11px] text-slate-400">/ 10.0</span>
        </div>
      </div>

      {/* Solver Identity */}
      <div className="pt-6 pb-2 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="h-18 w-18 h-[72px] w-[72px] rounded-full border-2 border-slate-900 bg-slate-100 flex items-center justify-center text-xl font-black text-slate-800 shadow-inner">
            {initials}
          </div>
          <span
            className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-1 text-white border-2 border-white shadow-sm"
            title="Verified Solver Credentials"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="mt-3 text-center px-4">
          <h3 className="text-base font-bold text-slate-900 leading-tight">
            {solverName}
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-0.5">{solverRole}</p>
        </div>
      </div>

      {/* Stats Breakdown Rows */}
      <div className="px-5 py-3">
        <ul className="flex flex-col gap-2.5 text-xs text-slate-700">
          <li className="flex items-center justify-between border-b border-dotted border-slate-200 pb-1.5 font-medium">
            <span className="flex items-center gap-2 text-slate-500">
              <span>💰</span> Fixed Quote
            </span>
            <span className="font-bold text-slate-900 truncate max-w-[140px]">
              {fixedQuote}
            </span>
          </li>

          <li className="flex items-center justify-between border-b border-dotted border-slate-200 pb-1.5 font-medium">
            <span className="flex items-center gap-2 text-slate-500">
              <span>⏱️</span> Delivery Timeline
            </span>
            <span className="font-bold text-slate-900">{deliveryTime}</span>
          </li>

          <li className="flex items-center justify-between border-b border-dotted border-slate-200 pb-1.5 font-medium">
            <span className="flex items-center gap-2 text-slate-500">
              <span>⚖️</span> Trade-offs Evaluated
            </span>
            <span className="font-bold text-slate-900">
              {alternativesCount} Approaches
            </span>
          </li>

          <li className="flex items-center justify-between pb-1 font-medium">
            <span className="flex items-center gap-2 text-slate-500">
              <span>🏛️</span> Target Org
            </span>
            <span className="font-semibold text-slate-700 truncate max-w-[140px]">
              {targetOrgName}
            </span>
          </li>
        </ul>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-2 border-t border-slate-100 flex flex-col gap-2">
        <Link
          href={`/org/proposals/${proposalId}`}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-slate-300" />
          Standardized PDF Proposal
        </Link>
      </div>
    </div>
  );
}
