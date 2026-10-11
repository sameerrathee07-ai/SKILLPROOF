import { prisma } from "@/lib/db";
import { ValidationError, NotFoundError } from "@/lib/api/errors";
import { OrganizationService } from "./organization.service";

export interface CreateProblemInput {
  title: string;
  description: string;
  frictionCategory: string;
  organizationId?: string;
  orgName?: string;
  orgType?: string;
}

export interface ProblemFilter {
  category?: string | null;
  organizationId?: string | null;
}

export class ProblemService {
  /**
   * List problems with aggregated vetted & total pitches
   */
  static async listProblems(filter?: ProblemFilter) {
    const where: any = {};

    if (filter?.category && filter.category !== "ALL") {
      where.frictionCategory = filter.category;
    }
    if (filter?.organizationId) {
      where.organizationId = filter.organizationId;
    }

    const problems = await prisma.problem.findMany({
      where,
      include: {
        organization: true,
        pitches: {
          select: {
            id: true,
            passed: true,
            score: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return problems.map((p) => ({
      ...p,
      totalPitches: p.pitches.length,
      vettedPitches: p.pitches.filter((pitch) => pitch.passed).length,
    }));
  }

  /**
   * Get single problem with associated statistics
   */
  static async getProblemById(id: string) {
    const problem = await prisma.problem.findUnique({
      where: { id },
      include: {
        organization: true,
        pitches: {
          select: {
            id: true,
            passed: true,
            score: true,
            createdAt: true,
          },
        },
      },
    });

    if (!problem) {
      throw new NotFoundError(`Problem with id "${id}" not found.`);
    }

    return {
      ...problem,
      totalPitches: problem.pitches.length,
      vettedPitches: problem.pitches.filter((p) => p.passed).length,
    };
  }

  /**
   * Create new friction problem with validation
   */
  static async createProblem(input: CreateProblemInput) {
    if (!input.title?.trim()) {
      throw new ValidationError("Problem title is required.");
    }
    if (!input.description?.trim()) {
      throw new ValidationError("Problem description is required.");
    }
    if (!input.frictionCategory?.trim()) {
      throw new ValidationError("Friction category is required.");
    }

    let organizationId = input.organizationId;
    if (!organizationId) {
      const org = await OrganizationService.findOrCreateOrganization({
        name: input.orgName || "Premier Education Center",
        type: input.orgType || "COACHING_CENTER",
      });
      organizationId = org.id;
    }

    return prisma.problem.create({
      data: {
        title: input.title.trim(),
        description: input.description.trim(),
        frictionCategory: input.frictionCategory.trim(),
        organizationId,
        status: "OPEN",
      },
      include: {
        organization: true,
      },
    });
  }

  /**
   * Get high-level platform activity metrics
   */
  static async getPlatformStats() {
    const [problemCount, orgCount, pitchCount, vettedPitchCount] = await Promise.all([
      prisma.problem.count(),
      prisma.organization.count(),
      prisma.pitch.count(),
      prisma.pitch.count({ where: { passed: true } }),
    ]);

    return {
      problemCount,
      orgCount,
      pitchCount,
      vettedPitchCount,
    };
  }

  /**
   * Get recent problems for landing page
   */
  static async getRecentProblems(limit = 3) {
    return prisma.problem.findMany({
      include: {
        organization: true,
        pitches: { select: { id: true, passed: true } },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }
}
