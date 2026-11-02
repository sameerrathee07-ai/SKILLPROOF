import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService } from "@/lib/services/user.service";
import { NotFoundError, ValidationError } from "@/lib/api/errors";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));

const reset = () => {
  prismaMock.user.findMany.mockReset();
  prismaMock.user.findUnique.mockReset();
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

  describe("getSolver", () => {
    it("returns the requested solver", async () => {
      const existing = { id: "solver-1", role: "SOLVER" };
      prismaMock.user.findUnique.mockResolvedValue(existing);
      await expect(UserService.getSolver("solver-1")).resolves.toEqual(existing);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: "solver-1" } });
    });

    it("throws when no solverId is provided", async () => {
      await expect(UserService.getSolver("")).rejects.toBeInstanceOf(ValidationError);
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    });

    it("throws when the solver does not exist", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(UserService.getSolver("missing")).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  it("adjusts credibility by increment", async () => {
    const updated = { id: "solver-1", credibilityScore: 1.1 };
    prismaMock.user.update.mockResolvedValue(updated);
    await expect(UserService.adjustSolverCredibility("solver-1", 0.1)).resolves.toEqual(updated);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "solver-1" },
      data: { credibilityScore: { increment: 0.1 } },
    });
    expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
  });

  it("supports a negative credibility adjustment", async () => {
    const updated = { id: "solver-1", credibilityScore: 0.9 };
    prismaMock.user.update.mockResolvedValue(updated);
    await expect(UserService.adjustSolverCredibility("solver-1", -0.1)).resolves.toEqual(updated);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "solver-1" },
      data: { credibilityScore: { increment: -0.1 } },
    });
  });

  it("clamps credibility at 10", async () => {
    prismaMock.user.update
      .mockResolvedValueOnce({ id: "solver-1", credibilityScore: 10.2 })
      .mockResolvedValueOnce({ id: "solver-1", credibilityScore: 10 });

    await expect(UserService.adjustSolverCredibility("solver-1", 0.5)).resolves.toEqual({
      id: "solver-1",
      credibilityScore: 10,
    });
    expect(prismaMock.user.update).toHaveBeenNthCalledWith(2, {
      where: { id: "solver-1" },
      data: { credibilityScore: 10 },
    });
  });

  it("clamps credibility at 0", async () => {
    prismaMock.user.update
      .mockResolvedValueOnce({ id: "solver-1", credibilityScore: -0.2 })
      .mockResolvedValueOnce({ id: "solver-1", credibilityScore: 0 });

    await expect(UserService.adjustSolverCredibility("solver-1", -0.5)).resolves.toEqual({
      id: "solver-1",
      credibilityScore: 0,
    });
    expect(prismaMock.user.update).toHaveBeenNthCalledWith(2, {
      where: { id: "solver-1" },
      data: { credibilityScore: 0 },
    });
  });

  it("rejects a zero or non-finite credibility change", async () => {
    await expect(UserService.adjustSolverCredibility("solver-1", 0)).rejects.toBeInstanceOf(
      ValidationError
    );
    await expect(
      UserService.adjustSolverCredibility("solver-1", Number.NaN)
    ).rejects.toBeInstanceOf(ValidationError);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });
});