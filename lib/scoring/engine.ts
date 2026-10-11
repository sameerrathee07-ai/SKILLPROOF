/**
 * SkillProof Deterministic Quality-Gating Scoring Engine
 * Pure TypeScript, stateless, zero external LLM/API dependencies.
 *
 * Tier 1: Binary Knockout Criteria (Immediate Fail)
 *   1. Pricing Check (explicit numbers/currency symbols)
 *   2. Alternatives Check (min 2 distinct alternative approaches)
 *   3. Minimum Effort Check (> 200 total characters)
 *
 * Tier 2: 6-Dimension Quality Score (0 to 10 Scale, Threshold = 6.0)
 *   1. Problem Diagnosis (Weight: 2.0)
 *   2. Solution Actionability (Weight: 2.0)
 *   3. Alternatives Depth (Weight: 1.5)
 *   4. Pricing Transparency (Weight: 1.5)
 *   5. Solver Proof & Credentials (Weight: 1.5)
 *   6. Constraints & Feasibility (Weight: 1.5)
 */

export interface AlternativeItem {
  name: string;
  pros?: string;
  cons?: string;
  rejectionReason?: string;
}

export interface PitchInput {
  problemId?: string;
  title?: string;
  // Step 1: Problem Diagnosis
  step1Diagnosis: string;
  // Step 2: Proposed Solution & Deliverables
  step2Solution: string;
  step2Deliverables?: string;
  step2Milestones?: string;
  // Step 3: Alternatives Considered (Min 2 options)
  step3Alternatives: AlternativeItem[] | string;
  // Step 4: Budget & Milestones
  step4Budget: string;
  step4CostBreakdown?: string;
  // Step 5: Relevant Experience / Links & Feasibility
  step5Experience: string;
  step5ProofLinks?: string;
  step5Constraints?: string;
}

export interface DimensionScore {
  score: number;
  maxScore: number;
  feedback: string;
}

export interface ScoreResult {
  passed: boolean;
  knockedOut: boolean;
  overallScore: number; // 0.0 to 10.0
  dimensions: {
    problemDiagnosis: DimensionScore;
    solutionActionability: DimensionScore;
    alternativesDepth: DimensionScore;
    pricingTransparency: DimensionScore;
    solverProof: DimensionScore;
    constraintsFeasibility: DimensionScore;
  };
  actionableFeedback: string[];
}

export const GATE_THRESHOLD = 6.0;

/**
 * Normalizes alternatives input to an array of non-empty items.
 */
function normalizeAlternatives(
  raw: AlternativeItem[] | string | undefined
): { name: string; details: string }[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .filter((item) => item && typeof item === "object" && item.name && item.name.trim().length > 1)
      .map((item) => ({
        name: item.name.trim(),
        details: [item.pros || "", item.cons || "", item.rejectionReason || ""].join(" ").trim(),
      }));
  }
  if (typeof raw === "string") {
    // Attempt parsing lines or numbered lists: 1. ... 2. ...
    const lines = raw
      .split(/\n|(?=\b(?:Option|Alternative|Approach|\d+\.)\s+)/i)
      .map((s) => s.trim())
      .filter((s) => s.length > 5);

    if (lines.length >= 2) {
      return lines.map((line, idx) => ({
        name: `Alternative ${idx + 1}`,
        details: line,
      }));
    }

    // Split on separators like vs, versus, semi-colon
    const parts = raw.split(/;| versus |\bvs\.?\b/i).map((s) => s.trim()).filter((s) => s.length > 5);
    if (parts.length >= 2) {
      return parts.map((part, idx) => ({
        name: `Alternative ${idx + 1}`,
        details: part,
      }));
    }

    if (raw.trim().length > 15) {
      return [{ name: "Single Alternative", details: raw.trim() }];
    }
  }
  return [];
}

/**
 * Checks for explicit numbers or currency symbols
 */
function hasPricing(text: string): boolean {
  if (!text) return false;
  // Match currency symbols ($ ₹ € £ Rs INR USD) or numbers (e.g. 500, 15,000, 25k)
  const currencyPattern = /[$₹€£]|(?:rs\.?|inr|usd|eur|gbp)\b/i;
  const numberPattern = /\b\d+(?:[,\.]\d+)*(?:\s*(?:k|lakh|thousand|hundred|per|hr|mo|pm|\/hr|\/month))?\b/i;
  return currencyPattern.test(text) || numberPattern.test(text);
}

/**
 * Calculates total character count across all submitted steps
 */
