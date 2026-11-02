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
   * Apply a signed credibility change and keep the score within 0–10.
   */
  static async adjustSolverCredibility(userId: string, delta: number) {
    if (!Number.isFinite(delta) || delta === 0) {
      throw new ValidationError("Credibility change must be a non-zero number.");
    }

    const updated = await prisma.user
      .update({
        where: { id: userId },
        data: {
          credibilityScore: {
            increment: delta,
          },
        },
      })
      .catch((error: unknown) => {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          throw new NotFoundError("Solver account not found.");
        }
        throw error;
      });

    const clamped = Math.min(10, Math.max(0, updated.credibilityScore));
    if (clamped === updated.credibilityScore) return updated;

    return prisma.user.update({
      where: { id: userId },
      data: { credibilityScore: clamped },
    });
  }
}
