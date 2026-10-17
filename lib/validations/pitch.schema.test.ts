import { describe, it, expect } from "vitest";
import {
  checkGarbageText,
  pitchInputSchema,
  validatePitchStep,
  validateFullPitch,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
} from "./pitch.schema";

const validPitchInput = {
  step1Diagnosis:
    "Root cause is operational latency in attendance feedback loops. Paper registers create a 4-day blind spot where consecutive absences go unnoticed.",
  step2Solution:
    "A progressive web app (PWA) for faculty with quick batch tap-marking and automated webhook triggers.",
  step2Deliverables:
    "1. Mobile-first Faculty Attendance PWA. 2. Counselor Triage Dashboard. 3. Automated WhatsApp Cloud API webhook.",
  step2Milestones:
    "Sprint 1: Schema and PWA UI. Sprint 2: Webhooks and dashboard. Sprint 3: Pilot test and handover.",
  step3Alternatives: [
    {
      name: "Biometric Hardware Terminals",
      pros: "Fully automated without faculty intervention.",
      cons: "High initial hardware cost and long hallway queues.",
      rejectionReason: "Prohibitive setup expense and hallway bottleneck delays.",
    },
    {
      name: "Commercial Off-the-Shelf ERP",
      pros: "Feature-rich platform available immediately.",
      cons: "Expensive recurring per-student subscription fees.",
      rejectionReason: "Vendor lock-in and high recurring monthly expense.",
    },
  ],
  step4Budget:
    "Total Project Cost: ₹24,000 INR (Milestone 1: ₹8,000; Milestone 2: ₹10,000; Milestone 3: ₹6,000).",
  step4CostBreakdown:
    "Hosting on Vercel and Supabase free tier with WhatsApp Cloud API free tier.",
  step5Experience:
    "Built and deployed an attendance tracking portal for my university IEEE student branch (350 active members).",
  step5ProofLinks:
    "https://github.com/example/attendance-demo",
  step5Constraints:
    "Faculty have variable digital literacy, so attendance interface requires large touch buttons.",
};

describe("checkGarbageText validator", () => {
  const options = { fieldLabel: "Problem Diagnosis", minLength: 20, required: true };

  it("passes valid detailed text", () => {
    const res = checkGarbageText(
      "Root cause is operational latency in attendance feedback loops across classrooms.",
      options
    );
    expect(res.isValid).toBe(true);
    expect(res.error).toBeUndefined();
  });

  describe("empty or whitespace-only strings", () => {
    it("rejects empty string", () => {
      const res = checkGarbageText("", options);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("cannot be empty");
    });

    it("rejects whitespace-only string", () => {
      const res = checkGarbageText("    \n\t   ", options);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("cannot be empty");
    });

    it("handles non-string inputs", () => {
      const res = checkGarbageText(null, options);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("required");
    });
  });

  describe("minimum length enforcement", () => {
    it("rejects a one-word answer", () => {
      const res = checkGarbageText("broken", options);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("at least 20 characters");
    });

    it("rejects short phrases below minimum length", () => {
      const res = checkGarbageText("app does not work", options);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("at least 20 characters");
    });
  });

  describe("repeated character rejection", () => {
    it("rejects 4+ consecutive identical characters (e.g. aaaa)", () => {
      const res = checkGarbageText("The problem is aaaaaaaaaaaaaaaaaaaaaaaa", options);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("repetitive characters");
    });

    it("rejects punctuation repetition (e.g. ...........)", () => {
      const res = checkGarbageText("........................................", options);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("repetitive characters");
    });

    it("rejects text mostly composed of a single repeated character (e.g. a a a a a)", () => {
      const res = checkGarbageText("a a a a a a a a a a a a a a a a a a a a a", options);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("repetitive characters");
    });
  });

  describe("keyboard-mash rejection", () => {
    it("rejects 'asdfgh' sequence", () => {
      const res = checkGarbageText("asdfgh operational problem in system", options);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("keyboard-mash");
    });

    it("rejects 'qwerty' sequence", () => {
      const res = checkGarbageText("qwertyuiop system failure latency", options);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("keyboard-mash");
    });

    it("rejects 'zxcvbnm' sequence", () => {
      const res = checkGarbageText("zxcvbnm tracking is failing constantly", options);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("keyboard-mash");
    });

    it("rejects 'hjkl' sequence", () => {
      const res = checkGarbageText("fghjkl attendance record management", options);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("keyboard-mash");
    });

    it("rejects vowel-less consonant mash tokens", () => {
      const res = checkGarbageText("sdfgh latency in classroom checkins", options);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("keyboard-mash");
    });
  });

  describe("junk filler rejection", () => {
    it("rejects 'test' / 'testing'", () => {
      const res = checkGarbageText("test", options);
      expect(res.isValid).toBe(false);
      // Fails minLength or junk filler
      expect(res.isValid).toBe(false);
    });

    it("rejects repetitive 'test test test test test test'", () => {
      const res = checkGarbageText("test test test test test test test test", options);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("placeholder or test words");
    });

    it("rejects 'idk' or 'idk idk idk idk idk idk'", () => {
      const res = checkGarbageText("idk idk idk idk idk idk idk idk idk", options);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("placeholder or test words");
    });

    it("rejects 'n/a' or 'na na na na na na'", () => {
      const res = checkGarbageText("na na na na na na na na na na na", options);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("placeholder or test words");
    });

    it("rejects 'lorem ipsum' placeholder text", () => {
      const res = checkGarbageText(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.",
        options
      );
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("lorem ipsum");
    });

    it("rejects text containing 'placeholder'", () => {
      const res = checkGarbageText(
        "This is a placeholder for the real problem diagnosis content.",
        options
      );
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("placeholder text");
    });

    it("allows legitimate use of 'test' in a complete sentence", () => {
      const res = checkGarbageText(
        "We ran a pilot test with twenty students to measure latency reduction.",
        options
      );
      expect(res.isValid).toBe(true);
    });
  });
});

