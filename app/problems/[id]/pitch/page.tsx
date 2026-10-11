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

interface AlternativeItem {
  name: string;
  pros: string;
  cons: string;
  rejectionReason: string;
}

export default function PitchWizardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const problemId = params?.id as string;

  const [problem, setProblem] = useState<any>(null);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [revisionCount, setRevisionCount] = useState(0);

  // Form State across 5 steps
  const [step1Diagnosis, setStep1Diagnosis] = useState("");
  const [step2Solution, setStep2Solution] = useState("");
  const [step2Deliverables, setStep2Deliverables] = useState("");
  const [step2Milestones, setStep2Milestones] = useState("");
  const [step3Alternatives, setStep3Alternatives] = useState<AlternativeItem[]>([
    { name: "", pros: "", cons: "", rejectionReason: "" },
    { name: "", pros: "", cons: "", rejectionReason: "" },
  ]);
  const [step4Budget, setStep4Budget] = useState("");
  const [step4CostBreakdown, setStep4CostBreakdown] = useState("");
  const [step5Experience, setStep5Experience] = useState("");
  const [step5ProofLinks, setStep5ProofLinks] = useState("");
  const [step5Constraints, setStep5Constraints] = useState("");

  // Storage key for draft persistence
  const draftKey = `skillproof_pitch_draft_${problemId}`;

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

  // Restore draft or check if revising
  useEffect(() => {
    const isRevision = searchParams?.get("revision") === "true";
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStep1Diagnosis(parsed.step1Diagnosis || "");
        setStep2Solution(parsed.step2Solution || "");
        setStep2Deliverables(parsed.step2Deliverables || "");
        setStep2Milestones(parsed.step2Milestones || "");
        if (Array.isArray(parsed.step3Alternatives) && parsed.step3Alternatives.length >= 2) {
          setStep3Alternatives(parsed.step3Alternatives);
        }
        setStep4Budget(parsed.step4Budget || "");
        setStep4CostBreakdown(parsed.step4CostBreakdown || "");
        setStep5Experience(parsed.step5Experience || "");
        setStep5ProofLinks(parsed.step5ProofLinks || "");
        setStep5Constraints(parsed.step5Constraints || "");
        if (parsed.revisionCount) {
          setRevisionCount(parsed.revisionCount + (isRevision ? 1 : 0));
        } else if (isRevision) {
          setRevisionCount(1);
        }
      } catch (e) {}
    }
  }, [draftKey, searchParams]);

  // Auto-save draft on changes
  useEffect(() => {
    const draft = {
      step1Diagnosis,
      step2Solution,
      step2Deliverables,
      step2Milestones,
      step3Alternatives,
      step4Budget,
      step4CostBreakdown,
      step5Experience,
      step5ProofLinks,
      step5Constraints,
      revisionCount,
    };
    localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [
    draftKey,
    step1Diagnosis,
    step2Solution,
    step2Deliverables,
    step2Milestones,
    step3Alternatives,
    step4Budget,
    step4CostBreakdown,
    step5Experience,
    step5ProofLinks,
    step5Constraints,
    revisionCount,
  ]);

  // Pre-validation / Live Gate Checks
  const totalCharacters =
    step1Diagnosis.length +
    step2Solution.length +
    step2Deliverables.length +
    step2Milestones.length +
    step3Alternatives.reduce(
      (acc, a) => acc + a.name.length + a.pros.length + a.cons.length + a.rejectionReason.length,
      0
    ) +
    step4Budget.length +
    step4CostBreakdown.length +
    step5Experience.length +
    step5ProofLinks.length +
    step5Constraints.length;

  const hasPricingDetected =
    /[$₹€£]|(?:rs\.?|inr|usd|eur|gbp)\b/i.test(`${step4Budget} ${step4CostBreakdown}`) ||
    /\b\d+(?:[,\.]\d+)*(?:\s*(?:k|lakh|thousand|hundred|per|hr|mo|pm|\/hr|\/month))?\b/i.test(
      `${step4Budget} ${step4CostBreakdown}`
    );

  const validAlternativesCount = step3Alternatives.filter((a) => a.name.trim().length > 2).length;

  const handleAlternativeChange = (
    index: number,
    field: keyof AlternativeItem,
    val: string
  ) => {
    const updated = [...step3Alternatives];
    updated[index][field] = val;
    setStep3Alternatives(updated);
  };

  const addAlternative = () => {
    setStep3Alternatives([
      ...step3Alternatives,
      { name: "", pros: "", cons: "", rejectionReason: "" },
    ]);
  };

  const removeAlternative = (index: number) => {
    if (step3Alternatives.length <= 2) return;
    setStep3Alternatives(step3Alternatives.filter((_, idx) => idx !== index));
  };

  // Demo auto-fill helpers
  const fillSamplePitch = (type: "STRONG" | "WEAK") => {
    if (type === "STRONG") {
      setStep1Diagnosis(
        "Root cause is operational latency in paper-based attendance logging. Tutors and faculty record attendance on physical registers, creating an average 4-day blind spot where consecutive student absences go unnoticed by counselors. The systemic friction lies in lack of real-time event triggers before course abandonment occurs."
      );
      setStep2Solution(
        "A progressive web app (PWA) with 1-tap batch attendance and real-time webhook alerts. The system automatically identifies 3 consecutive absences and triggers instant WhatsApp follow-up messages to parents."
      );
      setStep2Deliverables(
        "1. Faculty Attendance PWA (<40s marking time). 2. Counselor Triage Queue & Dashboard. 3. WhatsApp Cloud API Webhook Dispatcher. 4. Weekly CSV export for administration records."
      );
      setStep2Milestones(
        "Sprint 1 (Days 1-7): Database schema, Auth, PWA attendance screen. Sprint 2 (Days 8-14): Counselor dashboard & WhatsApp triggers. Sprint 3 (Days 15-20): 2-batch pilot & staff training."
      );
      setStep3Alternatives([
        {
          name: "Biometric Fingerprint Hardware Terminals",
          pros: "Automated without faculty interaction.",
          cons: "High initial hardware cost (₹12,000/classroom) and bottleneck queues of 60 students entering doors.",
          rejectionReason: "Too costly and creates classroom entry delays.",
        },
        {
          name: "Commercial ERP Subscription (Teachmint/Classting)",
          pros: "Pre-built feature suite.",
          cons: "Expensive ongoing recurring fee (₹40/student/mo = ₹24,000/mo) and rigid user interface.",
          rejectionReason: "Prohibitive ongoing licensing overhead without custom webhook rules.",
        },
      ]);
      setStep4Budget(
        "Total Fee: ₹22,000 INR (Milestone 1: ₹7,000; Milestone 2: ₹10,000; Milestone 3: ₹5,000 on final handover)."
      );
      setStep4CostBreakdown(
        "Hosting on Supabase/Vercel ($0 tier) + WhatsApp Cloud API free tier for first 1,000 service messages/month."
      );
      setStep5Experience(
        "Built attendance & batch management portal for university IEEE club (350+ members). Highly proficient in Next.js, TypeScript, PostgreSQL, and Node.js."
      );
      setStep5ProofLinks(
        "https://github.com/aryan-dev/attendance-triage-demo | Portfolio: https://aryanverma.vercel.app"
      );
      setStep5Constraints(
        "Operational constraint: Faculty vary in tech savviness, so UI uses large touch targets with 1-tap 'All Present'. PWA caches offline if basement classroom WiFi drops."
      );
    } else {
      // Weak pitch (Missing pricing or alternatives)
      setStep1Diagnosis("Students don't come to classes and management is unhappy about it.");
      setStep2Solution("I will build a website to fix attendance.");
      setStep2Deliverables("Website and database.");
      setStep2Milestones("Soon.");
      setStep3Alternatives([
        {
          name: "Manual calling",
          pros: "Simple",
          cons: "Tiring",
          rejectionReason: "Too hard",
        },
      ]);
      setStep4Budget("Budget is negotiable, we can discuss later based on features."); // Missing pricing!
      setStep4CostBreakdown("Open to discussion.");
      setStep5Experience("Student learning web dev.");
      setStep5ProofLinks("None yet.");
      setStep5Constraints("None.");
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const pitchInput = {
        step1Diagnosis,
        step2Solution,
        step2Deliverables,
        step2Milestones,
        step3Alternatives,
        step4Budget,
        step4CostBreakdown,
        step5Experience,
        step5ProofLinks,
        step5Constraints,
      };

      const res = await fetch(`/api/problems/${problemId}/pitch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pitchInput,
          revisionCount,
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
    { num: 1, title: "Diagnosis" },
    { num: 2, title: "Solution & Specs" },
    { num: 3, title: "Alternatives" },
    { num: 4, title: "Budget & Milestones" },
    { num: 5, title: "Proof & Feasibility" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
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
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase">
                {problem.frictionCategory?.replace("_", " ")}
              </span>
              <h2 className="font-bold text-slate-900 text-base mt-1">{problem.title}</h2>
              <p className="text-xs text-slate-500">
                Organization: <strong className="text-slate-700">{problem.organization?.name}</strong>
              </p>
            </div>

            {/* Demo auto-fill dropdown/buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => fillSamplePitch("STRONG")}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1"
                title="Fill with calibrated strong pitch passing the 6.0 gate"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fill Strong Pitch (Pass)</span>
              </button>

              <button
                type="button"
                onClick={() => fillSamplePitch("WEAK")}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1"
                title="Fill with weak pitch triggering knockout / gate fail"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Fill Weak Pitch (Fail)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Progress Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
              Step {currentStep} of 5
            </span>
            <span className="text-sm font-semibold text-slate-800">
              {steps[currentStep - 1].title}
            </span>
            {revisionCount > 0 && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Revision #{revisionCount}
              </span>
            )}
          </div>

          {/* Real-time Quality Gate Health Indicator */}
          <div className="flex items-center gap-3 text-xs">
            <span
              className={`flex items-center gap-1 font-semibold ${
                hasPricingDetected ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {hasPricingDetected ? "✓ Pricing Detected" : "⚠ Pricing Needed"}
            </span>
            <span
              className={`flex items-center gap-1 font-semibold ${
                validAlternativesCount >= 2 ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {validAlternativesCount >= 2 ? "✓ Alternatives: 2/2" : `⚠ Alternatives: ${validAlternativesCount}/2`}
            </span>
            <span
              className={`flex items-center gap-1 font-semibold ${
                totalCharacters > 200 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {totalCharacters} / 200 chars
            </span>
          </div>
        </div>

        {/* Step Tabs */}
        <div className="grid grid-cols-5 gap-2">
          {steps.map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setCurrentStep(s.num)}
              className={`h-2 rounded-full transition-all ${
                currentStep === s.num
                  ? "bg-brand-600"
                  : currentStep > s.num
                  ? "bg-emerald-500"
                  : "bg-slate-200"
              }`}
              title={`Go to step ${s.num}: ${s.title}`}
            />
          ))}
        </div>
      </div>

      {/* Step Form Body */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
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
                value={step1Diagnosis}
                onChange={(e) => setStep1Diagnosis(e.target.value)}
                rows={6}
                placeholder="Explain why the problem occurs operationally (e.g. manual tracking lag, lack of real-time alerts, fragmented communication). Avoid merely restating the problem title."
                className="w-full p-3.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>Weight: 2.0 / 10.0 in Tier 2 score</span>
                <span>{step1Diagnosis.length} chars</span>
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
                value={step2Solution}
                onChange={(e) => setStep2Solution(e.target.value)}
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
                value={step2Deliverables}
                onChange={(e) => setStep2Deliverables(e.target.value)}
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
                value={step2Milestones}
                onChange={(e) => setStep2Milestones(e.target.value)}
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
              {step3Alternatives.map((alt, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-700 uppercase">
                      Alternative Option #{idx + 1}
                    </span>
                    {step3Alternatives.length > 2 && (
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
                      onChange={(e) => handleAlternativeChange(idx, "name", e.target.value)}
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
                        onChange={(e) => handleAlternativeChange(idx, "pros", e.target.value)}
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
                        onChange={(e) => handleAlternativeChange(idx, "cons", e.target.value)}
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
                      onChange={(e) => handleAlternativeChange(idx, "rejectionReason", e.target.value)}
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
                value={step4Budget}
                onChange={(e) => setStep4Budget(e.target.value)}
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
                value={step4CostBreakdown}
                onChange={(e) => setStep4CostBreakdown(e.target.value)}
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
                value={step5Experience}
                onChange={(e) => setStep5Experience(e.target.value)}
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
                value={step5ProofLinks}
                onChange={(e) => setStep5ProofLinks(e.target.value)}
                placeholder="https://github.com/your-username/project | https://your-portfolio.vercel.app"
                className="w-full p-3.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Operational Constraints & Feasibility Risks
              </label>
              <textarea
                value={step5Constraints}
                onChange={(e) => setStep5Constraints(e.target.value)}
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
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Previous Step
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="inline-flex items-center space-x-2 px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{submitting ? "Evaluating Pitch at Quality Gate..." : "Submit Pitch to Quality Gate"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
