import { z } from "zod";
import { normalizeAlternatives, AlternativeItem } from "@/lib/scoring/engine";

export interface TextValidationOptions {
  fieldLabel: string;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
}

export interface TextValidationResult {
  isValid: boolean;
  error?: string;
}

const COMMON_KEYBOARD_MASH_SEQUENCES = [
  // Home row & QWERTY sequences (forward and reverse)
  "asdf",
  "fdsa",
  "sdfg",
  "dfgh",
  "fghj",
  "ghjk",
  "hjkl",
  "lkjh",
  "kjhg",
  "jhgf",
  "hgfd",
  "gfds",
  "qwerty",
  "ytrewq",
  "qwert",
  "werty",
  "ertyu",
  "rtyui",
  "tyuio",
  "yuiop",
  "poiuy",
  "oiuyt",
  "iuytr",
  "uytre",
  "ytrew",
  "zxcv",
  "vcxz",
  "xcvb",
  "cvbn",
  "vbnm",
  "mnbv",
  "nbvc",
  "bvcx",
  // Diagonal / number sequences
  "qazw",
  "wsxe",
  "edcr",
  "rfvt",
  "tgby",
  "yhnj",
  "ujmk",
  "12345",
  "54321",
  "09876",
];

const JUNK_WORDS = new Set([
  "test",
  "testing",
  "tester",
  "idk",
  "na",
  "none",
  "nothing",
  "nil",
  "null",
  "undefined",
  "placeholder",
  "sample",
  "tbd",
  "todo",
  "foo",
  "bar",
  "baz",
  "xxx",
  "temp",
  "temporary",
  "whatever",
  "asdf",
  "qwerty",
]);

const JUNK_PHRASES = [
  "idk",
  "i dont know",
  "i do not know",
  "not applicable",
  "no idea",
  "will fill later",
  "to be determined",
  "to be decided",
  "lorem ipsum",
  "dolor sit amet",
];

const VALID_ACRONYMS = new Set([
  "https",
  "http",
  "html",
  "rxjs",
  "csv",
  "json",
  "yaml",
  "grpc",
  "xlsx",
  "pstmt",
  "ts",
  "js",
]);

/**
 * Validates text input to reject empty strings, insufficient length,
 * repeated characters, keyboard mash, and junk filler words.
 */
export function checkGarbageText(
  value: unknown,
  options: TextValidationOptions
): TextValidationResult {
  const { fieldLabel, minLength = 1, required = true } = options;

  if (typeof value !== "string") {
    if (required) {
      return { isValid: false, error: `${fieldLabel} is required.` };
    }
    return { isValid: true };
  }

  const trimmed = value.trim();

  // 1. Empty / Whitespace-only check
  if (trimmed.length === 0) {
    if (required) {
      return { isValid: false, error: `${fieldLabel} is required and cannot be empty.` };
    }
    return { isValid: true };
  }

  const lower = trimmed.toLowerCase();
  const textWithoutUrls = lower.replace(/https?:\/\/[^\s]+/gi, " ");
  const tokens = textWithoutUrls.split(/[^a-z0-9]+/i).filter(Boolean);

  // 2. Junk filler checks
  if (lower.includes("lorem ipsum") || lower.includes("dolor sit amet")) {
    return {
      isValid: false,
      error: `${fieldLabel} cannot contain lorem ipsum placeholder text.`,
    };
  }

  if (lower.includes("placeholder")) {
    return {
      isValid: false,
      error: `${fieldLabel} cannot contain placeholder text.`,
    };
  }

  const alphaOnly = lower.replace(/[^a-z]/g, "");
  if (
    JUNK_WORDS.has(alphaOnly) ||
    JUNK_PHRASES.includes(lower.replace(/[^a-z ]/g, " ").trim())
  ) {
    return {
      isValid: false,
      error: `${fieldLabel} cannot be a placeholder or filler text.`,
    };
  }

  // Token composition: if >= 60% of words are known junk fillers
  if (tokens.length > 0) {
    const junkCount = tokens.filter((t) => JUNK_WORDS.has(t)).length;
    if (junkCount / tokens.length >= 0.6) {
      return {
        isValid: false,
        error: `${fieldLabel} cannot consist of placeholder or test words.`,
      };
    }
  }

  // 3. Keyboard-mash checks
  for (const seq of COMMON_KEYBOARD_MASH_SEQUENCES) {
    if (lower.includes(seq)) {
      return {
        isValid: false,
        error: `${fieldLabel} contains keyboard-mash text ("${seq}"). Please provide real content.`,
      };
    }
  }

  // Consonant-only / vowel-less tokens of length >= 5
  for (const token of tokens) {
    if (VALID_ACRONYMS.has(token)) continue;
    if (token.length >= 5 && !/[aeiouy]/i.test(token)) {
      return {
        isValid: false,
        error: `${fieldLabel} contains keyboard-mash text ("${token}"). Please provide real content.`,
      };
    }
  }

  // 4. Repeated character checks
  // 4+ identical consecutive characters (e.g. "aaaa", "1111", ".....")
  if (/(.)\1{3,}/.test(trimmed)) {
    return {
      isValid: false,
      error: `${fieldLabel} contains repetitive characters. Please provide meaningful content.`,
    };
  }

  // Mostly a single repeated character (50%+ of non-whitespace characters)
  const nonWs = trimmed.replace(/\s+/g, "").toLowerCase();
  if (nonWs.length >= 4) {
    const counts: Record<string, number> = {};
    let max = 0;
    for (const c of nonWs) {
      counts[c] = (counts[c] || 0) + 1;
      if (counts[c] > max) max = counts[c];
    }
    if (max / nonWs.length >= 0.5) {
      return {
        isValid: false,
        error: `${fieldLabel} contains repetitive characters. Please provide meaningful content.`,
      };
    }
  }

  // 5. Minimum length check
  if (minLength && trimmed.length < minLength) {
    return {
      isValid: false,
      error: `${fieldLabel} must be at least ${minLength} characters.`,
    };
  }

  return { isValid: true };
}