describe("pitchInputSchema", () => {
  it("validates a complete, high-quality pitch", () => {
    const result = pitchInputSchema.safeParse(validPitchInput);
    expect(result.success).toBe(true);
  });

  it("rejects when Step 1 diagnosis is garbage (asdfgh)", () => {
    const input = {
      ...validPitchInput,
      step1Diagnosis: "asdfghasdfghasdfgh",
    };
    const result = pitchInputSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("step1Diagnosis"))).toBe(true);
    }
  });

  it("rejects when Step 2 solution is empty", () => {
    const input = {
      ...validPitchInput,
      step2Solution: "   ",
    };
    const result = pitchInputSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("step2Solution"))).toBe(true);
    }
  });

  it("rejects when Step 3 has fewer than 2 alternatives", () => {
    const input = {
      ...validPitchInput,
      step3Alternatives: [validPitchInput.step3Alternatives[0]],
    };
    const result = pitchInputSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("step3Alternatives"))).toBe(true);
    }
  });

  it("rejects when Step 3 alternative has garbage pros/cons", () => {
    const input = {
      ...validPitchInput,
      step3Alternatives: [
        validPitchInput.step3Alternatives[0],
        {
          name: "Second option",
          pros: "qwerty",
          cons: "Expensive setup and ongoing fees",
          rejectionReason: "Cost too high",
        },
      ],
    };
    const result = pitchInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects when Step 4 budget is placeholder 'idk'", () => {
    const input = {
      ...validPitchInput,
      step4Budget: "idk",
    };
    const result = pitchInputSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("step4Budget"))).toBe(true);
    }
  });

  it("rejects when Step 5 experience is repeated 'aaaa'", () => {
    const input = {
      ...validPitchInput,
      step5Experience: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    };
    const result = pitchInputSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("step5Experience"))).toBe(true);
    }
  });
});

describe("validatePitchStep", () => {
  it("validates Step 1 successfully with valid input", () => {
    const res = validatePitchStep(1, { step1Diagnosis: validPitchInput.step1Diagnosis });
    expect(res.isValid).toBe(true);
    expect(res.errors).toEqual({});
  });

  it("fails Step 1 with specific field-level error on garbage input", () => {
    const res = validatePitchStep(1, { step1Diagnosis: "asdfgh" });
    expect(res.isValid).toBe(false);
    expect(res.errors.step1Diagnosis).toBeDefined();
    expect(res.errors.step1Diagnosis).toContain("keyboard-mash");
  });

  it("fails Step 2 when solution is a one-word answer", () => {
    const res = validatePitchStep(2, { step2Solution: "dashboard" });
    expect(res.isValid).toBe(false);
    expect(res.errors.step2Solution).toContain("at least 20 characters");
  });

  it("fails Step 3 when alternatives are incomplete or fewer than 2", () => {
    const res = validatePitchStep(3, {
      step3Alternatives: [
        { name: "A", pros: "fast", cons: "costly", rejectionReason: "budget" },
      ],
    });
    expect(res.isValid).toBe(false);
    expect(Object.keys(res.errors).length).toBeGreaterThan(0);
  });

  it("fails Step 4 when budget is empty", () => {
    const res = validatePitchStep(4, { step4Budget: "" });
    expect(res.isValid).toBe(false);
    expect(res.errors.step4Budget).toContain("cannot be empty");
  });

  it("fails Step 5 when experience contains lorem ipsum", () => {
    const res = validatePitchStep(5, {
      step5Experience: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    });
    expect(res.isValid).toBe(false);
    expect(res.errors.step5Experience).toContain("lorem ipsum");
  });
});

describe("validateFullPitch", () => {
  it("returns isValid: true for complete valid pitch", () => {
    const res = validateFullPitch(validPitchInput);
    expect(res.isValid).toBe(true);
    expect(res.errors).toEqual({});
  });

  it("returns specific field-level errors for garbage fields", () => {
    const res = validateFullPitch({
      step1Diagnosis: "broken",
      step2Solution: "asdfgh",
      step3Alternatives: [],
      step4Budget: "test",
      step5Experience: "idk",
    });
    expect(res.isValid).toBe(false);
    expect(res.errors["step1Diagnosis"]).toBeDefined();
    expect(res.errors["step2Solution"]).toBeDefined();
    expect(res.errors["step3Alternatives"]).toBeDefined();
    expect(res.errors["step4Budget"]).toBeDefined();
    expect(res.errors["step5Experience"]).toBeDefined();
  });
});
