"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  ShieldCheck,
  Award,
  ExternalLink,
  Mail,
  Save,
  X,
} from "lucide-react";
import { SlideButton } from "@/components/SlideButton";
import { normalizeUrl } from "@/lib/utils";


export default function StandardizedProposalPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params?.id as string;

  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("SUBMITTED");
  const [posterNotes, setPosterNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const actionLock = useRef(false);

  useEffect(() => {
    async function loadProposal() {
      try {
        const res = await fetch(`/api/proposals/${proposalId}`);
        if (res.ok) {
          const data = await res.json();
          setProposal(data);
          setStatus(data.status || "SUBMITTED");
          setPosterNotes(data.posterNotes || "");
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

  const updateStatus = async (nextStatus: string) => {
    if (actionLock.current) return;
    actionLock.current = true;
    setSaving(true);
    setActionError("");

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(`/api/proposals/${proposalId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, posterNotes }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Could not update the proposal.");
      }

      setProposal((current: any) => ({ ...current, ...data }));
      setStatus(data.status || nextStatus);
      setPosterNotes(data.posterNotes || "");
    } catch (error) {
      setActionError(
        error instanceof DOMException && error.name === "AbortError"
          ? "The request timed out. Please try again."
          : error instanceof Error
            ? error.message
            : "Could not update the proposal."
      );
    } finally {
      window.clearTimeout(timeoutId);
      actionLock.current = false;
      setSaving(false);
    }
  };

  const canContact = status === "SHORTLISTED" || status === "ACCEPTED";
  const proofLinks = String(stepData.step5ProofLinks || "")
    .split(/[\n,]+/)
    .map((link) => link.trim())
    .filter(Boolean);

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

      <div className="no-print rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Review status
          </span>
          <span
            className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-bold ${
              status === "ACCEPTED"
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : status === "SHORTLISTED"
                  ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                  : status === "DECLINED"
                    ? "border-rose-400/30 bg-rose-400/10 text-rose-300"
                    : "border-white/10 bg-white/5 text-slate-300"
            }`}
          >
            {status.replace("_", " ")}
          </span>

          <div className="flex flex-wrap gap-2 sm:ml-auto">
            <button
              type="button"
              onClick={() => updateStatus("SHORTLISTED")}
              disabled={saving || status === "SHORTLISTED"}
              className="rounded-md border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-200 transition-colors hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Shortlist Proposal
            </button>
            <button
              type="button"
              onClick={() => updateStatus("ACCEPTED")}
              disabled={saving || status === "ACCEPTED"}
              className="rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-200 transition-colors hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Accept Proposal
            </button>
            <button
              type="button"
              onClick={() => updateStatus("DECLINED")}
              disabled={saving || status === "DECLINED"}
              className="rounded-md border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-xs font-bold text-rose-200 transition-colors hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Decline
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <textarea
            value={posterNotes}
            onChange={(event) => setPosterNotes(event.target.value)}
            maxLength={4000}
            rows={2}
            placeholder="Private review note for the solver..."
            className="w-full resize-y rounded-md border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400/50 focus:outline-none"
          />
          <div className="flex flex-wrap items-end gap-2">
            <button
              type="button"
              onClick={() => updateStatus(status)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              Save Note
            </button>
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              disabled={!canContact}
              className="inline-flex items-center gap-1.5 rounded-md border border-sky-400/30 bg-sky-400/10 px-3 py-2 text-xs font-bold text-sky-200 transition-colors hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Mail className="h-3.5 w-3.5" />
              Contact Solver
            </button>
          </div>
        </div>

        {actionError && (
          <p className="text-xs font-semibold text-rose-300">{actionError}</p>
        )}
      </div>

      {contactOpen && (
        <div
          className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setContactOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-white/10 bg-slate-900 p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white">Contact Solver</h2>
                <p className="text-xs text-slate-400">
                  Verified details released after shortlisting.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setContactOpen(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Close contact dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Email
                </span>
                {proposal.solver.email ? (
                  <a
                    href={`mailto:${proposal.solver.email}`}
                    className="font-semibold text-sky-300 hover:text-sky-200"
                  >
                    {proposal.solver.email}
                  </a>
                ) : (
                  <span className="text-slate-400">
                    Shortlist or accept the proposal to release contact details.
                  </span>
                )}
              </div>
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Headline
                </span>
                <span className="text-slate-200">
                  {proposal.solver.headline || "No headline provided."}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Portfolio
                </span>
                {proofLinks.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {proofLinks.map((link) => (
                      <a
                        key={link}
                        href={normalizeUrl(link)}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate font-mono text-xs text-sky-300 hover:text-sky-200"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400">No proof links provided.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
              <strong className="inline-flex items-center gap-1 text-emerald-700">
                <Award className="h-3.5 w-3.5" />
                {proposal.solver.credibilityScore.toFixed(2)}
              </strong>
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
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 text-xs text-slate-900 space-y-1">
              <strong className="block font-bold uppercase tracking-wider text-amber-900">
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
            {proofLinks.length > 0 && (
              <div className="flex flex-col gap-1 border-t border-slate-200/60 pt-2 font-mono text-brand-600">
                {proofLinks.map((link) => (
                  <a
                    key={link}
                    href={normalizeUrl(link)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{link}</span>
                  </a>
                ))}
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
