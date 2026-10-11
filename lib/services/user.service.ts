import { prisma } from "@/lib/db";
import { env } from "@/lib/config/env";

export class UserService {
  /**
   * List users ordered by credibility
   */
  static async listUsers() {
    return prisma.user.findMany({
      orderBy: { credibilityScore: "desc" },
    });
  }

  /**
   * Get active solver or seed default demo solver
   */
  static async getOrCreateDefaultSolver(solverId?: string) {
    if (solverId) {
      const existing = await prisma.user.findUnique({
        where: { id: solverId },
      });
      if (existing) return existing;
    }

    const defaultSolver = await prisma.user.findFirst({
      where: { role: "SOLVER" },
    });

    if (defaultSolver) {
      return defaultSolver;
    }

    return prisma.user.create({
      data: {
        email: "student.solver@skillproof.dev",
        name: "Aryan Verma",
        role: "SOLVER",
        tokens: env.gate.defaultSolverTokens,
        credibilityScore: env.gate.initialCredibilityScore,
      },
    });
  }

  /**
   * Increment credibility upon quality gate pass
   */
  static async rewardSolverCredibility(userId: string, boost = 0.1) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        credibilityScore: {
          increment: boost,
        },
      },
    });
  }
}
