"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  PitchInput,
  AlternativeItem,
  checkKnockoutCriteria,
  KnockoutCheckResult,
} from "@/lib/scoring/engine";
import { validatePitchStep } from "@/lib/validations/pitch.schema";

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

export function usePitchForm(problemId: string, initialRevision = 0) {
  const draftKey = `skillproof_pitch_draft_${problemId}`;

  const [form, setForm] = useState<PitchFormState>(() => {
    return { ...DEFAULT_STATE, revisionCount: initialRevision };
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
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

  // Update simple string field and clear any error on that field
  const updateField = useCallback(
    <K extends keyof PitchFormState>(field: K, value: PitchFormState[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setStepErrors((prev) => {
        if (!prev[field as string]) return prev;
        const copy = { ...prev };
        delete copy[field as string];
        return copy;
      });
    },
    []
  );

  // Update specific alternative and clear its error
  const updateAlternative = useCallback(
    (index: number, field: keyof AlternativeItem, value: string) => {
      setForm((prev) => {
        const updated = [...prev.step3Alternatives];
        if (updated[index]) {
          updated[index] = { ...updated[index], [field]: value };
        }
        return { ...prev, step3Alternatives: updated };
      });
      const errorKey = `step3Alternatives.${index}.${field}`;
      setStepErrors((prev) => {
        if (!prev[errorKey] && !prev.step3Alternatives) return prev;
        const copy = { ...prev };
        delete copy[errorKey];
        delete copy.step3Alternatives;
        return copy;
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

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey);
    } catch {}
    setForm(DEFAULT_STATE);
    setStepErrors({});
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
    const validation = validatePitchStep(currentStep, form);
    if (!validation.isValid) {
      setStepErrors(validation.errors);
      return false;
    }
    setStepErrors({});
    setCurrentStep((prev) => Math.min(prev + 1, 5));
    return true;
  }, [currentStep, form]);

  const prevStep = useCallback(() => {
    setStepErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step < 1 || step > 5) return;
    if (step <= currentStep) {
      setStepErrors({});
      setCurrentStep(step);
      return;
    }
    // Block forward skipping if earlier steps fail validation
    for (let s = currentStep; s < step; s++) {
      const validation = validatePitchStep(s, form);
      if (!validation.isValid) {
        setStepErrors(validation.errors);
        return;
      }
    }
    setStepErrors({});
    setCurrentStep(step);
  }, [currentStep, form]);

  return {
    form,
    currentStep,
    stepErrors,
    setStepErrors,
    isLoaded,
    pitchInput,
    knockoutStatus,
    updateField,
    updateAlternative,
    addAlternative,
    removeAlternative,
    clearDraft,
    nextStep,
    prevStep,
    goToStep,
  };
}
