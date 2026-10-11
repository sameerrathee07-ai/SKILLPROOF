"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  PitchInput,
  AlternativeItem,
  checkKnockoutCriteria,
  KnockoutCheckResult,
} from "@/lib/scoring/engine";

export interface PitchFormState {
  step1Diagnosis: string;
  step2Solution: string;
  step2Deliverables: string;
  step2Milestones: string;
  step3Alternatives: AlternativeItem[];
  step4Budget: string;
  step4CostBreakdown: string;
  step5Experience: string;
  step5ProofLinks: string;
  step5Constraints: string;
  revisionCount: number;
}

const DEFAULT_STATE: PitchFormState = {
  step1Diagnosis: "",
  step2Solution: "",
  step2Deliverables: "",
  step2Milestones: "",
  step3Alternatives: [
    { name: "", pros: "", cons: "", rejectionReason: "" },
    { name: "", pros: "", cons: "", rejectionReason: "" },
  ],
  step4Budget: "",
  step4CostBreakdown: "",
  step5Experience: "",
  step5ProofLinks: "",
  step5Constraints: "",
  revisionCount: 0,
};

const STRONG_SAMPLE: PitchFormState = {
  step1Diagnosis:
    "Root cause is operational latency in paper-based attendance logging. Tutors and faculty record attendance on physical registers, creating an average 4-day blind spot where consecutive student absences go unnoticed by counselors. The systemic friction lies in lack of real-time event triggers before course abandonment occurs.",
  step2Solution:
    "A progressive web app (PWA) with 1-tap batch attendance and real-time webhook alerts. The system automatically identifies 3 consecutive absences and triggers instant WhatsApp follow-up messages to parents.",
  step2Deliverables:
    "1. Faculty Attendance PWA (<40s marking time). 2. Counselor Triage Queue & Dashboard. 3. WhatsApp Cloud API Webhook Dispatcher. 4. Weekly CSV export for administration records.",
  step2Milestones:
    "Sprint 1 (Days 1-7): Database schema, Auth, PWA attendance screen. Sprint 2 (Days 8-14): Counselor dashboard & WhatsApp triggers. Sprint 3 (Days 15-20): 2-batch pilot & staff training.",
  step3Alternatives: [
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
  ],
  step4Budget:
    "Total Fee: ₹22,000 INR (Milestone 1: ₹7,000; Milestone 2: ₹10,000; Milestone 3: ₹5,000 on final handover).",
  step4CostBreakdown:
    "Hosting on Supabase/Vercel ($0 tier) + WhatsApp Cloud API free tier for first 1,000 service messages/month.",
  step5Experience:
    "Built and deployed an attendance tracking portal for my university IEEE student branch (350 active members). Strong proficiency in Next.js, Node.js, PostgreSQL, and WhatsApp Business Cloud API.",
  step5ProofLinks:
    "https://github.com/aryan-dev/attendance-triage-demo | Live portfolio at https://aryanverma.vercel.app",
  step5Constraints:
    "Constraint awareness: Faculty have variable digital literacy, so attendance interface requires large touch buttons and 1-tap 'All Present' with single-tap exception marking. System handles offline caching if basement classroom WiFi drops, syncing when connection restores.",
  revisionCount: 0,
};

const WEAK_SAMPLE: PitchFormState = {
  step1Diagnosis:
    "Students skip classes all the time and it is a big problem for coaching institutes. We need an app.",
  step2Solution:
    "I will make a full mobile app using Flutter and AI to automatically solve all student attendance issues easily.",
  step2Deliverables: "Mobile app and web portal.",
  step2Milestones: "Phase 1: Build app. Phase 2: Launch app.",
  step3Alternatives: [
    {
      name: "Do nothing",
      pros: "Free",
      cons: "Bad",
      rejectionReason: "Doesn't solve the problem",
    },
    {
      name: "Hire more guards",
      pros: "More people",
      cons: "Expensive",
      rejectionReason: "Guards don't take attendance",
    },
  ],
  step4Budget: "Flexible budget depending on requirements.",
  step4CostBreakdown: "Negotiable upon discussion.",
  step5Experience: "I am a skilled developer with many apps.",
  step5ProofLinks: "https://github.com",
  step5Constraints: "No major constraints.",
  revisionCount: 0,
};

export function usePitchForm(problemId: string, initialRevision = 0) {
  const draftKey = `skillproof_pitch_draft_${problemId}`;

  const [form, setForm] = useState<PitchFormState>(() => {
    return { ...DEFAULT_STATE, revisionCount: initialRevision };
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  // Restore draft from localStorage on mount
  useEffect(() => {
    if (!problemId) return;
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm((prev) => ({
          ...prev,
          ...parsed,
          revisionCount: initialRevision > 0 ? initialRevision : (parsed.revisionCount || 0),
        }));
      }
    } catch (e) {
      console.warn("Failed to restore pitch draft:", e);
    } finally {
      setIsLoaded(true);
    }
  }, [problemId, draftKey, initialRevision]);

  // Persist draft to localStorage on change
  useEffect(() => {
    if (!isLoaded || !problemId) return;
    try {
      localStorage.setItem(draftKey, JSON.stringify(form));
    } catch (e) {
      console.warn("Failed to persist pitch draft:", e);
    }
  }, [form, draftKey, isLoaded, problemId]);

  // Update simple string field
  const updateField = useCallback(
    <K extends keyof PitchFormState>(field: K, value: PitchFormState[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Update specific alternative
  const updateAlternative = useCallback(
    (index: number, field: keyof AlternativeItem, value: string) => {
      setForm((prev) => {
        const updated = [...prev.step3Alternatives];
        if (updated[index]) {
          updated[index] = { ...updated[index], [field]: value };
        }
        return { ...prev, step3Alternatives: updated };
      });
    },
    []
  );

  const addAlternative = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      step3Alternatives: [
        ...prev.step3Alternatives,
        { name: "", pros: "", cons: "", rejectionReason: "" },
      ],
    }));
  }, []);

  const removeAlternative = useCallback((index: number) => {
    setForm((prev) => {
      if (prev.step3Alternatives.length <= 2) return prev;
      return {
        ...prev,
        step3Alternatives: prev.step3Alternatives.filter((_, idx) => idx !== index),
      };
    });
  }, []);

  const loadSample = useCallback((type: "STRONG" | "WEAK") => {
    setForm(type === "STRONG" ? STRONG_SAMPLE : WEAK_SAMPLE);
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey);
    } catch {}
    setForm(DEFAULT_STATE);
    setCurrentStep(1);
  }, [draftKey]);

  // Convert state to PitchInput
  const pitchInput: PitchInput = useMemo(
    () => ({
      step1Diagnosis: form.step1Diagnosis,
      step2Solution: form.step2Solution,
      step2Deliverables: form.step2Deliverables,
      step2Milestones: form.step2Milestones,
      step3Alternatives: form.step3Alternatives,
      step4Budget: form.step4Budget,
      step4CostBreakdown: form.step4CostBreakdown,
      step5Experience: form.step5Experience,
      step5ProofLinks: form.step5ProofLinks,
      step5Constraints: form.step5Constraints,
    }),
    [form]
  );

  // Live knockout evaluation using the deterministic engine
  const knockoutStatus: KnockoutCheckResult = useMemo(
    () => checkKnockoutCriteria(pitchInput),
    [pitchInput]
  );

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 5) setCurrentStep(step);
  }, []);

  return {
    form,
    currentStep,
    isLoaded,
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
  };
}
