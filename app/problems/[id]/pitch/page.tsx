"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Sparkles,
  Info,
  DollarSign,
  Layers,
  Wand2
} from "lucide-react";
import { Stepper } from "@/components/Stepper";
import { SlideButton } from "@/components/SlideButton";


interface AlternativeItem {
  name: string;
  pros: string;
  cons: string;
  rejectionReason: string;
}

import { usePitchForm } from "@/lib/hooks/usePitchForm";

export default function PitchWizardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const problemId = params?.id as string;
  const isRevision = searchParams?.get("revision") === "true";

  const [problem, setProblem] = useState<any>(null);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modular state management hook for all 5 steps, drafts, and gate validation
  const {
    form,
    currentStep,
    pitchInput,
    knockoutStatus,
    updateField,
    updateAlternative,
    addAlternative,
    removeAlternative,
    loadSample,
    clearDraft,
    nextStep,
    prevStep,
    goToStep,
  } = usePitchForm(problemId, isRevision ? 1 : 0);

  // Fetch problem details
  useEffect(() => {
    async function fetchProblem() {
      try {
        const res = await fetch(`/api/problems/${problemId}`);
        if (res.ok) {
          const data = await res.json();
          setProblem(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingProblem(false);
      }
    }
    if (problemId) {
      fetchProblem();
    }
  }, [problemId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/problems/${problemId}/pitch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pitchInput,
          revisionCount: form.revisionCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Submission failed");
        setSubmitting(false);
        return;
      }

      // Store result in sessionStorage for instant result presentation
      sessionStorage.setItem(`pitch_result_${data.pitchId}`, JSON.stringify(data));
      router.push(`/problems/${problemId}/pitch/result?pitchId=${data.pitchId}`);
    } catch (e) {
      console.error(e);
      alert("Submission error occurred");
      setSubmitting(false);
    }
  };

  if (loadingProblem) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-medium">Loading challenge details...</p>
      </div>
    );
  }

  const steps = [
    { id: 1, title: "Problem Breakdown", description: "Identify root constraints & friction" },
    { id: 2, title: "Proposed Architecture", description: "Stack, schema & system flow" },
    { id: 3, title: "Alternative Analysis", description: "Min 2 approaches (Knockout rule)" },
    { id: 4, title: "Timeline & Pricing", description: "Fixed budget & milestone specs" },
    { id: 5, title: "Proof & Gate Review", description: "Run deterministic gate check" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Back button & Problem Context */}
      <div className="space-y-3">
        <Link
          href="/problems"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to all challenges
        </Link>

        {problem && (
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md uppercase">
                {problem.frictionCategory?.replace("_", " ")}
              </span>
              <h2 className="font-bold text-slate-900 text-lg mt-1">{problem.title}</h2>
              <p className="text-xs text-slate-500">
                Organization: <strong className="text-slate-700">{problem.organization?.name}</strong>
              </p>
            </div>

            {/* Quality Gate Status Indicator */}
            <div className="flex items-center gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <span
                className={`flex items-center gap-1 font-semibold ${
                  knockoutStatus.hasPricing ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {knockoutStatus.hasPricing ? "✓ Pricing Quoted" : "⚠ Pricing Needed"}
              </span>
              <span className="text-slate-300">|</span>
              <span
                className={`flex items-center gap-1 font-semibold ${
                  knockoutStatus.hasAlternatives ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {knockoutStatus.hasAlternatives ? "✓ 2/2 Alternatives" : `⚠ ${knockoutStatus.alternativesCount}/2 Alternatives`}
              </span>
              <span className="text-slate-300">|</span>
              <span
                className={`flex items-center gap-1 font-semibold ${
                  knockoutStatus.hasMinEffort ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {knockoutStatus.totalLength} / 200 chars
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Form Layout: Stepper on Left, Active Form Step on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Uiverse Stepper */}
        <div className="lg:col-span-4">
          <Stepper
            currentStep={currentStep}
            steps={steps}
            onStepClick={(id) => goToStep(id)}
          />
        </div>

        {/* Right: Active Step Form */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {/* STEP 1: PROBLEM DIAGNOSIS */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Step 1: Problem Diagnosis</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Perform a root-cause analysis. Distinguish the underlying systemic bottlenecks from surface symptoms.
                </p>

            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Root Cause & Friction Analysis <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={form.step1Diagnosis}
                onChange={(e) => updateField("step1Diagnosis", e.target.value)}
                rows={6}
                placeholder="Explain why the problem occurs operationally (e.g. manual tracking lag, lack of real-time alerts, fragmented communication). Avoid merely restating the problem title."
                className="w-full p-3.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>Weight: 2.0 / 10.0 in Tier 2 score</span>
                <span>{form.step1Diagnosis.length} chars</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PROPOSED SOLUTION & DELIVERABLES */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Step 2: Proposed Solution & Deliverables</h3>
              <p className="text-xs text-slate-500 mt-1">
                Provide concrete deliverables, architecture specs, and phased timeline milestones.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Solution Architecture & Strategy <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={form.step2Solution}
                onChange={(e) => updateField("step2Solution", e.target.value)}
                rows={4}
                placeholder="Describe your technical and operational solution (e.g. Next.js PWA, webhook worker, PostgreSQL database, WhatsApp Cloud API)."
                className="w-full p-3.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Concrete Deliverables Spec
              </label>
              <textarea
                value={form.step2Deliverables}
                onChange={(e) => updateField("step2Deliverables", e.target.value)}
                rows={3}
                placeholder="Itemize the exact artifacts: e.g. 1. Mobile attendance PWA, 2. Counselor triage dashboard, 3. WhatsApp webhook integration, 4. CSV export."
                className="w-full p-3.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Phased Milestones Timeline
              </label>
              <input
                type="text"
                value={form.step2Milestones}
                onChange={(e) => updateField("step2Milestones", e.target.value)}
                placeholder="e.g. Sprint 1 (Days 1-7): Auth & UI | Sprint 2 (Days 8-14): Webhooks & Dashboard | Sprint 3: Pilot & Handover"
                className="w-full p-3.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
            </div>
          </div>
        )}

        {/* STEP 3: ALTERNATIVES CONSIDERED (MIN 2) */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Step 3: Alternatives Considered</h3>
                <p className="text-xs text-rose-600 font-semibold mt-1">
                  * Tier 1 Knockout Rule: Must evaluate at least 2 distinct alternative approaches with trade-offs.
                </p>
              </div>

              <button
                type="button"
                onClick={addAlternative}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Alternative</span>
              </button>
            </div>

            <div className="space-y-4">
              {form.step3Alternatives.map((alt, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-700 uppercase">
                      Alternative Option #{idx + 1}
                    </span>
                    {form.step3Alternatives.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeAlternative(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove option"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                      Alternative Name / Method
                    </label>
                    <input
                      type="text"
                      value={alt.name}
                      onChange={(e) => updateAlternative(idx, "name", e.target.value)}
                      placeholder="e.g. Biometric Hardware Fingerprint Scanner or Commercial Off-the-Shelf ERP"
                      className="w-full p-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-emerald-700 uppercase mb-1">
                        Pros / Advantages
                      </label>
                      <input
                        type="text"
                        value={alt.pros}
                        onChange={(e) => updateAlternative(idx, "pros", e.target.value)}
                        placeholder="e.g. Automated without staff input"
                        className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-rose-700 uppercase mb-1">
                        Cons / Trade-offs
                      </label>
                      <input
                        type="text"
                        value={alt.cons}
                        onChange={(e) => updateAlternative(idx, "cons", e.target.value)}
                        placeholder="e.g. Expensive hardware (₹12,000/room), slow hallway queues"
                        className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                      Why Rejected
                    </label>
                    <input
                      type="text"
                      value={alt.rejectionReason}
                      onChange={(e) => updateAlternative(idx, "rejectionReason", e.target.value)}
                      placeholder="e.g. Rejected due to high upfront equipment cost and student entry bottleneck"
                      className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: BUDGET & MILESTONES */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Step 4: Budget & Milestones</h3>
              <p className="text-xs text-rose-600 font-semibold mt-1">
                * Tier 1 Knockout Rule: Must contain explicit numbers or currency symbols (₹, $, Rs, INR).
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Total Budget & Milestone Payment Distribution <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={form.step4Budget}
                onChange={(e) => updateField("step4Budget", e.target.value)}
                rows={3}
                placeholder="e.g. Total Budget: ₹24,000 INR (Milestone 1: ₹8,000 on PWA attendance completion; Milestone 2: ₹10,000 on WhatsApp webhook & dashboard; Milestone 3: ₹6,000 upon pilot sign-off)."
                className="w-full p-3.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Infrastructure & Ongoing Hosting Cost Breakdown
              </label>
              <input
                type="text"
                value={form.step4CostBreakdown}
                onChange={(e) => updateField("step4CostBreakdown", e.target.value)}
                placeholder="e.g. Hosting on Vercel/Supabase free tier (₹0/mo ongoing) + WhatsApp Cloud API free tier for first 1,000 conversations/mo."
                className="w-full p-3.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
            </div>
          </div>
        )}

        {/* STEP 5: PROOF & FEASIBILITY */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Step 5: Relevant Experience, Proof & Constraints</h3>
              <p className="text-xs text-slate-500 mt-1">
                Provide verifiable links to past work, tech stack competence, and acknowledgment of operational constraints.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Relevant Experience & Tech Stack Capabilities <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={form.step5Experience}
                onChange={(e) => updateField("step5Experience", e.target.value)}
                rows={3}
                placeholder="Describe relevant past projects, university clubs, hackathon prototypes, or technologies mastered (e.g. Next.js, Node.js, PostgreSQL, WhatsApp API)."
                className="w-full p-3.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Verifiable Proof Links (GitHub, Portfolio, Live Demo)
              </label>
              <input
                type="text"
                value={form.step5ProofLinks}
                onChange={(e) => updateField("step5ProofLinks", e.target.value)}
                placeholder="https://github.com/your-username/project | https://your-portfolio.vercel.app"
                className="w-full p-3.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Operational Constraints & Feasibility Risks
              </label>
              <textarea
                value={form.step5Constraints}
                onChange={(e) => updateField("step5Constraints", e.target.value)}
                rows={3}
                placeholder="Acknowledge real-world friction: e.g. non-technical staff adoption, basement classroom offline WiFi sync, WhatsApp rate limits, student data privacy."
                className="w-full p-3.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <SlideButton
                type="button"
                onClick={prevStep}
                variant="primary"
                className="px-4 py-2"
              >
                &larr; Previous Step
              </SlideButton>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep < 5 ? (
              <SlideButton
                type="button"
                onClick={nextStep}
                variant="primary"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                className="px-5 py-2.5"
              >
                Continue
              </SlideButton>
            ) : (
              <SlideButton
                type="button"
                variant="emerald"
                disabled={submitting}
                onClick={handleSubmit}
                icon={<ShieldCheck className="w-4 h-4" />}
                className="px-6 py-3 text-sm font-bold shadow-md"
              >
                <span>{submitting ? "Evaluating at Quality Gate..." : "Submit Pitch to Quality Gate"}</span>
              </SlideButton>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
