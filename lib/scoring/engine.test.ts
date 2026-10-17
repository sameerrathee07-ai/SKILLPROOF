import { describe, it, expect } from "vitest";
import {
  GATE_THRESHOLD,
  PitchInput,
  calculateTotalLength,
  checkKnockoutCriteria,
  evaluatePitch,
  hasPricing,
  normalizeAlternatives,
} from "@/lib/scoring/engine";

const buildPitch = (overrides: Partial<PitchInput> = {}): PitchInput => ({
  step1Diagnosis:
    "Root cause is manual attendance tracking causing delayed feedback and student dropout. The systemic friction lies in paper registers and the lack of real-time alerts.",
  step2Solution:
    "Build a PWA dashboard with webhook automation and WhatsApp notifications, backed by a database schema and admin dashboard.",
  step2Deliverables:
    "Faculty attendance PWA, counselor dashboard, WhatsApp webhook service, CSV export.",
  step2Milestones:
    "Sprint 1: schema and auth. Sprint 2: webhook worker and dashboard. Sprint 3: pilot and deploy.",
  step3Alternatives: [
    {
      name: "Biometric terminals",
      pros: "automated",
      cons: "expensive hardware and long queues",
      rejectionReason: "prohibitive setup cost",
    },
    {
      name: "Off-the-shelf ERP",
      pros: "immediate",
      cons: "expensive recurring fees and vendor lock-in",
      rejectionReason: "too costly",
    },
  ],
  step4Budget: "₹24,000 INR across three milestones.",
  step4CostBreakdown: "Hosting free tier, WhatsApp API free tier.",
  step5Experience: "Built attendance portal for 350 members. Proficient in Next.js and Node.js.",
  step5ProofLinks: "https://github.com/aryan-dev/demo and https://aryan.vercel.app",
  step5Constraints: "Faculty have variable digital literacy; handle offline caching and privacy.",
  ...overrides,
});

describe("normalizeAlternatives", () => {
  it("returns an empty array for undefined/null", () => {
    expect(normalizeAlternatives(undefined)).toEqual([]);
    expect(normalizeAlternatives(null as never)).toEqual([]);
  });

  it("filters out invalid array entries", () => {
    const raw = [
      { name: "", pros: "x" },
      null as never,
      { name: "A", pros: "x" }, // name length === 1, filtered
      { name: "Valid Option", pros: "pro", cons: "con", rejectionReason: "reason" },
    ];
    expect(normalizeAlternatives(raw)).toEqual([
      { name: "Valid Option", details: "pro con reason" },
    ]);
  });

  it("parses a numbered list string into alternatives", () => {
    const result = normalizeAlternatives("1. Built a custom portal\n2. Adopted an existing tool");
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Alternative 1");
    expect(result[1].name).toBe("Alternative 2");
  });

  it("parses a semicolon-separated string into alternatives", () => {
    const result = normalizeAlternatives("Alpha method; Beta method");
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Alternative 1");
  });

  it("falls back to a single alternative for a long plain string", () => {
    const text = "A comprehensive written rationale for the recommended path";
    expect(normalizeAlternatives(text)).toEqual([
      { name: "Single Alternative", details: text },
    ]);
  });

  it("returns an empty array for a short non-list string", () => {
    expect(normalizeAlternatives("short")).toEqual([]);
  });
});

describe("hasPricing", () => {
  it("returns false for empty/blank text", () => {
    expect(hasPricing("")).toBe(false);
    expect(hasPricing(undefined as never)).toBe(false);
  });

  it("detects currency symbols", () => {
    for (const v of ["₹15,000", "$500", "€100", "£50"]) {
      expect(hasPricing(v)).toBe(true);
    }
  });

  it("detects currency words", () => {
    for (const v of ["Rs 5000", "100 INR", "USD 200", "EUR 50"]) {
      expect(hasPricing(v)).toBe(true);
    }
  });

  it("detects bare numbers", () => {
    for (const v of ["500", "15,000", "25k", "120 per hour"]) {
      expect(hasPricing(v)).toBe(true);
    }
  });

  it("returns false for text without numbers or currency", () => {
    expect(hasPricing("we can discuss the budget later")).toBe(false);
  });
});

describe("calculateTotalLength", () => {
  it("sums trimmed length across all fields", () => {
    const pitch = buildPitch();
    const expected =
      [pitch.step1Diagnosis, pitch.step2Solution, pitch.step2Deliverables, pitch.step2Milestones,
        pitch.step4Budget, pitch.step4CostBreakdown, pitch.step5Experience, pitch.step5ProofLinks,
        pitch.step5Constraints].reduce((s, x) => s + x!.trim().length, 0) +
      (pitch.step3Alternatives as Array<any>).reduce(
        (s, a) => s + a.name.trim().length + (a.pros || "").trim().length + (a.cons || "").trim().length + (a.rejectionReason || "").trim().length,
        0
      );
    expect(calculateTotalLength(pitch)).toBe(expected);
  });

  it("returns 0 for an empty pitch", () => {
    expect(calculateTotalLength({} as PitchInput)).toBe(0);
  });

  it("handles string alternatives", () => {
    const pitch = buildPitch({ step3Alternatives: "Option A vs Option B" });
    expect(calculateTotalLength(pitch)).toBeGreaterThan(200);
  });
});