/**
 * Creates a Zod string schema with garbage detection
 */
export function pitchString(options: TextValidationOptions) {
  return z.string().superRefine((val, ctx) => {
    const res = checkGarbageText(val, options);
    if (!res.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: res.error,
      });
    }
  });
}

/**
 * Creates an optional Zod string schema with garbage detection (only validated if non-empty)
 */
export function optionalPitchString(options: TextValidationOptions) {
  return z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      if (!val || val.trim().length === 0) return;
      const res = checkGarbageText(val, { ...options, required: false });
      if (!res.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: res.error,
        });
      }
    });
}

// ==========================================
// Per-Step Schemas
// ==========================================

export const step1Schema = z.object({
  step1Diagnosis: pitchString({
    fieldLabel: "Root Cause & Friction Analysis",
    minLength: 20,
    required: true,
  }),
});

export const step2Schema = z.object({
  step2Solution: pitchString({
    fieldLabel: "Solution Architecture & Strategy",
    minLength: 20,
    required: true,
  }),
  step2Deliverables: optionalPitchString({
    fieldLabel: "Concrete Deliverables Spec",
    minLength: 10,
  }),
  step2Milestones: optionalPitchString({
    fieldLabel: "Phased Milestones Timeline",
    minLength: 10,
  }),
});

export const alternativeItemSchema = z.object({
  name: pitchString({
    fieldLabel: "Alternative Name",
    minLength: 3,
    required: true,
  }),
  pros: pitchString({
    fieldLabel: "Alternative Pros",
    minLength: 5,
    required: true,
  }),
  cons: pitchString({
    fieldLabel: "Alternative Cons",
    minLength: 5,
    required: true,
  }),
  rejectionReason: pitchString({
    fieldLabel: "Alternative Rejection Reason",
    minLength: 5,
    required: true,
  }),
});

export const step3AlternativesSchema = z.union([
  z
    .array(alternativeItemSchema)
    .min(2, "At least 2 distinct alternatives must be evaluated."),
  z.string().superRefine((val, ctx) => {
    const res = checkGarbageText(val, {
      fieldLabel: "Alternative Analysis",
      minLength: 20,
      required: true,
    });
    if (!res.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: res.error,
      });
      return;
    }
    const normalized = normalizeAlternatives(val);
    if (normalized.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Must provide at least 2 distinct alternative approaches.",
      });
    }
  }),
]);

export const step3Schema = z.object({
  step3Alternatives: step3AlternativesSchema,
});

export const step4Schema = z.object({
  step4Budget: pitchString({
    fieldLabel: "Total Budget & Milestones",
    minLength: 10,
    required: true,
  }),
  step4CostBreakdown: optionalPitchString({
    fieldLabel: "Infrastructure & Hosting Cost Breakdown",
    minLength: 5,
  }),
});

export const step5Schema = z.object({
  step5Experience: pitchString({
    fieldLabel: "Relevant Experience & Capabilities",
    minLength: 20,
    required: true,
  }),
  step5ProofLinks: optionalPitchString({
    fieldLabel: "Verifiable Proof Links",
    minLength: 5,
  }),
  step5Constraints: optionalPitchString({
    fieldLabel: "Operational Constraints & Risks",
    minLength: 10,
  }),
});

// Full pitch input schema combining all 5 steps
export const pitchInputSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema);

// Submission payload schema
export const pitchSubmissionSchema = z.object({
  problemId: z.string().min(1, "Target problem ID is required."),
  solverId: z.string().optional(),
  pitchInput: pitchInputSchema,
  revisionCount: z.union([z.number(), z.string()]).optional(),
});

/**
 * Validates a specific step in the pitch wizard form
 */
export function validatePitchStep(
  step: number,
  form: {
    step1Diagnosis?: string;
    step2Solution?: string;
    step2Deliverables?: string;
    step2Milestones?: string;
    step3Alternatives?: AlternativeItem[] | string;
    step4Budget?: string;
    step4CostBreakdown?: string;
    step5Experience?: string;
    step5ProofLinks?: string;
    step5Constraints?: string;
  }
): { isValid: boolean; errors: Record<string, string> } {
  let schema: z.ZodTypeAny;

  switch (step) {
    case 1:
      schema = step1Schema;
      break;
    case 2:
      schema = step2Schema;
      break;
    case 3:
      schema = z.object({
        step3Alternatives: z
          .array(alternativeItemSchema)
          .min(2, "At least 2 distinct alternatives must be evaluated."),
      });
      break;
    case 4:
      schema = step4Schema;
      break;
    case 5:
      schema = step5Schema;
      break;
    default:
      return { isValid: true, errors: {} };
  }

  const result = schema.safeParse(form);
  if (result.success) {
    return { isValid: true, errors: {} };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  return { isValid: false, errors };
}

/**
 * Validates the complete pitch input object
 */
export function validateFullPitch(input: unknown): {
  isValid: boolean;
  errors: Record<string, string>;
  firstError?: string;
} {
  const result = pitchInputSchema.safeParse(input);
  if (result.success) {
    return { isValid: true, errors: {} };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  return {
    isValid: false,
    errors,
    firstError: result.error.issues[0]?.message || "Validation failed.",
  };
}