function calculateTotalLength(data: PitchInput): number {
  const parts: string[] = [
    data.step1Diagnosis || "",
    data.step2Solution || "",
    data.step2Deliverables || "",
    data.step2Milestones || "",
    data.step4Budget || "",
    data.step4CostBreakdown || "",
    data.step5Experience || "",
    data.step5ProofLinks || "",
    data.step5Constraints || "",
  ];

  if (typeof data.step3Alternatives === "string") {
    parts.push(data.step3Alternatives);
  } else if (Array.isArray(data.step3Alternatives)) {
    for (const alt of data.step3Alternatives) {
      parts.push(alt.name || "", alt.pros || "", alt.cons || "", alt.rejectionReason || "");
    }
  }

  return parts.reduce((sum, str) => sum + str.trim().length, 0);
}

/**
 * Pure, stateless pitch evaluator implementing Two-Tier Gating.
 */
export function evaluatePitch(data: PitchInput): ScoreResult {
  const totalLength = calculateTotalLength(data);
  const budgetCombined = `${data.step4Budget || ""} ${data.step4CostBreakdown || ""}`.trim();
  const alternatives = normalizeAlternatives(data.step3Alternatives);

  // ==========================================
  // TIER 1: Binary Knockout Criteria
  // ==========================================
  const knockoutReasons: string[] = [];

  // Knockout 1: Pricing Check
  if (!hasPricing(budgetCombined)) {
    knockoutReasons.push(
      "KNOCKOUT: Missing explicit pricing/budget. You must provide concrete numerical estimates or currency figures in Step 4 (e.g., ₹15,000, $500, or hourly/milestone rates)."
    );
  }

  // Knockout 2: Alternatives Check (Min 2 options)
  if (alternatives.length < 2) {
    knockoutReasons.push(
      "KNOCKOUT: Incomplete alternatives evaluation. Step 3 must list and evaluate at least 2 distinct alternative approaches considered before arriving at your recommendation."
    );
  }

  // Knockout 3: Minimum Effort Check (> 200 total characters)
  if (totalLength <= 200) {
    knockoutReasons.push(
      `KNOCKOUT: Minimum effort threshold not met. Your total pitch contains ${totalLength} characters, but requires at least 200 characters across all fields.`
    );
  }

  // If any Knockout failed, immediately exit Tier 1 without running Tier 2
  if (knockoutReasons.length > 0) {
    return {
      passed: false,
      knockedOut: true,
      overallScore: 0.0,
      dimensions: {
        problemDiagnosis: { score: 0, maxScore: 2.0, feedback: "Evaluation halted due to knockout." },
        solutionActionability: { score: 0, maxScore: 2.0, feedback: "Evaluation halted due to knockout." },
        alternativesDepth: { score: 0, maxScore: 1.5, feedback: "Evaluation halted due to knockout." },
        pricingTransparency: { score: 0, maxScore: 1.5, feedback: "Evaluation halted due to knockout." },
        solverProof: { score: 0, maxScore: 1.5, feedback: "Evaluation halted due to knockout." },
        constraintsFeasibility: { score: 0, maxScore: 1.5, feedback: "Evaluation halted due to knockout." },
      },
      actionableFeedback: knockoutReasons,
    };
  }

  // ==========================================
  // TIER 2: 6-Dimension Quality Score (0 to 10)
  // Calibrated per PRD VAL-1 to VAL-6 requirements
  // ==========================================
  const actionableFeedback: string[] = [];

  // Dimension 1: Problem Diagnosis (Weight: 2.0)
  // Root-cause analysis vs symptom restatement
  const diagnosisText = (data.step1Diagnosis || "").trim();
  let d1Score = 0.2; // minimal base for non-empty text
  const rootCauseKeywords = [
    "root cause", "underlying", "because", "friction", "bottleneck", "manual", "systemic",
    "delayed", "lack of", "retention", "coaching", "tuition", "faculty", "student", "attendance",
    "batch", "communication", "drop-out", "symptom", "process", "incentive", "handoff", "workflow"
  ];
  const d1KeywordMatches = rootCauseKeywords.filter((kw) =>
    new RegExp(`\\b${kw}\\b`, "i").test(diagnosisText)
  ).length;

  if (d1KeywordMatches >= 1) {
    if (diagnosisText.length > 80) d1Score += 0.3;
    if (diagnosisText.length > 180) d1Score += 0.2;
  }
  if (d1KeywordMatches >= 2) d1Score += 0.5;
  if (d1KeywordMatches >= 4) d1Score += 0.5;
  if (d1KeywordMatches >= 6) d1Score += 0.3;
  d1Score = Math.min(2.0, Math.round(d1Score * 10) / 10);

  const d1Feedback =
    d1Score >= 1.5
      ? "Strong root-cause diagnosis identifying systemic friction and organizational context."
      : d1Score >= 1.0
      ? "Fair diagnostic analysis, but could articulate deeper underlying root causes vs visible symptoms."
      : "Shallow diagnosis: restates surface symptoms without identifying operational bottlenecks.";
  if (d1Score < 1.3) {
    actionableFeedback.push(
      "Problem Diagnosis: Detail why the issue persists operationally (e.g. manual tracking, feedback latency) rather than only describing visible symptoms."
    );
  }

  // Dimension 2: Solution Actionability (Weight: 2.0)
  // Concrete deliverables and timeline milestones
  const solutionText = `${data.step2Solution || ""} ${data.step2Deliverables || ""} ${data.step2Milestones || ""}`.trim();
  let d2Score = 0.2;
  const deliverableKeywords = [
    "dashboard", "api", "webhook", "database", "export", "notification", "automation",
    "portal", "auth", "csv", "whatsapp", "sms", "schema", "architecture", "component",
    "sync", "report", "bot", "pipeline", "script", "admin", "role", "daemon", "telemetry"
  ];
  const milestoneKeywords = [
    "week", "day", "phase", "milestone", "sprint", "timeline", "stage", "mvp", "launch", "step 1"
  ];
  const d2DeliverableMatches = deliverableKeywords.filter((kw) =>
    new RegExp(`\\b${kw}\\b`, "i").test(solutionText)
  ).length;
  const d2MilestoneMatches = milestoneKeywords.filter((kw) =>
    new RegExp(`\\b${kw}\\b`, "i").test(solutionText)
  ).length;

  if (solutionText.length > 100) d2Score += 0.3;
  if (solutionText.length > 220) d2Score += 0.2;
  if (d2DeliverableMatches >= 2) d2Score += 0.5;
  if (d2DeliverableMatches >= 4) d2Score += 0.3;
  if (d2MilestoneMatches >= 2) d2Score += 0.5;
  d2Score = Math.min(2.0, Math.round(d2Score * 10) / 10);

  const d2Feedback =
    d2Score >= 1.5
      ? "Highly actionable solution with concrete technical deliverables and phased timeline."
      : d2Score >= 1.0
      ? "Viable solution, but needs more granular deliverable specs or milestone timelines."
      : "Vague solution: lacks concrete technical deliverables or measurable milestones.";
  if (d2Score < 1.3) {
    actionableFeedback.push(
      "Solution Actionability: Specify concrete technical deliverables (e.g., webhook worker, dashboard) and phased milestones."
    );
  }

  // Dimension 3: Alternatives Depth (Weight: 1.5)
  // Pros/cons depth of evaluated options
  let d3Score = 0.2;
  const altDetailsCombined = alternatives.map((a) => `${a.name} ${a.details}`).join(" ");
  const tradeOffKeywords = [
    "pros", "cons", "advantage", "disadvantage", "downside", "overhead", "licensing",
    "complexity", "latency", "expensive", "maintainability", "custom", "off-the-shelf", "costly",
    "scalable", "trade-off", "rejected", "slower", "fragile", "vendor lock-in", "limitation"
  ];
  const d3TradeOffMatches = tradeOffKeywords.filter((kw) =>
    new RegExp(`\\b${kw}\\b`, "i").test(altDetailsCombined)
  ).length;

  if (alternatives.length >= 2) d3Score += 0.3;
  if (alternatives.length >= 3) d3Score += 0.2;
  if (d3TradeOffMatches >= 1) d3Score += 0.3;
  if (d3TradeOffMatches >= 3) d3Score += 0.3;
  if (altDetailsCombined.length > 100) d3Score += 0.2;
  d3Score = Math.min(1.5, Math.round(d3Score * 10) / 10);

  const d3Feedback =
    d3Score >= 1.2
      ? "Rigorous evaluation of alternative options with clear trade-offs and rationale."
      : d3Score >= 0.8
      ? "Alternatives listed, but trade-off analysis (pros/cons) could be more substantive."
      : "Superficial alternatives: options listed with minimal comparative reasoning.";
  if (d3Score < 1.0) {
    actionableFeedback.push(
      "Alternatives Depth: Explicitly outline the pros, cons, and reasons for rejecting alternatives (e.g., vendor lock-in, licensing cost, maintenance complexity)."
    );
  }

  // Dimension 4: Pricing Transparency (Weight: 1.5)
  // Clarity of cost breakdown and deliverable mapping
  let d4Score = 0.2;
  const priceItemizationKeywords = [
    "milestone", "phase", "breakdown", "hosting", "maintenance", "flat", "fixed",
    "hourly", "per module", "itemized", "setup", "deliverable", "support", "inr", "rs", "usd"
  ];
  const d4Matches = priceItemizationKeywords.filter((kw) =>
    new RegExp(`\\b${kw}\\b`, "i").test(budgetCombined)
  ).length;

  if (d4Matches >= 1) d4Score += 0.3;
  if (d4Matches >= 3) d4Score += 0.4;
  if (budgetCombined.length > 60) d4Score += 0.3;
  if (budgetCombined.length > 120) d4Score += 0.3;
  d4Score = Math.min(1.5, Math.round(d4Score * 10) / 10);

  const d4Feedback =
    d4Score >= 1.2
      ? "Transparent, itemized pricing mapped directly to project milestones or scope."
      : d4Score >= 0.8
      ? "Pricing provided, but would benefit from detailed line-item breakdown."
      : "Vague pricing: single lump sum without breakdown or deliverable mapping.";
  if (d4Score < 1.0) {
    actionableFeedback.push(
      "Pricing Transparency: Break down your cost estimate into itemized milestones or deliverables rather than an unmapped lump sum."
    );
  }

  // Dimension 5: Solver Proof & Credentials (Weight: 1.5)
  // Portfolio links, relevant past projects, proof of work
  const proofText = `${data.step5Experience || ""} ${data.step5ProofLinks || ""}`.trim();
  let d5Score = 0.1;
  const urlPattern = /(?:https?:\/\/|github\.com|gitlab\.com|vercel\.app|portfolio|linkedin\.com)[\w\/\.\-\?=&#]+/i;
  const proofKeywords = [
    "built", "shipped", "developed", "experience with", "worked on", "stack", "previous",
    "portfolio", "github", "demo", "live", "deployed", "react", "next", "node", "python",
    "database", "case study", "hackathon", "project"
  ];
  const d5ProofMatches = proofKeywords.filter((kw) =>
    new RegExp(`\\b${kw}\\b`, "i").test(proofText)
  ).length;

  if (urlPattern.test(proofText)) d5Score += 0.6;
  if (d5ProofMatches >= 1) d5Score += 0.3;
  if (d5ProofMatches >= 3) d5Score += 0.3;
  if (proofText.length > 80) d5Score += 0.2;
  d5Score = Math.min(1.5, Math.round(d5Score * 10) / 10);

  const d5Feedback =
    d5Score >= 1.2
      ? "Strong evidence of domain capability with verified links or relevant past project examples."
      : d5Score >= 0.8
      ? "Past experience cited, but could include verifiable project links or live demos."
      : "Insufficient solver proof: no verifiable portfolio links or concrete project track record.";
  if (d5Score < 1.0) {
    actionableFeedback.push(
      "Solver Proof: Provide active portfolio links, GitHub repositories, or deployed demos that prove your technical execution ability."
    );
  }

  // Dimension 6: Constraints & Feasibility (Weight: 1.5)
  // Acknowledgment of tech, time, or operational constraints
  const constraintText = `${data.step5Constraints || ""} ${data.step2Solution || ""}`.trim();
  let d6Score = 0.1;
  const constraintKeywords = [
    "constraint", "limitation", "risk", "feasibility", "non-technical", "training",
    "adoption", "rate limit", "offline", "downtime", "privacy", "security", "ferpa",
    "gdpr", "mobile", "edge case", "staff", "fallback", "reliability", "backup"
  ];
  const d6Matches = constraintKeywords.filter((kw) =>
    new RegExp(`\\b${kw}\\b`, "i").test(constraintText)
  ).length;

  if (d6Matches >= 1) d6Score += 0.5;
  if (d6Matches >= 3) d6Score += 0.5;
  if (constraintText.length > 70) d6Score += 0.2;
  if (constraintText.length > 140) d6Score += 0.2;
  d6Score = Math.min(1.5, Math.round(d6Score * 10) / 10);

  const d6Feedback =
    d6Score >= 1.2
      ? "Mature understanding of operational and technical constraints with contingency awareness."
      : d6Score >= 0.8
      ? "Basic awareness of constraints, but could address adoption or technical risk deeper."
      : "Little or no recognition of real-world operational constraints or deployment risks.";
  if (d6Score < 1.0) {
    actionableFeedback.push(
      "Constraints & Feasibility: Acknowledge operational hurdles (e.g. non-technical staff adoption, API rate limits, or student data privacy)."
    );
  }

  // Total Score Calculation
  const sumScores = d1Score + d2Score + d3Score + d4Score + d5Score + d6Score;
  const overallScore = Math.min(10.0, Math.round(sumScores * 10) / 10);
  const passed = overallScore >= GATE_THRESHOLD;

  return {
    passed,
    knockedOut: false,
    overallScore,
    dimensions: {
      problemDiagnosis: { score: d1Score, maxScore: 2.0, feedback: d1Feedback },
      solutionActionability: { score: d2Score, maxScore: 2.0, feedback: d2Feedback },
      alternativesDepth: { score: d3Score, maxScore: 1.5, feedback: d3Feedback },
      pricingTransparency: { score: d4Score, maxScore: 1.5, feedback: d4Feedback },
      solverProof: { score: d5Score, maxScore: 1.5, feedback: d5Feedback },
      constraintsFeasibility: { score: d6Score, maxScore: 1.5, feedback: d6Feedback },
    },
    actionableFeedback,
  };
}