describe("checkKnockoutCriteria", () => {
  it("passes all knockouts for a complete pitch", () => {
    const result = checkKnockoutCriteria(buildPitch());
    expect(result.isKnockedOut).toBe(false);
    expect(result.reasons).toEqual([]);
    expect(result.hasPricing).toBe(true);
    expect(result.hasAlternatives).toBe(true);
    expect(result.hasMinEffort).toBe(true);
    expect(result.alternativesCount).toBeGreaterThanOrEqual(2);
  });

  it("knocks out when pricing is missing", () => {
    const result = checkKnockoutCriteria(
      buildPitch({ step4Budget: "we can discuss later", step4CostBreakdown: "" })
    );
    expect(result.isKnockedOut).toBe(true);
    expect(result.hasPricing).toBe(false);
    expect(result.reasons.join(" ")).toMatch(/pricing/i);
  });

  it("knocks out when fewer than 2 alternatives", () => {
    const result = checkKnockoutCriteria(
      buildPitch({ step3Alternatives: [{ name: "Only one option", pros: "x" }] })
    );
    expect(result.isKnockedOut).toBe(true);
    expect(result.hasAlternatives).toBe(false);
    expect(result.alternativesCount).toBe(1);
    expect(result.reasons.join(" ")).toMatch(/alternatives/i);
  });

  it("knocks out when total length is at or below 200", () => {
    const result = checkKnockoutCriteria({
      step1Diagnosis: "Short.",
      step2Solution: "Build app.",
      step2Deliverables: "App",
      step2Milestones: "Week 1.",
      step3Alternatives: [
        { name: "Option One" },
        { name: "Option Two" },
      ],
      step4Budget: "$100",
      step5Experience: "Student",
    });
    expect(result.isKnockedOut).toBe(true);
    expect(result.hasPricing).toBe(true);
    expect(result.hasAlternatives).toBe(true);
    expect(result.hasMinEffort).toBe(false);
    expect(result.reasons.join(" ")).toMatch(/200/);
  });
});

describe("evaluatePitch", () => {
  it("returns a zeroed, knocked-out result when a knockout criterion fails", () => {
    const result = evaluatePitch(
      buildPitch({ step4Budget: "we can discuss later", step4CostBreakdown: "" })
    );
    expect(result.knockedOut).toBe(true);
    expect(result.passed).toBe(false);
    expect(result.overallScore).toBe(0);
    expect(result.knockoutReason).toBeDefined();
    expect(result.actionableFeedback).toEqual(result.actionableFeedback);
    for (const dim of Object.values(result.dimensions)) {
      expect(dim.score).toBe(0);
    }
  });

  it("passes a strong pitch with a score at or above the gate", () => {
    const result = evaluatePitch(buildPitch());
    expect(result.knockedOut).toBe(false);
    expect(result.passed).toBe(true);
    expect(result.overallScore).toBeGreaterThanOrEqual(GATE_THRESHOLD);
  });

  it("fails a buzzword pitch below the gate without knocking out", () => {
    const result = evaluatePitch({
      step1Diagnosis: "Poor communication in the organization. Communication is the foundation of success.",
      step2Solution: "AI-powered synergy platform using cloud native paradigms.",
      step2Deliverables: "A comprehensive digital synergy platform.",
      step2Milestones: "Milestone 1: kickoff. Milestone 2: completion.",
      step3Alternatives: [
        { name: "Doing nothing", pros: "free", cons: "nothing changes", rejectionReason: "not useful" },
        { name: "Other software", pros: "available", cons: "generic", rejectionReason: "not tailored" },
      ],
      step4Budget: "$500 flat fee.",
      step4CostBreakdown: "All inclusive.",
      step5Experience: "Passion for cutting-edge technology.",
      step5ProofLinks: "Portfolio under construction",
      step5Constraints: "None",
    });
    expect(result.knockedOut).toBe(false);
    expect(result.passed).toBe(false);
    expect(result.overallScore).toBeLessThan(GATE_THRESHOLD);
  });

  it("keeps each dimension within its declared max and sums to the overall score", () => {
    const result = evaluatePitch(buildPitch());
    const dims = result.dimensions;
    const maxes = {
      problemDiagnosis: 2.0,
      solutionActionability: 2.0,
      alternativesDepth: 1.5,
      pricingTransparency: 1.5,
      solverProof: 1.5,
      constraintsFeasibility: 1.5,
    };
    let sum = 0;
    for (const [key, dim] of Object.entries(dims)) {
      expect(dim.score).toBeGreaterThanOrEqual(0);
      expect(dim.score).toBeLessThanOrEqual(maxes[key as keyof typeof maxes]);
      sum += dim.score;
    }
    expect(Math.round(sum * 10) / 10).toBe(result.overallScore);
  });
});