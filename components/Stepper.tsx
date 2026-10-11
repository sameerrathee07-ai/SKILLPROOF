import React from "react";
import { Check } from "lucide-react";

export interface StepItem {
  id: number;
  title: string;
  description: string;
}

const DEFAULT_STEPS: StepItem[] = [
  { id: 1, title: "Problem Breakdown", description: "Root friction & constraints" },
  { id: 2, title: "Proposed Architecture", description: "Stack, schema & system flow" },
  { id: 3, title: "Alternative Analysis", description: "Min 2 approaches (Knockout rule)" },
  { id: 4, title: "Timeline & Pricing", description: "Fixed budget & milestone specs" },
  { id: 5, title: "Proof & Gate Review", description: "Run deterministic gate check" },
];

interface StepperProps {
  currentStep: number;
  steps?: StepItem[];
  onStepClick?: (stepId: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
  canPrev?: boolean;
  canNext?: boolean;
  nextLabel?: string;
}

export function Stepper({
  currentStep,
  steps = DEFAULT_STEPS,
  onStepClick,
  onPrev,
  onNext,
  canPrev = true,
  canNext = true,
  nextLabel = "Next",
}: StepperProps) {
  return (
    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
      <div className="relative space-y-6">
        {steps.map((step, idx) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.id} className="relative flex items-start gap-4">
              {/* Connecting vertical line */}
              {!isLast && (
                <div
                  className={`absolute left-4 top-9 bottom-[-24px] w-0.5 transition-colors ${
                    isCompleted ? "bg-slate-900" : "bg-slate-200"
                  }`}
                />
              )}

              {/* Number / Checkmark Circle */}
              <button
                type="button"
                onClick={() => onStepClick && onStepClick(step.id)}
                disabled={step.id > currentStep}
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  isCompleted
                    ? "bg-slate-900 text-white shadow-sm"
                    : isCurrent
                    ? "border-2 border-slate-900 bg-white text-slate-900 shadow-sm"
                    : "border border-slate-300 bg-white text-slate-400 cursor-not-allowed"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
              </button>

              {/* Step info & Badge */}
              <div className="flex-1 pt-0.5">
                <p
                  className={`text-sm font-semibold transition-colors ${
                    isCurrent || isCompleted ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {step.title}
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      isCompleted
                        ? "bg-emerald-50 text-emerald-700"
                        : isCurrent
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isCompleted ? "Completed" : isCurrent ? "In Progress" : "Pending"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stepper Controls */}
      {(onPrev || onNext) && (
        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-4">
          {onPrev ? (
            <button
              type="button"
              onClick={onPrev}
              disabled={!canPrev}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              &larr; Previous
            </button>
          ) : (
            <div />
          )}

          {onNext && (
            <button
              type="button"
              onClick={onNext}
              disabled={!canNext}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {nextLabel} &rarr;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
