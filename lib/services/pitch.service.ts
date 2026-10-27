import { prisma } from "@/lib/db";
import { evaluatePitch, PitchInput, ScoreResult } from "@/lib/scoring/engine";
import { ValidationError, NotFoundError } from "@/lib/api/errors";
import { UserService } from "./user.service";
import { validateFullPitch } from "@/lib/validations/pitch.schema";
import {
  sendGateEvaluationResult,
  sendNewVettedProposalAlert,
  sendProposalStatusUpdate,
} from "@/lib/email/service";

const PROPOSAL_STATUSES = ["SUBMITTED", "SHORTLISTED", "ACCEPTED", "DECLINED"] as const;
type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export interface SubmitPitchDTO {
  problemId: string;
  solverId: string;
  pitchInput: PitchInput;
  revisionCount?: number;
  idempotencyKey?: string;
}

export class PitchService {
  /**
   * Submit, evaluate through deterministic quality gate, and persist
   */
  static async submitAndEvaluate(dto: SubmitPitchDTO) {
    if (!dto.pitchInput) {
      throw new ValidationError("Missing pitch input data.");
    }
    if (!dto.problemId) {
      throw new ValidationError("Missing target problem ID.");
    }

    const validation = validateFullPitch(dto.pitchInput);
    if (!validation.isValid) {
      throw new ValidationError(
        validation.firstError || "Invalid pitch input data.",
        validation.errors
      );
    }

    const problem = await prisma.problem.findUnique({
      where: { id: dto.problemId },
      include: {
        organization: {
          include: {
            owner: true,
          },
        },
      },
    });
    if (!problem) {
      throw new NotFoundError(`Problem with id "${dto.problemId}" not found.`);
    }

    const solver = await UserService.getSolver(dto.solverId);

    if (dto.idempotencyKey) {
      const existing = await prisma.pitch.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
        include: { solver: true },
      });
      if (existing) {
        if (existing.solverId !== solver.id) {
          throw new ValidationError("This idempotency key is already in use.");
        }
        let evaluation: ScoreResult | null = null;
        try {
          evaluation = JSON.parse(existing.scoreBreakdown) as ScoreResult;
        } catch {}
        return {
          pitchId: existing.id,
          evaluation,
          solver: existing.solver,
          pitch: existing,
          tokensRemaining: existing.solver.tokens,
          idempotent: true,
        };
      }
    }

    // Atomic conditional decrement: two concurrent submissions cannot both spend the last token
    const consumed = await prisma.user.updateMany({
      where: { id: solver.id, tokens: { gte: 1 } },
      data: { tokens: { decrement: 1 } },
    });
    if (consumed.count === 0) {
      throw new ValidationError(
        "You have no tokens left. Submitting a pitch costs one token. Please buy tokens to continue."
      );
    }

    const balance = await prisma.user.findUnique({
      where: { id: solver.id },
      select: { tokens: true },
    });

    // Pure deterministic quality gate evaluation
    const evaluation = evaluatePitch(dto.pitchInput);

    // Save pitch record to PostgreSQL
    let pitch;
    try {
      pitch = await prisma.pitch.create({
        data: {
          problemId: problem.id,
          solverId: solver.id,
          stepData: JSON.stringify(dto.pitchInput),
          score: evaluation.overallScore,
          passed: evaluation.passed,
          knockedOut: evaluation.knockedOut,
          scoreBreakdown: JSON.stringify(evaluation),
          revisionCount: Number(dto.revisionCount) || 0,
          ...(dto.idempotencyKey ? { idempotencyKey: dto.idempotencyKey } : {}),
        },
      });
    } catch (error) {
      // Refund the token if persistence fails after consumption.
      await prisma.user
        .update({ where: { id: solver.id }, data: { tokens: { increment: 1 } } })
        .catch(() => undefined);

      if (
        dto.idempotencyKey &&
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "P2002"
      ) {
        const existing = await prisma.pitch.findUnique({
          where: { idempotencyKey: dto.idempotencyKey },
          include: { solver: true },
        });
        if (existing && existing.solverId === solver.id) {
          let evaluationResult: ScoreResult | null = null;
          try {
            evaluationResult = JSON.parse(existing.scoreBreakdown) as ScoreResult;
          } catch {}
          return {
            pitchId: existing.id,
            evaluation: evaluationResult,
            solver: existing.solver,
            pitch: existing,
            tokensRemaining: existing.solver.tokens,
            idempotent: true,
          };
        }
      }
      throw error;
    }

    let updatedSolver = solver;
    if (evaluation.passed) {
      updatedSolver = await UserService.rewardSolverCredibility(solver.id, 0.1);
    }

    if (updatedSolver.email) {
      void sendGateEvaluationResult({
        to: updatedSolver.email,
        solverName: updatedSolver.name || "Solver",
        problemTitle: problem.title,
        evaluation,
      });
    }

    const organizationOwner = problem.organization?.owner;
    if (evaluation.passed && organizationOwner?.email) {
      void sendNewVettedProposalAlert({
        to: organizationOwner.email,
        orgName: problem.organization.name,
        problemTitle: problem.title,
        solverName: updatedSolver.name || "Solver",
        score: evaluation.overallScore,
        proposalId: pitch.id,
      });
    }

    return {
      pitchId: pitch.id,
      evaluation,
      solver: updatedSolver,
      pitch,
      tokensRemaining: balance?.tokens ?? 0,
    };
  }

  /**
   * Get single proposal by ID with parsed metadata
   */
  static async getPitchById(id: string) {
    const pitch = await prisma.pitch.findUnique({
      where: { id },
      include: {
        solver: true,
        problem: {
          include: {
            organization: {
              include: {
                owner: true,
              },
            },
          },
        },
      },
    });

    if (!pitch) {
      throw new NotFoundError(`Proposal with id "${id}" not found.`);
    }

    let parsedStepData: PitchInput | null = null;
    let parsedScoreBreakdown = null;

    try {
      parsedStepData = JSON.parse(pitch.stepData);
    } catch {
      parsedStepData = null;
    }

    try {
      parsedScoreBreakdown = JSON.parse(pitch.scoreBreakdown);
    } catch {
      parsedScoreBreakdown = null;
    }

    return {
      ...pitch,
      stepDataParsed: parsedStepData,
      scoreBreakdownParsed: parsedScoreBreakdown,
    };
  }

  /**
   * Get organization vetted proposals inbox (shows only pitches passing quality gate)
   */
  static async getVettedInbox(problemId: string, requester?: { id: string; role: string }) {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        organization: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!problem) {
      throw new NotFoundError(`Problem with id "${problemId}" not found.`);
    }

    // Same "not found" message for unauthorized readers: do not reveal the problem exists.
    const ownsOrganization = problem.organization?.ownerId === requester?.id;
    if (
      !requester ||
      (requester.role !== "ADMIN" &&
        problem.postedById !== requester.id &&
        !ownsOrganization)
    ) {
      throw new NotFoundError(`Problem with id "${problemId}" not found.`);
    }

    const vettedProposals = await prisma.pitch.findMany({
      where: {
        problemId,
        passed: true,
      },
      include: {
        solver: true,
      },
      orderBy: {
        score: "desc",
      },
    });

    const totalSubmissions = await prisma.pitch.count({
      where: { problemId },
    });

    const blockedNoise = totalSubmissions - vettedProposals.length;

    const parsedProposals = vettedProposals.map((p) => {
      let stepDataParsed = null;
      let scoreBreakdownParsed = null;
      try {
        stepDataParsed = JSON.parse(p.stepData);
      } catch {}
      try {
        scoreBreakdownParsed = JSON.parse(p.scoreBreakdown);
      } catch {}

      return {
        ...p,
        stepDataParsed,
        scoreBreakdownParsed,
      };
    });

    return {
      problem,
      totalSubmissions,
      blockedNoise,
      vettedCount: vettedProposals.length,
      proposals: parsedProposals,
    };
  }

  /**
   * Get a proposal for its owning organization, hiding contact data until reviewed.
   */
  static async getProposalForReview(id: string, requester: { id: string; role: string }) {
    const proposal = await this.getPitchById(id);
    const canManage =
      requester.role === "ADMIN" ||
      proposal.problem.postedById === requester.id ||
      proposal.problem.organization.ownerId === requester.id;

    if (!canManage) {
      throw new NotFoundError(`Proposal with id "${id}" not found.`);
    }

    const canContact =
      proposal.status === "SHORTLISTED" || proposal.status === "ACCEPTED";

    return {
      ...proposal,
      solver: {
        ...proposal.solver,
        email: canContact ? proposal.solver.email : null,
      },
    };
  }

  /**
   * Move a proposal through the poster review lifecycle.
   */
  static async updateProposalStatus(
    pitchId: string,
    requester: { id: string; role: string },
    status: string,
    posterNotes?: string
  ) {
    const normalized = status?.toUpperCase() as ProposalStatus;
    if (!PROPOSAL_STATUSES.includes(normalized)) {
      throw new ValidationError(`Invalid proposal status "${status}".`);
    }

    const pitch = await prisma.pitch.findUnique({
      where: { id: pitchId },
      include: {
        solver: true,
        problem: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!pitch) {
      throw new NotFoundError(`Proposal with id "${pitchId}" not found.`);
    }

    const canManage =
      requester.role === "ADMIN" ||
      pitch.problem.postedById === requester.id ||
      pitch.problem.organization.ownerId === requester.id;

    if (!canManage) {
      throw new NotFoundError(`Proposal with id "${pitchId}" not found.`);
    }

    const notes =
      posterNotes === undefined ? undefined : posterNotes.trim().slice(0, 4000);

    const updated = await prisma.pitch.update({
      where: { id: pitchId },
      data: {
        status: normalized,
        ...(notes !== undefined ? { posterNotes: notes } : {}),
      },
      include: {
        solver: true,
        problem: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (
      normalized !== "SUBMITTED" &&
      updated.solver.email
    ) {
      void sendProposalStatusUpdate({
        to: updated.solver.email,
        solverName: updated.solver.name || "Solver",
        problemTitle: updated.problem.title,
        status: normalized as "SHORTLISTED" | "ACCEPTED" | "DECLINED",
        posterNotes: notes,
      });
    }

    return updated;
  }
}
