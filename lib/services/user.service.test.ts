import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService } from "@/lib/services/user.service";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));

const reset = () => {
  prismaMock.user.findMany.mockReset();
  prismaMock.user.findUnique.mockReset();
  prismaMock.user.findFirst.mockReset();
  prismaMock.user.create.mockReset();
  prismaMock.user.update.mockReset();
};

describe("UserService", () => {
  beforeEach(reset);

  it("lists users ordered by credibility", async () => {
    prismaMock.user.findMany.mockResolvedValue([{ id: "u1" }]);
    await expect(UserService.listUsers()).resolves.toEqual([{ id: "u1" }]);
    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      orderBy: { credibilityScore: "desc" },
    });
  });

  describe("getOrCreateDefaultSolver", () => {
    it("returns the solverId lookup when found", async () => {
      const existing = { id: "solver-1", role: "SOLVER" };
      prismaMock.user.findUnique.mockResolvedValue(existing);
      await expect(UserService.getOrCreateDefaultSolver("solver-1")).resolves.toEqual(existing);
      expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
    });

    it("falls back to the first SOLVER when solverId is missing or not found", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const fallback = { id: "solver-2", role: "SOLVER" };
      prismaMock.user.findFirst.mockResolvedValue(fallback);

      await expect(UserService.getOrCreateDefaultSolver("missing")).resolves.toEqual(fallback);
      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({ where: { role: "SOLVER" } });
    });

    it("creates a default solver when none exists", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.findFirst.mockResolvedValue(null);
      const created = { id: "solver-3", role: "SOLVER" };
      prismaMock.user.create.mockResolvedValue(created);

      await expect(UserService.getOrCreateDefaultSolver(undefined)).resolves.toEqual(created);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: "student.solver@skillproof.dev",
          role: "SOLVER",
        }),
      });
    });
  });

  it("rewards solver credibility by increment", async () => {
    const updated = { id: "solver-1", credibilityScore: 1.1 };
    prismaMock.user.update.mockResolvedValue(updated);
    await expect(UserService.rewardSolverCredibility("solver-1", 0.1)).resolves.toEqual(updated);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "solver-1" },
      data: { credibilityScore: { increment: 0.1 } },
    });
  });
});