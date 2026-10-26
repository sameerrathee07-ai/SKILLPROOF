"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  Calendar, 
  DollarSign, 
  Layers,
  ExternalLink,
  Lock
} from "lucide-react";
import { SlideButton } from "@/components/SlideButton";


export default function StandardizedProposalPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params?.id as string;

  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProposal() {
      try {
        const res = await fetch(`/api/proposals/${proposalId}`);
        if (res.ok) {
          const data = await res.json();
          setProposal(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    if (proposalId) {
      loadProposal();
    }
  }, [proposalId]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-300 font-medium">Loading standardized proposal document...</p>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="py-24 text-center max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-bold text-white">Proposal not found</h2>
        <Link href="/problems" className="text-sm font-semibold text-sky-400">
          Back to all challenges
        </Link>
      </div>
    );
  }

  const stepData = proposal.stepDataParsed || {};
  const scoreBreakdown = proposal.scoreBreakdownParsed || {};
  const alternatives = Array.isArray(stepData.step3Alternatives)
    ? stepData.step3Alternatives
    : [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Action Header (Hidden during Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <Link
          href={`/org/problems/${proposal.problemId}/proposals`}
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Problem Vetted Inbox
        </Link>

        <div className="flex items-center gap-3">
          <SlideButton
            type="button"
            onClick={handlePrint}
            variant="primary"
            icon={<Printer className="w-4 h-4 text-slate-400" />}
            className="px-5 py-2.5 font-bold"
          >
            <span>Download Proposal (PDF / Print)</span>
          </SlideButton>
        </div>
      </div>

      {/* Standardized A4 Printable Document Container */}
      <div className="print-page bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-lg space-y-8 max-w-4xl mx-auto">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  SP
                </div>
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                  SkillProof Standardized Proposal
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 uppercase font-semibold tracking-wider">
                Education Wedge Quality-Gated Specification
              </p>
            </div>

            {/* Quality Seal */}
            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Vetted Score: {proposal.score.toFixed(1)} / 10.0</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                Ref ID: {proposal.id.substring(0, 12)}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md uppercase">
              {proposal.problem.frictionCategory.replace("_", " ")}
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1 leading-snug">
              {proposal.problem.title}
            </h1>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 text-xs border-t border-slate-100">
            <div>
              <span className="block text-slate-400 font-medium">Organization</span>
              <strong className="text-slate-800">{proposal.problem.organization.name}</strong>
            </div>
            <div>
              <span className="block text-slate-400 font-medium">Student Solver</span>
              <strong className="text-slate-800">{proposal.solver.name}</strong>
            </div>
            <div>
              <span className="block text-slate-400 font-medium">Credibility Rating</span>
              <strong className="text-emerald-700">★ {proposal.solver.credibilityScore.toFixed(2)}</strong>
            </div>
            <div>
              <span className="block text-slate-400 font-medium">Submission Date</span>
              <strong className="text-slate-800">
                {new Date(proposal.createdAt).toLocaleDateString()}
              </strong>
            </div>
          </div>
        </div>

        {/* Section 1: Problem Diagnosis */}
        <div className="space-y-2">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>01</span>
            <span>Problem Diagnosis & Root Cause</span>
          </h2>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
            {stepData.step1Diagnosis}
          </div>
        </div>

        {/* Section 2: Solution Architecture & Deliverables */}
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>02</span>
            <span>Proposed Technical Architecture & Deliverables</span>
          </h2>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
            {stepData.step2Solution}
          </div>

          {stepData.step2Deliverables && (
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-950 space-y-1">
              <strong className="block font-bold text-indigo-900 uppercase tracking-wider">
                Concrete Deliverables:
              </strong>
              <p className="leading-relaxed">{stepData.step2Deliverables}</p>
            </div>
          )}
        </div>

        {/* Section 3: Phased Milestones Timeline */}
        {stepData.step2Milestones && (
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span>03</span>
              <span>Phased Timeline Milestones</span>
            </h2>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-800 font-medium">
              {stepData.step2Milestones}
            </div>
          </div>
        )}

        {/* Section 4: Evaluated Alternatives & Trade-offs */}
        {alternatives.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span>04</span>
              <span>Evaluated Alternatives & Trade-Off Analysis</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {alternatives.map((alt: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                  <div className="font-bold text-slate-900">{alt.name}</div>
                  {alt.pros && (
                    <div>
                      <span className="font-semibold text-emerald-700">Pros: </span>
                      <span className="text-slate-600">{alt.pros}</span>
                    </div>
                  )}
                  {alt.cons && (
                    <div>
                      <span className="font-semibold text-rose-700">Cons: </span>
                      <span className="text-slate-600">{alt.cons}</span>
                    </div>
                  )}
                  {alt.rejectionReason && (
                    <div className="pt-1 border-t border-slate-100 text-slate-500 italic">
                      <span className="font-semibold text-slate-700 not-italic">Rejection rationale: </span>
                      {alt.rejectionReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 5: Budget & Pricing Transparency */}
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>05</span>
            <span>Budget & Milestone Breakdown</span>
          </h2>
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
            <div className="text-base font-bold text-emerald-400">
              {stepData.step4Budget}
            </div>
            {stepData.step4CostBreakdown && (
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Infrastructure & Ongoing Cost:</strong> {stepData.step4CostBreakdown}
              </p>
            )}
          </div>
        </div>

        {/* Section 6: Solver Proof & Links */}
        <div className="space-y-2">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>06</span>
            <span>Solver Experience & Verifiable Credentials</span>
          </h2>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-800 space-y-2">
            <p className="leading-relaxed">{stepData.step5Experience}</p>
            {stepData.step5ProofLinks && (
              <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-brand-600 font-mono">
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{stepData.step5ProofLinks}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 7: Constraints & Operational Risk */}
        {stepData.step5Constraints && (
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span>07</span>
              <span>Constraints & Operational Risk Mitigation</span>
            </h2>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 leading-relaxed">
              {stepData.step5Constraints}
            </div>
          </div>
        )}

        {/* Verification Footer & Sign-off */}
        <div className="pt-8 border-t-2 border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs text-slate-500">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>SkillProof Deterministic Verification Gate</span>
            </div>
            <p className="text-[11px]">
              Gated by Binary Knockouts and 6.0/10.0 Quality Threshold. Zero external LLM hallucination.
            </p>
          </div>

          <div className="border-t border-slate-300 pt-2 w-48 text-center text-[10px] text-slate-400 uppercase tracking-wider">
            Organization Approval & Sign-Off
          </div>
        </div>
      </div>
    </div>
  );
}
