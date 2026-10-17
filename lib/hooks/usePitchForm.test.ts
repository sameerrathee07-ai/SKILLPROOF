import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { usePitchForm } from "@/lib/hooks/usePitchForm";

const PROBLEM_ID = "problem-1";
const DRAFT_KEY = `skillproof_pitch_draft_${PROBLEM_ID}`;

describe("usePitchForm", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("returns default state with two empty alternatives", async () => {
    const { result } = renderHook(() => usePitchForm(PROBLEM_ID));
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.currentStep).toBe(1);
    expect(result.current.form.step1Diagnosis).toBe("");
    expect(result.current.form.step3Alternatives).toHaveLength(2);
    expect(result.current.form.revisionCount).toBe(0);
  });

  it("computes a knockout status from the live pitch input", async () => {
    const { result } = renderHook(() => usePitchForm(PROBLEM_ID));
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    // Default form has no pricing, no alternatives, low effort
    expect(result.current.knockoutStatus.isKnockedOut).toBe(true);
    expect(result.current.knockoutStatus.hasPricing).toBe(false);
  });

  it("restores a saved draft from localStorage on mount", async () => {
    const saved = {
      step1Diagnosis: "restored diagnosis",
      step3Alternatives: [{ name: "One" }, { name: "Two" }],
      revisionCount: 3,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(saved));

    const { result } = renderHook(() => usePitchForm(PROBLEM_ID));
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.form.step1Diagnosis).toBe("restored diagnosis");
    expect(result.current.form.step3Alternatives).toHaveLength(2);
    expect(result.current.form.revisionCount).toBe(3);
  });

  it("ignores malformed JSON in localStorage", async () => {
    localStorage.setItem(DRAFT_KEY, "{not-json");

    const { result } = renderHook(() => usePitchForm(PROBLEM_ID));
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    // Falls back to default state without throwing
    expect(result.current.form.step1Diagnosis).toBe("");
  });

  it("updates a string field", async () => {
    const { result } = renderHook(() => usePitchForm(PROBLEM_ID));
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    act(() => result.current.updateField("step1Diagnosis", "new diagnosis"));
    expect(result.current.form.step1Diagnosis).toBe("new diagnosis");
  });

  it("updates a specific alternative", async () => {
    const { result } = renderHook(() => usePitchForm(PROBLEM_ID));
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    act(() => result.current.updateAlternative(0, "name", "Custom CRM"));
    expect(result.current.form.step3Alternatives[0].name).toBe("Custom CRM");
    expect(result.current.form.step3Alternatives[1].name).toBe("");
  });

  it("adds alternatives", async () => {
    const { result } = renderHook(() => usePitchForm(PROBLEM_ID));
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    act(() => result.current.addAlternative());
    expect(result.current.form.step3Alternatives).toHaveLength(3);
  });

  it("removes alternatives but never below two", async () => {
    const { result } = renderHook(() => usePitchForm(PROBLEM_ID));
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    act(() => result.current.removeAlternative(0));
    expect(result.current.form.step3Alternatives).toHaveLength(2);

    act(() => result.current.removeAlternative(0));
    expect(result.current.form.step3Alternatives).toHaveLength(2);
  });

  it("steps forward and backward within 1..5", async () => {
    const { result } = renderHook(() => usePitchForm(PROBLEM_ID));
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    act(() => result.current.nextStep());
    act(() => result.current.nextStep());
    expect(result.current.currentStep).toBe(3);

    act(() => result.current.prevStep());
    expect(result.current.currentStep).toBe(2);

    // Clamp upper bound at 5
    act(() => result.current.goToStep(5));
    act(() => result.current.nextStep());
    expect(result.current.currentStep).toBe(5);

    // Clamp lower bound at 1
    act(() => result.current.goToStep(1));
    act(() => result.current.prevStep());
    expect(result.current.currentStep).toBe(1);
  });

  it("ignores out-of-range goToStep values", async () => {
    const { result } = renderHook(() => usePitchForm(PROBLEM_ID));
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    act(() => result.current.goToStep(0));
    expect(result.current.currentStep).toBe(1);
    act(() => result.current.goToStep(6));
    expect(result.current.currentStep).toBe(1);
  });

  it("persists form changes to localStorage", async () => {
    const { result } = renderHook(() => usePitchForm(PROBLEM_ID));
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    act(() => result.current.updateField("step4Budget", "$500"));

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
      expect(stored.step4Budget).toBe("$500");
    });
  });

  it("clears the draft and resets state", async () => {
    const { result } = renderHook(() => usePitchForm(PROBLEM_ID));
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    act(() => result.current.updateField("step1Diagnosis", "some text"));
    act(() => result.current.clearDraft());

    expect(result.current.form.step1Diagnosis).toBe("");
    expect(result.current.form.step3Alternatives).toHaveLength(2);
    expect(result.current.currentStep).toBe(1);

    // NOTE: clearDraft() calls localStorage.removeItem, but the persist
    // effect re-saves the now-default form immediately after reset, so the
    // key is repopulated with the default state (not left empty).
    const stored = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
    expect(stored.step1Diagnosis).toBe("");
  });
});