import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProblemService } from "@/lib/services/problem.service";
import { ValidationError, NotFoundError } from "@/lib/api/errors";

const { prismaMock, organizationServiceMock } = vi.hoisted(() => ({
  prismaMock: {
    problem: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), count: vi.fn() },
    organization: { count: vi.fn() },
    pitch: { count: vi.fn() },
  },
  organizationServiceMock: {
    findOrCreateOrganization: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));
vi.mock("./organization.service", () => ({ OrganizationService: organizationServiceMock }));

describe("ProblemService", () => {
  beforeEach(() => {
    prismaMock.problem.findMany.mockReset();
    prismaMock.problem.findUnique.mockReset();
    prismaMock.problem.create.mockReset();
    prismaMock.problem.count.mockReset();
    prismaMock.organization.count.mockReset();
    prismaMock.pitch.count.mockReset();
    organizationServiceMock.findOrCreateOrganization.mockReset();
  });

  describe("listProblems", () => {
    it("lists problems with no filters and aggregates pitch counts", async () => {
      prismaMock.problem.findMany.mockResolvedValue([
        {
          id: "p1",
          pitches: [
            { passed: true },
            { passed: false },
          ],
        },
      ]);

      const result = await ProblemService.listProblems();

      expect(prismaMock.problem.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.objectContaining({ organization: true }),
        orderBy: { createdAt: "desc" },
      });
      expect(result[0].totalPitches).toBe(2);
      expect(result[0].vettedPitches).toBe(1);
    });

    it("applies category filter", async () => {
      prismaMock.problem.findMany.mockResolvedValue([]);
      await ProblemService.listProblems({ category: "GRADING" });
      expect(prismaMock.problem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { frictionCategory: "GRADING" } })
      );
    });

    it("ignores the ALL category, treating it as no filter", async () => {
      prismaMock.problem.findMany.mockResolvedValue([]);
      await ProblemService.listProblems({ category: "ALL" });
      expect(prismaMock.problem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} })
      );
    });

    it("applies organizationId filter", async () => {
      prismaMock.problem.findMany.mockResolvedValue([]);
      await ProblemService.listProblems({ organizationId: "o1" });
      expect(prismaMock.problem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { organizationId: "o1" } })
      );
    });
  });

  describe("getProblemById", () => {
    it("returns problem with pitch stats", async () => {
      prismaMock.problem.findUnique.mockResolvedValue({
        id: "p1",
        pitches: [{ passed: true }],
      });
      const result = await ProblemService.getProblemById("p1");
      expect(result.totalPitches).toBe(1);
      expect(result.vettedPitches).toBe(1);
    });

    it("throws NotFoundError when missing", async () => {
      prismaMock.problem.findUnique.mockResolvedValue(null);
      await expect(ProblemService.getProblemById("missing")).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe("createProblem", () => {
    it("throws ValidationError for missing title", async () => {
      await expect(
        ProblemService.createProblem({ title: "  ", description: "d", frictionCategory: "c" } as any)
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it("throws ValidationError for missing description", async () => {
      await expect(
        ProblemService.createProblem({ title: "t", description: "", frictionCategory: "c" } as any)
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it("throws ValidationError for missing friction category", async () => {
      await expect(
        ProblemService.createProblem({ title: "t", description: "d", frictionCategory: " " } as any)
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it("creates a problem with an explicit organizationId", async () => {
      prismaMock.problem.create.mockResolvedValue({ id: "p1" });
      const result = await ProblemService.createProblem({
        title: "  Title ",
        description: " Description ",
        frictionCategory: " Grading ",
        organizationId: "o1",
      });
      expect(prismaMock.problem.create).toHaveBeenCalledWith({
        data: {
          title: "Title",
          description: "Description",
          frictionCategory: "Grading",
          organizationId: "o1",
          status: "OPEN",
        },
        include: { organization: true },
      });
      expect(result).toEqual({ id: "p1" });
      expect(organizationServiceMock.findOrCreateOrganization).not.toHaveBeenCalled();
    });

    it("creates or finds a fallback organization when none provided", async () => {
      organizationServiceMock.findOrCreateOrganization.mockResolvedValue({ id: "o2" });
      prismaMock.problem.create.mockResolvedValue({ id: "p2" });

      await ProblemService.createProblem({
        title: "Title",
        description: "Description",
        frictionCategory: "Grading",
      });

      expect(organizationServiceMock.findOrCreateOrganization).toHaveBeenCalledWith({
        name: "Premier Education Center",
        type: "COACHING_CENTER",
      });
      expect(prismaMock.problem.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ organizationId: "o2" }) })
      );
    });

    it("uses provided org name and type as fallback", async () => {
      organizationServiceMock.findOrCreateOrganization.mockResolvedValue({ id: "o3" });
      prismaMock.problem.create.mockResolvedValue({ id: "p3" });

      await ProblemService.createProblem({
        title: "Title",
        description: "Description",
        frictionCategory: "Grading",
        orgName: "Acme",
        orgType: "COLLEGE_DEPT",
      });

      expect(organizationServiceMock.findOrCreateOrganization).toHaveBeenCalledWith({
        name: "Acme",
        type: "COLLEGE_DEPT",
      });
    });
  });

  describe("getPlatformStats", () => {
    it("returns aggregated platform counts", async () => {
      prismaMock.problem.count.mockResolvedValue(10);
      prismaMock.organization.count.mockResolvedValue(3);
      prismaMock.pitch.count.mockResolvedValueOnce(50).mockResolvedValueOnce(20);

      const result = await ProblemService.getPlatformStats();

      expect(result).toEqual({
        problemCount: 10,
        orgCount: 3,
        pitchCount: 50,
        vettedPitchCount: 20,
      });
      expect(prismaMock.pitch.count).toHaveBeenCalledWith({ where: { passed: true } });
    });
  });

  describe("getRecentProblems", () => {
    it("returns recent problems with default limit", async () => {
      prismaMock.problem.findMany.mockResolvedValue([{ id: "p1" }]);
      const result = await ProblemService.getRecentProblems();
      expect(prismaMock.problem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 3 })
      );
      expect(result).toEqual([{ id: "p1" }]);
    });

    it("respects a custom limit", async () => {
      prismaMock.problem.findMany.mockResolvedValue([]);
      await ProblemService.getRecentProblems(5);
      expect(prismaMock.problem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 })
      );
    });
  });
});