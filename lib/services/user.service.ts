import { prisma } from "@/lib/db";
import { NotFoundError, ValidationError } from "@/lib/api/errors";

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
   * Get the signed-in solver. Never provisions or substitutes another account.
   */
  static async getSolver(solverId: string) {
    if (!solverId) {
      throw new ValidationError("A signed-in solver is required.");
    }

    const solver = await prisma.user.findUnique({
      where: { id: solverId },
    });
    if (!solver) {
      throw new NotFoundError("Solver account not found.");
    }
    return solver;
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
