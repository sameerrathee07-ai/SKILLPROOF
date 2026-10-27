import type { ScoreResult } from "@/lib/scoring/engine";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

const FROM = process.env.RESEND_FROM_EMAIL || "SkillProof <notifications@skillproof.app>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function sendEmail(input: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(
      "[email:fallback]",
      JSON.stringify({
        to: input.to,
        subject: input.subject,
        text: input.text,
      })
    );
    return { sent: false, fallback: true };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error(
        "[email:error]",
        JSON.stringify({ status: response.status, to: input.to, subject: input.subject })
      );
      return { sent: false, fallback: false };
    }
    return { sent: true, fallback: false };
  } catch (error) {
    console.error(
      "[email:error]",
      JSON.stringify({
        to: input.to,
        subject: input.subject,
        error: error instanceof Error ? error.message : "Unknown email error",
      })
    );
    return { sent: false, fallback: false };
  }
}

export async function sendGateEvaluationResult(input: {
  to: string;
  solverName: string;
  problemTitle: string;
  evaluation: ScoreResult;
}) {
  const dimensions = Object.entries(input.evaluation.dimensions)
    .map(
      ([name, dimension]) =>
        `${name}: ${dimension.score.toFixed(1)}/${dimension.maxScore} - ${dimension.feedback}`
    )
    .join("\n");
  const tips = input.evaluation.actionableFeedback.join("\n- ");
  const verdict = input.evaluation.passed ? "Passed the quality gate" : "Needs revision";

  const text = [
    `Hello ${input.solverName},`,
    "",
    `Your proposal for "${input.problemTitle}" scored ${input.evaluation.overallScore.toFixed(1)}/10.`,
    `Status: ${verdict}.`,
    "",
    "Score breakdown:",
    dimensions,
    "",
    input.evaluation.knockoutReason
      ? `Knockout reason: ${input.evaluation.knockoutReason}`
      : "",
    tips ? `Revision tips:\n- ${tips}` : "",
    "",
    `Review your submission: ${APP_URL}/profile`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <p>Hello ${escapeHtml(input.solverName)},</p>
    <p>Your proposal for <strong>${escapeHtml(input.problemTitle)}</strong> scored <strong>${input.evaluation.overallScore.toFixed(1)}/10</strong>.</p>
    <p>Status: <strong>${escapeHtml(verdict)}</strong></p>
    <h3>Score breakdown</h3>
    <ul>${Object.entries(input.evaluation.dimensions)
      .map(
        ([name, dimension]) =>
          `<li><strong>${escapeHtml(name)}</strong>: ${dimension.score.toFixed(1)}/${dimension.maxScore} - ${escapeHtml(dimension.feedback)}</li>`
      )
      .join("")}</ul>
    ${
      input.evaluation.knockoutReason
        ? `<p><strong>Knockout reason:</strong> ${escapeHtml(input.evaluation.knockoutReason)}</p>`
        : ""
    }
    ${
      input.evaluation.actionableFeedback.length
        ? `<h3>Revision tips</h3><ul>${input.evaluation.actionableFeedback
            .map((tip) => `<li>${escapeHtml(tip)}</li>`)
            .join("")}</ul>`
        : ""
    }
    <p><a href="${APP_URL}/profile">Review your submission</a></p>
  `;

  return sendEmail({
    to: input.to,
    subject: `Your SkillProof gate result: ${verdict}`,
    html,
    text,
  });
}

export async function sendNewVettedProposalAlert(input: {
  to: string;
  orgName: string;
  problemTitle: string;
  solverName: string;
  score: number;
  proposalId: string;
}) {
  const text = [
    `A new vetted proposal is available for ${input.orgName}.`,
    "",
    `Challenge: ${input.problemTitle}`,
    `Solver: ${input.solverName}`,
    `Gate score: ${input.score.toFixed(1)}/10`,
    "",
    `Review the proposal: ${APP_URL}/org/proposals/${input.proposalId}`,
  ].join("\n");

  const html = `
    <p>A new vetted proposal is available for <strong>${escapeHtml(input.orgName)}</strong>.</p>
    <p><strong>Challenge:</strong> ${escapeHtml(input.problemTitle)}</p>
    <p><strong>Solver:</strong> ${escapeHtml(input.solverName)}</p>
    <p><strong>Gate score:</strong> ${input.score.toFixed(1)}/10</p>
    <p><a href="${APP_URL}/org/proposals/${input.proposalId}">Review the proposal</a></p>
  `;

  return sendEmail({
    to: input.to,
    subject: `New vetted proposal: ${input.problemTitle}`,
    html,
    text,
  });
}

export async function sendProposalStatusUpdate(input: {
  to: string;
  solverName: string;
  problemTitle: string;
  status: "SHORTLISTED" | "ACCEPTED" | "DECLINED";
  posterNotes?: string | null;
}) {
  const statusLabel =
    input.status === "SHORTLISTED"
      ? "shortlisted"
      : input.status === "ACCEPTED"
        ? "accepted"
        : "declined";
  const text = [
    `Hello ${input.solverName},`,
    "",
    `Your proposal for "${input.problemTitle}" was ${statusLabel}.`,
    input.posterNotes ? `Organization notes: ${input.posterNotes}` : "",
    "",
    `View your submissions: ${APP_URL}/profile`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <p>Hello ${escapeHtml(input.solverName)},</p>
    <p>Your proposal for <strong>${escapeHtml(input.problemTitle)}</strong> was <strong>${statusLabel}</strong>.</p>
    ${input.posterNotes ? `<p><strong>Organization notes:</strong> ${escapeHtml(input.posterNotes)}</p>` : ""}
    <p><a href="${APP_URL}/profile">View your submissions</a></p>
  `;

  return sendEmail({
    to: input.to,
    subject: `Proposal update: ${statusLabel}`,
    html,
    text,
  });
}
