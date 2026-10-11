"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RotateCcw, 
  ArrowRight, 
  Award, 
  Star,
  FileText,
  Building2,
  ExternalLink,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { ScoreResult } from "@/lib/scoring/engine";

export default function PitchResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const problemId = params?.id as string;
  const pitchId = searchParams?.get("pitchId");

  const [loading, setLoading] = useState(true);
  const [pitchData, setPitchData] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<ScoreResult | null>(null);

  useEffect(() => {
    async function loadResult() {
      if (!pitchId) {
        setLoading(false);
        return;
      }

      // Check session storage cache first for instant feedback
      const cached = sessionStorage.getItem(`pitch_result_${pitchId}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setEvaluation(parsed.evaluation);
          setPitchData(parsed);
          setLoading(false);
          return;
        } catch (e) {}
      }

      // Fallback: fetch from API
      try {
        const res = await fetch(`/api/proposals/${pitchId}`);
        if (res.ok) {
          const data = await res.json();
          setPitchData(data);
          setEvaluation(data.scoreBreakdownParsed);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadResult();
  }, [pitchId]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-medium">Computing deterministic quality score...</p>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Evaluation record not found</h2>
        <Link
          href={`/problems/${problemId}/pitch`}
          className="inline-block px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold"
        >
          Return to Pitch Wizard
        </Link>
      </div>
    );
  }

  const passed = evaluation.passed;
  const knockedOut = evaluation.knockedOut;
  const score = evaluation.overallScore;

  const dimensionList = [
    { key: "problemDiagnosis", name: "1. Problem Diagnosis", weight: 2.0 },
    { key: "solutionActionability", name: "2. Solution Actionability", weight: 2.0 },
    { key: "alternativesDepth", name: "3. Alternatives Depth", weight: 1.5 },
    { key: "pricingTransparency", name: "4. Pricing Transparency", weight: 1.5 },
    { key: "solverProof", name: "5. Solver Proof & Credentials", weight: 1.5 },
    { key: "constraintsFeasibility", name: "6. Constraints & Feasibility", weight: 1.5 },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Top Banner & Status Card */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-lg relative overflow-hidden ${
          passed
            ? "bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white border-emerald-500/40"
            : knockedOut
            ? "bg-gradient-to-br from-rose-950 via-slate-900 to-rose-900 text-white border-rose-500/40"
            : "bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900 text-white border-amber-500/40"
        }`}
      >
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md">
              {passed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Quality Gate Passed (≥ 6.0)</span>
                </>
              ) : knockedOut ? (
                <>
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-rose-300">Tier 1 Binary Knockout</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300">Below Quality Threshold (&lt; 6.0)</span>
                </>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {passed
                ? "Proposal Verified & Submitted!"
                : knockedOut
                ? "Pitch Knocked Out"
                : "Pitch Requires Revision"}
            </h1>

            <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
              {passed
                ? "Your pitch cleared both Tier 1 non-negotiables and the 6.0 Quality Gate. It is now live in the Organization Poster's vetted inbox."
                : knockedOut
                ? "Your submission violated one or more non-negotiable criteria before scoring. Use the explainable diagnostics below to address the gaps."
                : "Your submission met minimum non-negotiables but scored below the 6.0 threshold. Review the dimensional feedback and refine your proposal."}
            </p>

            {/* Credibility Score Reward or Revise Option */}
            {passed ? (
              <div className="pt-2 flex items-center gap-3">
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-200">
                  <TrendingUp className="w-4 h-4 text-emerald-300" />
                  <span>Credibility Score Incremented: <strong>+0.10</strong></span>
                </div>
              </div>
            ) : (
              <div className="pt-3">
                <Link
                  href={`/problems/${problemId}/pitch?revision=true`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-transform hover:scale-[1.02] shadow-md"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-brand-600" />
                  <span>Revise Pitch (Restores Draft Inputs)</span>
                </Link>
              </div>
            )}
          </div>

          {/* Large Visual Score Badge */}
          <div className="shrink-0 text-center bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex flex-col items-center justify-center min-w-[130px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Score
            </span>
            <div className="text-4xl font-black mt-1">
              {score}
              <span className="text-lg font-normal text-slate-400">/10</span>
            </div>
            <div className="mt-2 text-[10px] font-semibold text-slate-300">
              Threshold: 6.0
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Diagnostic Feedback */}
      {evaluation.actionableFeedback && evaluation.actionableFeedback.length > 0 && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Explainable Diagnostic Feedback</span>
          </div>

          <div className="space-y-2.5">
            {evaluation.actionableFeedback.map((fb, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl text-xs font-medium border flex items-start gap-2.5 ${
                  fb.startsWith("KNOCKOUT:")
                    ? "bg-rose-50 text-rose-800 border-rose-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-current mt-1.5 shrink-0" />
                <span className="leading-relaxed">{fb}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6-Dimension Score Breakdown */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">6-Dimension Quality Breakdown</h3>
            <p className="text-xs text-slate-500">Pure deterministic scoring weighted out of 10.0</p>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
            Total: {score} / 10.0
          </span>
        </div>

        <div className="space-y-4">
          {dimensionList.map((dim) => {
            const data = (evaluation.dimensions as any)?.[dim.key];
            if (!data) return null;
            const percentage = Math.round((data.score / dim.weight) * 100);

            return (
              <div key={dim.key} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>{dim.name}</span>
                  <span>
                    {data.score} / {dim.weight}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      percentage >= 75
                        ? "bg-emerald-500"
                        : percentage >= 50
                        ? "bg-indigo-500"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-600 font-medium">
                  {data.feedback}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <Link
          href="/problems"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
        >
          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          <span>Back to Challenges</span>
        </Link>

        <div className="flex items-center gap-3">
          {!passed ? (
            <Link
              href={`/problems/${problemId}/pitch?revision=true`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Revise Pitch Now</span>
            </Link>
          ) : (
            <Link
              href={`/org/proposals/${pitchId}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-brand-400" />
              <span>View Standardized Proposal (PDF Export)</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
