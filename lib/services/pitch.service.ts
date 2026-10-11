import { prisma } from "@/lib/db";
import { evaluatePitch, PitchInput } from "@/lib/scoring/engine";
import { ValidationError, NotFoundError } from "@/lib/api/errors";
import { UserService } from "./user.service";

export interface SubmitPitchDTO {
  problemId: string;
  solverId?: string;
  pitchInput: PitchInput;
  revisionCount?: number;
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

    const problem = await prisma.problem.findUnique({
      where: { id: dto.problemId },
    });
    if (!problem) {
      throw new NotFoundError(`Problem with id "${dto.problemId}" not found.`);
    }

    // Resolve or provision solver
    const solver = await UserService.getOrCreateDefaultSolver(dto.solverId);

    // Pure deterministic quality gate evaluation
    const evaluation = evaluatePitch(dto.pitchInput);

    // Save pitch record to SQLite
    const pitch = await prisma.pitch.create({
      data: {
        problemId: problem.id,
        solverId: solver.id,
        stepData: JSON.stringify(dto.pitchInput),
        score: evaluation.overallScore,
        passed: evaluation.passed,
        knockedOut: evaluation.knockedOut,
        scoreBreakdown: JSON.stringify(evaluation),
        revisionCount: Number(dto.revisionCount) || 0,
      },
    });

    let updatedSolver = solver;
    if (evaluation.passed) {
      updatedSolver = await UserService.rewardSolverCredibility(solver.id, 0.1);
    }

    return {
      pitchId: pitch.id,
      evaluation,
      solver: updatedSolver,
      pitch,
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
            organization: true,
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
  static async getVettedInbox(problemId: string) {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        organization: true,
      },
    });

    if (!problem) {
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
}
