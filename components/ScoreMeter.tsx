import React from "react";

export interface ScoreTubeData {
  label: string;
  score: number; // 0 to 10
  maxScore?: number;
  weight?: number;
}

interface ScoreMeterProps {
  overallScore: number; // 0 to 10
  passed: boolean;
  knockedOut?: boolean;
  dimensions: {
    problemDiagnosis?: { score: number; maxScore: number };
    solutionActionability?: { score: number; maxScore: number };
    alternativesDepth?: { score: number; maxScore: number };
    pricingTransparency?: { score: number; maxScore: number };
    solverProof?: { score: number; maxScore: number };
    constraintsFeasibility?: { score: number; maxScore: number };
  };
}

export function ScoreMeter({
  overallScore,
  passed,
  knockedOut = false,
  dimensions,
}: ScoreMeterProps) {
  const tubes: ScoreTubeData[] = [
    {
      label: "Problem Diagnosis",
      score: dimensions.problemDiagnosis?.score ?? 0,
      maxScore: dimensions.problemDiagnosis?.maxScore ?? 10,
    },
    {
      label: "Solution Feasibility",
      score: dimensions.solutionActionability?.score ?? 0,
      maxScore: dimensions.solutionActionability?.maxScore ?? 10,
    },
    {
      label: "Alternative Depth",
      score: dimensions.alternativesDepth?.score ?? 0,
      maxScore: dimensions.alternativesDepth?.maxScore ?? 10,
    },
    {
      label: "Pricing Breakdown",
      score: dimensions.pricingTransparency?.score ?? 0,
      maxScore: dimensions.pricingTransparency?.maxScore ?? 10,
    },
    {
      label: "Proof & Credentials",
      score: dimensions.solverProof?.score ?? 0,
      maxScore: dimensions.solverProof?.maxScore ?? 10,
    },
    {
      label: "Constraints & Edge Cases",
      score: dimensions.constraintsFeasibility?.score ?? 0,
      maxScore: dimensions.constraintsFeasibility?.maxScore ?? 10,
    },
  ];

  return (
    <div className="w-full rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Tier 2: 6-Dimension Quality Meter
            </h3>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Deterministic Gate
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Requires average score &ge; 6.0 / 10.0 with zero knockouts to qualify for poster review.
          </p>
        </div>

        <div className="text-right">
          <div className="flex items-baseline justify-end gap-1">
            <span
              className={`text-3xl font-black ${
                passed ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {overallScore.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 10.0</span>
          </div>

          <div
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block mt-1 ${
              passed
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : knockedOut
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {passed ? "PASSED GATE" : knockedOut ? "KNOCKED OUT (SCORE: 0)" : "REVISION REQUIRED (<6.0)"}
          </div>
        </div>
      </div>

      {/* 6 Tubes Area */}
      <div className="flex items-end justify-between px-2 gap-3 h-44">
        {tubes.map((tube, index) => {
          const max = tube.maxScore || 10;
          const percentage = Math.min(100, Math.max(8, (tube.score / max) * 100));
          const isPassingDim = tube.score >= 6.0;

          return (
            <div
              key={index}
              className="flex flex-1 flex-col items-center gap-2 h-full justify-end group cursor-default"
            >
              {/* Numeric indicator */}
              <span
                className={`text-xs font-bold transition-transform group-hover:scale-110 ${
                  isPassingDim ? "text-slate-800" : "text-rose-600"
                }`}
              >
                {tube.score.toFixed(1)}
              </span>

              {/* Cylindrical Tube */}
              <div className="relative w-6 h-28 rounded-full bg-slate-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.08),inset_-2px_-2px_4px_#ffffff] overflow-hidden flex flex-col justify-end p-0.5 border border-slate-200/60">
                <div
                  className={`w-full rounded-full transition-all duration-700 ease-out shadow-sm ${
                    isPassingDim
                      ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                      : "bg-gradient-to-t from-rose-600 to-rose-400"
                  }`}
                  style={{ height: `${percentage}%` }}
                />
              </div>

              {/* Label */}
              <span className="text-[11px] font-medium text-slate-600 text-center leading-tight line-clamp-2 h-7 flex items-center justify-center">
                {tube.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend & Threshold Marker */}
      <div className="mt-6 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>Meets Threshold (&ge; 6.0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span>Below Threshold (&lt; 6.0)</span>
          </div>
        </div>

        <span className="text-[11px] font-medium text-slate-400">
          Target Threshold: 6.0 / 10.0
        </span>
      </div>
    </div>
  );
}
