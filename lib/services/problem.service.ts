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
  postedById?: string;
  ownerId?: string;
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
        _count: { select: { pitches: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const problemIds = problems.map((problem) => problem.id);
    const vettedByProblem = new Map<string, number>();
    if (problemIds.length > 0) {
      const vettedCounts = await prisma.pitch.groupBy({
        by: ["problemId"],
        where: { problemId: { in: problemIds }, passed: true },
        _count: { _all: true },
      });
      for (const row of vettedCounts) {
        vettedByProblem.set(row.problemId, row._count._all);
      }
    }

    return problems.map((problem) => {
      const { _count, ...rest } = problem;
      return {
        ...rest,
        totalPitches: _count.pitches,
        vettedPitches: vettedByProblem.get(problem.id) ?? 0,
      };
    });
  }

  /**
   * Get single problem with associated statistics
   */
  static async getProblemById(id: string) {
    const problem = await prisma.problem.findUnique({
      where: { id },
      include: {
        organization: true,
        _count: { select: { pitches: true } },
      },
    });

    if (!problem) {
      throw new NotFoundError(`Problem with id "${id}" not found.`);
    }

    const vettedPitches = await prisma.pitch.count({
      where: { problemId: id, passed: true },
    });

    const { _count, ...rest } = problem;
    return {
      ...rest,
      totalPitches: _count.pitches,
      vettedPitches,
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
        ownerId: input.ownerId,
      });
      organizationId = org.id;
    }

    return prisma.problem.create({
      data: {
        title: input.title.trim(),
        description: input.description.trim(),
        frictionCategory: input.frictionCategory.trim(),
        organizationId,
        postedById: input.postedById ?? null,
        status: "OPEN",
      },
      include: {
        organization: true,
      },
    });
  }

  /**
   * Open or close a challenge for the owning poster.
   */
  static async updateProblemStatus(
    id: string,
    status: string,
    requester: { id: string; role: string }
  ) {
    const normalized = status?.toUpperCase();
    if (normalized !== "OPEN" && normalized !== "CLOSED") {
      throw new ValidationError(`Invalid problem status "${status}".`);
    }

    const problem = await prisma.problem.findUnique({
      where: { id },
      include: { organization: true },
    });

    if (!problem) {
      throw new NotFoundError(`Problem with id "${id}" not found.`);
    }

    const canManage =
      requester.role === "ADMIN" ||
      problem.postedById === requester.id ||
      problem.organization.ownerId === requester.id;

    if (!canManage) {
      throw new NotFoundError(`Problem with id "${id}" not found.`);
    }

    return prisma.problem.update({
      where: { id },
      data: { status: normalized },
      include: { organization: true },
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
