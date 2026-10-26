import React from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface KnockoutCardProps {
  reason: string;
  checks?: {
    hasPricing: boolean;
    hasAlternatives: boolean;
    hasMinEffort: boolean;
  };
  onReviseClick?: () => void;
  problemId?: string;
  reviseStep?: number;
}

export function KnockoutCard({
  reason,
  checks = {
    hasPricing: true,
    hasAlternatives: false,
    hasMinEffort: true,
  },
  onReviseClick,
  problemId,
  reviseStep = 3,
}: KnockoutCardProps) {
  return (
    <div className="relative mx-auto w-full max-w-lg rounded-2xl border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5">
      {/* "WAIT!" / "KNOCKOUT!" Badge */}
      <div className="absolute -top-3.5 -right-3 rotate-6 rounded-md border-2 border-black bg-rose-500 px-3.5 py-1 text-xs font-black tracking-wider text-white uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        KNOCKOUT!
      </div>

      {/* Comic Speech Bubble */}
      <div className="relative mx-auto mb-6 w-full rounded-2xl border-3 border-black bg-amber-100 p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-900 stroke-[2.5]" />
          <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">
            Tier 1 Disqualification
          </h4>
        </div>

        <p className="mt-2 text-xs font-bold leading-relaxed text-slate-800">
          &ldquo;{reason}&rdquo;
        </p>

        {/* Pointer triangle */}
        <div className="absolute -bottom-3 left-10 h-0 w-0 border-x-8 border-x-transparent border-t-8 border-t-black" />
      </div>

      {/* Character Face & Binary Checklist */}
      <div className="flex items-center justify-between gap-5 my-4 bg-slate-50 p-4 rounded-xl border-2 border-black">
        {/* Comic Alert Face */}
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-3 border-black bg-rose-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {/* Eyes */}
          <div className="absolute top-4 flex w-full justify-around px-2.5">
            <span className="h-3 w-3 rounded-full border-2 border-black bg-white flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
            </span>
            <span className="h-3 w-3 rounded-full border-2 border-black bg-white flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
            </span>
          </div>
          {/* Mouth */}
          <div className="absolute bottom-3.5 h-1.5 w-6 rounded-full bg-black" />
        </div>

        {/* Diagnostic Checklist */}
        <div className="flex-1 space-y-1.5 text-xs font-bold">
          <div
            className={`flex items-center gap-2 ${
              checks.hasAlternatives ? "text-emerald-700" : "text-rose-600"
            }`}
          >
            {checks.hasAlternatives ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            <span>&ge; 2 Alternatives Evaluated</span>
          </div>

          <div
            className={`flex items-center gap-2 ${
              checks.hasPricing ? "text-emerald-700" : "text-rose-600"
            }`}
          >
            {checks.hasPricing ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            <span>Explicit Pricing & Budget Quoted</span>
          </div>

          <div
            className={`flex items-center gap-2 ${
              checks.hasMinEffort ? "text-emerald-700" : "text-rose-600"
            }`}
          >
            {checks.hasMinEffort ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            <span>Pitch Length &ge; 200 Characters</span>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="mt-5 pt-3 border-t-2 border-black flex flex-wrap justify-between items-center gap-2">
        <div>
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide">
            Gate Status:
          </span>
          <span className="ml-1 text-xs font-black text-rose-600 uppercase">
            Disqualified (Score: 0.0)
          </span>
        </div>

        {onReviseClick ? (
          <button
            type="button"
            onClick={onReviseClick}
            className="rounded-lg border-2 border-black bg-amber-400 px-4 py-2 text-xs font-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            Fix Step {reviseStep} &rarr;
          </button>
        ) : problemId ? (
          <Link
            href={`/problems/${problemId}/pitch?revision=true&step=${reviseStep}`}
            className="rounded-lg border-2 border-black bg-amber-400 px-4 py-2 text-xs font-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all inline-block"
          >
            Fix Step {reviseStep} &rarr;
          </Link>
        ) : null}
      </div>
    </div>
  );
}
