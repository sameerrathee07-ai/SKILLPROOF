import { describe, it, expect, vi, beforeEach } from "vitest";
import { PitchService } from "@/lib/services/pitch.service";
import { ValidationError, NotFoundError } from "@/lib/api/errors";

const { prismaMock, userServiceMock, evaluatePitchMock } = vi.hoisted(() => ({
  prismaMock: {
    problem: { findUnique: vi.fn() },
    pitch: { create: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn() },
  },
  userServiceMock: {
    getOrCreateDefaultSolver: vi.fn(),
    rewardSolverCredibility: vi.fn(),
  },
  evaluatePitchMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));
vi.mock("@/lib/scoring/engine", () => ({ evaluatePitch: evaluatePitchMock }));
vi.mock("./user.service", () => ({ UserService: userServiceMock }));

const pitchInput = {
  problemStatement: "Students can't track progress",
  proposedSolution: "A dashboard",
  keyAssumptions: ["Assumption"],
  targetMarket: "Coaching students",
  competitiveAdvantage: "Simple",
  revenueModel: "SaaS",
  risks: ["Risk"],
} as any;

describe("PitchService", () => {
  beforeEach(() => {
    prismaMock.problem.findUnique.mockReset();
    prismaMock.pitch.create.mockReset();
    prismaMock.pitch.findUnique.mockReset();
    prismaMock.pitch.findMany.mockReset();
    prismaMock.pitch.count.mockReset();
    userServiceMock.getOrCreateDefaultSolver.mockReset();
    userServiceMock.rewardSolverCredibility.mockReset();
    evaluatePitchMock.mockReset();
  });

  describe("submitAndEvaluate", () => {
    it("throws ValidationError when pitch input is missing", async () => {
      await expect(
        PitchService.submitAndEvaluate({ problemId: "p1" } as any)
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it("throws ValidationError when problemId is missing", async () => {
      await expect(
        PitchService.submitAndEvaluate({ pitchInput } as any)
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it("throws NotFoundError when problem does not exist", async () => {
      prismaMock.problem.findUnique.mockResolvedValue(null);
      await expect(
        PitchService.submitAndEvaluate({ problemId: "missing", pitchInput })
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("persists a pitch and rewards solver when quality gate passes", async () => {
      prismaMock.problem.findUnique.mockResolvedValue({ id: "p1" });
      userServiceMock.getOrCreateDefaultSolver.mockResolvedValue({ id: "solver-1" });
      evaluatePitchMock.mockReturnValue({ overallScore: 85, passed: true, knockedOut: false });
      prismaMock.pitch.create.mockResolvedValue({ id: "pitch-1" });
      userServiceMock.rewardSolverCredibility.mockResolvedValue({ id: "solver-1", credibilityScore: 1.1 });

      const result = await PitchService.submitAndEvaluate({
        problemId: "p1",
        solverId: "solver-1",
        pitchInput,
        revisionCount: "2",
      });

      expect(prismaMock.pitch.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          problemId: "p1",
          solverId: "solver-1",
          score: 85,
          passed: true,
          knockedOut: false,
          revisionCount: 2,
        }),
      });
      expect(userServiceMock.rewardSolverCredibility).toHaveBeenCalledWith("solver-1", 0.1);
      expect(result.pitchId).toBe("pitch-1");
      expect(result.solver).toEqual({ id: "solver-1", credibilityScore: 1.1 });
    });

    it("does not reward solver when quality gate does not pass", async () => {
      prismaMock.problem.findUnique.mockResolvedValue({ id: "p1" });
      userServiceMock.getOrCreateDefaultSolver.mockResolvedValue({ id: "solver-1" });
      evaluatePitchMock.mockReturnValue({ overallScore: 40, passed: false, knockedOut: true });
      prismaMock.pitch.create.mockResolvedValue({ id: "pitch-2" });

      await PitchService.submitAndEvaluate({ problemId: "p1", pitchInput });

      expect(userServiceMock.rewardSolverCredibility).not.toHaveBeenCalled();
    });

    it("defaults revisionCount to 0 when not provided", async () => {
      prismaMock.problem.findUnique.mockResolvedValue({ id: "p1" });
      userServiceMock.getOrCreateDefaultSolver.mockResolvedValue({ id: "solver-1" });
      evaluatePitchMock.mockReturnValue({ overallScore: 50, passed: false, knockedOut: false });
      prismaMock.pitch.create.mockResolvedValue({ id: "pitch-3" });

      await PitchService.submitAndEvaluate({ problemId: "p1", pitchInput });

      expect(prismaMock.pitch.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ revisionCount: 0 }),
      });
    });
  });

  describe("getPitchById", () => {
    it("throws NotFoundError for a missing pitch", async () => {
      prismaMock.pitch.findUnique.mockResolvedValue(null);
      await expect(PitchService.getPitchById("missing")).rejects.toBeInstanceOf(NotFoundError);
    });

    it("returns the pitch with parsed JSON fields", async () => {
      prismaMock.pitch.findUnique.mockResolvedValue({
        id: "pitch-1",
        stepData: JSON.stringify({ problemStatement: "x" }),
        scoreBreakdown: JSON.stringify({ overallScore: 85 }),
      });

      const result = await PitchService.getPitchById("pitch-1");

      expect(result.stepDataParsed).toEqual({ problemStatement: "x" });
      expect(result.scoreBreakdownParsed).toEqual({ overallScore: 85 });
    });

    it("falls back to null when JSON fields are malformed", async () => {
      prismaMock.pitch.findUnique.mockResolvedValue({
        id: "pitch-1",
        stepData: "{bad json",
        scoreBreakdown: "{also bad",
      });

      const result = await PitchService.getPitchById("pitch-1");

      expect(result.stepDataParsed).toBeNull();
      expect(result.scoreBreakdownParsed).toBeNull();
    });
  });

  describe("getVettedInbox", () => {
    it("throws NotFoundError when problem does not exist", async () => {
      prismaMock.problem.findUnique.mockResolvedValue(null);
      await expect(PitchService.getVettedInbox("missing")).rejects.toBeInstanceOf(NotFoundError);
    });

    it("returns vetted proposals and blocked noise count", async () => {
      prismaMock.problem.findUnique.mockResolvedValue({ id: "p1", organization: { id: "o1" } });
      prismaMock.pitch.findMany.mockResolvedValue([
        {
          id: "pitch-1",
          stepData: JSON.stringify({ problemStatement: "x" }),
          scoreBreakdown: JSON.stringify({ overallScore: 85 }),
        },
      ]);
      prismaMock.pitch.count.mockResolvedValue(3);

      const result = await PitchService.getVettedInbox("p1");

      expect(prismaMock.pitch.findMany).toHaveBeenCalledWith({
        where: { problemId: "p1", passed: true },
        include: { solver: true },
        orderBy: { score: "desc" },
      });
      expect(result.totalSubmissions).toBe(3);
      expect(result.blockedNoise).toBe(2);
      expect(result.vettedCount).toBe(1);
      expect(result.proposals[0].stepDataParsed).toEqual({ problemStatement: "x" });
    });

    it("parses malformed pitch JSON safely", async () => {
      prismaMock.problem.findUnique.mockResolvedValue({ id: "p1" });
      prismaMock.pitch.findMany.mockResolvedValue([
        { id: "pitch-1", stepData: "{bad", scoreBreakdown: "{also bad" },
      ]);
      prismaMock.pitch.count.mockResolvedValue(1);

      const result = await PitchService.getVettedInbox("p1");

      expect(result.proposals[0].stepDataParsed).toBeNull();
      expect(result.proposals[0].scoreBreakdownParsed).toBeNull();
    });
  });
});