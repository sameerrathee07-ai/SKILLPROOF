import { describe, it, expect, vi, beforeEach } from "vitest";
import { PitchService } from "@/lib/services/pitch.service";
import { ValidationError, NotFoundError } from "@/lib/api/errors";

const { prismaMock, userServiceMock, evaluatePitchMock } = vi.hoisted(() => ({
  prismaMock: {
    problem: { findUnique: vi.fn() },
    pitch: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    user: { updateMany: vi.fn(), update: vi.fn(), findUnique: vi.fn() },
  },
  userServiceMock: {
    getSolver: vi.fn(),
    rewardSolverCredibility: vi.fn(),
  },
  evaluatePitchMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));
vi.mock("@/lib/scoring/engine", () => ({ evaluatePitch: evaluatePitchMock }));
vi.mock("./user.service", () => ({ UserService: userServiceMock }));
vi.mock("@/lib/email/service", () => ({
  sendGateEvaluationResult: vi.fn(),
  sendNewVettedProposalAlert: vi.fn(),
  sendProposalStatusUpdate: vi.fn(),
}));

const pitchInput = {
  step1Diagnosis:
    "Root cause is manual attendance tracking causing delayed feedback and student dropout. The systemic friction lies in paper registers and the lack of real-time alerts.",
  step2Solution:
    "Build a PWA dashboard with webhook automation and WhatsApp notifications, backed by a database schema and admin dashboard.",
  step2Deliverables:
    "Faculty attendance PWA, counselor dashboard, WhatsApp webhook service, CSV export.",
  step2Milestones:
    "Sprint 1: schema and auth. Sprint 2: webhook worker and dashboard. Sprint 3: pilot and deploy.",
  step3Alternatives: [
    {
      name: "Biometric terminals",
      pros: "automated",
      cons: "expensive hardware and long queues",
      rejectionReason: "prohibitive setup cost",
    },
    {
      name: "Off-the-shelf ERP",
      pros: "immediate",
      cons: "expensive recurring fees and vendor lock-in",
      rejectionReason: "too costly",
    },
  ],
  step4Budget: "₹24,000 INR across three milestones.",
  step4CostBreakdown: "Hosting free tier, WhatsApp API free tier.",
  step5Experience: "Built attendance portal for 350 members. Proficient in Next.js and Node.js.",
  step5ProofLinks: "https://github.com/aryan-dev/demo",
  step5Constraints: "Faculty have variable digital literacy; handle offline caching and privacy.",
} as any;

describe("PitchService", () => {
  beforeEach(() => {
    prismaMock.problem.findUnique.mockReset();
    prismaMock.pitch.create.mockReset();
    prismaMock.pitch.update.mockReset();
    prismaMock.pitch.findUnique.mockReset();
    prismaMock.pitch.findMany.mockReset();
    prismaMock.pitch.count.mockReset();
    prismaMock.user.updateMany.mockReset();
    prismaMock.user.update.mockReset();
    prismaMock.user.findUnique.mockReset();
    userServiceMock.getSolver.mockReset();
    userServiceMock.rewardSolverCredibility.mockReset();
    evaluatePitchMock.mockReset();
  });

  describe("submitAndEvaluate", () => {
    it("throws ValidationError when pitch input is missing", async () => {
      await expect(
        PitchService.submitAndEvaluate({ problemId: "p1" } as any)
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it("throws ValidationError when pitch input is garbage", async () => {
      const garbageInput = {
        step1Diagnosis: "asdfgh",
        step2Solution: "broken",
        step3Alternatives: [],
        step4Budget: "test",
        step5Experience: "idk",
      };
      await expect(
        PitchService.submitAndEvaluate({ problemId: "p1", solverId: "solver-1", pitchInput: garbageInput as any })
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
        PitchService.submitAndEvaluate({ problemId: "missing", solverId: "solver-1", pitchInput })
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("persists a pitch and rewards solver when quality gate passes", async () => {
      prismaMock.problem.findUnique.mockResolvedValue({ id: "p1" });
      userServiceMock.getSolver.mockResolvedValue({ id: "solver-1" });
      prismaMock.user.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.user.findUnique.mockResolvedValue({ tokens: 44 });
      evaluatePitchMock.mockReturnValue({ overallScore: 85, passed: true, knockedOut: false });
      prismaMock.pitch.create.mockResolvedValue({ id: "pitch-1" });
      userServiceMock.rewardSolverCredibility.mockResolvedValue({ id: "solver-1", credibilityScore: 1.1 });

      const result = await PitchService.submitAndEvaluate({
        problemId: "p1",
        solverId: "solver-1",
        pitchInput,
        revisionCount: 2,
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
      userServiceMock.getSolver.mockResolvedValue({ id: "solver-1" });
      prismaMock.user.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.user.findUnique.mockResolvedValue({ tokens: 44 });
      evaluatePitchMock.mockReturnValue({ overallScore: 40, passed: false, knockedOut: true });
      prismaMock.pitch.create.mockResolvedValue({ id: "pitch-2" });

      await PitchService.submitAndEvaluate({ problemId: "p1", solverId: "solver-1", pitchInput });

      expect(userServiceMock.rewardSolverCredibility).not.toHaveBeenCalled();
    });

    it("defaults revisionCount to 0 when not provided", async () => {
      prismaMock.problem.findUnique.mockResolvedValue({ id: "p1" });
      userServiceMock.getSolver.mockResolvedValue({ id: "solver-1" });
      prismaMock.user.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.user.findUnique.mockResolvedValue({ tokens: 44 });
      evaluatePitchMock.mockReturnValue({ overallScore: 50, passed: false, knockedOut: false });
      prismaMock.pitch.create.mockResolvedValue({ id: "pitch-3" });

      await PitchService.submitAndEvaluate({ problemId: "p1", solverId: "solver-1", pitchInput });

      expect(prismaMock.pitch.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ revisionCount: 0 }),
      });
    });

    it("deducts one token before evaluating and returns the remaining balance", async () => {
      prismaMock.problem.findUnique.mockResolvedValue({ id: "p1" });
      userServiceMock.getSolver.mockResolvedValue({ id: "solver-1" });
      prismaMock.user.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.user.findUnique.mockResolvedValue({ tokens: 44 });
      evaluatePitchMock.mockReturnValue({ overallScore: 85, passed: true, knockedOut: false });
      prismaMock.pitch.create.mockResolvedValue({ id: "pitch-1" });
      userServiceMock.rewardSolverCredibility.mockResolvedValue({ id: "solver-1", credibilityScore: 1.1 });

      const result = await PitchService.submitAndEvaluate({
        problemId: "p1",
        solverId: "solver-1",
        pitchInput,
      });

      expect(prismaMock.user.updateMany).toHaveBeenCalledWith({
        where: { id: "solver-1", tokens: { gte: 1 } },
        data: { tokens: { decrement: 1 } },
      });
      expect(prismaMock.user.updateMany.mock.invocationCallOrder[0]).toBeLessThan(
        evaluatePitchMock.mock.invocationCallOrder[0]
      );
      expect(result.tokensRemaining).toBe(44);
      expect(prismaMock.pitch.create).toHaveBeenCalledTimes(1);
    });

    it("throws ValidationError before the gate when the solver has no tokens", async () => {
      prismaMock.problem.findUnique.mockResolvedValue({ id: "p1" });
      userServiceMock.getSolver.mockResolvedValue({ id: "solver-1" });
      prismaMock.user.updateMany.mockResolvedValue({ count: 0 });
      evaluatePitchMock.mockReturnValue({ overallScore: 40, passed: false, knockedOut: false });
      prismaMock.pitch.create.mockResolvedValue({ id: "pitch-1" });

      await expect(
        PitchService.submitAndEvaluate({ problemId: "p1", solverId: "solver-1", pitchInput })
      ).rejects.toBeInstanceOf(ValidationError);

      expect(evaluatePitchMock).not.toHaveBeenCalled();
      expect(prismaMock.pitch.create).not.toHaveBeenCalled();
    });

    it("does not refund the token when the pitch passes", async () => {
      prismaMock.problem.findUnique.mockResolvedValue({ id: "p1" });
      userServiceMock.getSolver.mockResolvedValue({ id: "solver-1" });
      prismaMock.user.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.user.findUnique.mockResolvedValue({ tokens: 44 });
      evaluatePitchMock.mockReturnValue({ overallScore: 85, passed: true, knockedOut: false });
      prismaMock.pitch.create.mockResolvedValue({ id: "pitch-1" });
      userServiceMock.rewardSolverCredibility.mockResolvedValue({ id: "solver-1", credibilityScore: 1.1 });

      const result = await PitchService.submitAndEvaluate({
        problemId: "p1",
        solverId: "solver-1",
        pitchInput,
      });

      expect(prismaMock.user.updateMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { tokens: { decrement: 1 } } })
      );
      expect(result.tokensRemaining).toBe(44);
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
      prismaMock.problem.findUnique.mockResolvedValue({
        id: "p1",
        postedById: "poster-1",
        organization: { id: "o1" },
      });
      prismaMock.pitch.findMany.mockResolvedValue([
        {
          id: "pitch-1",
          stepData: JSON.stringify({ problemStatement: "x" }),
          scoreBreakdown: JSON.stringify({ overallScore: 85 }),
        },
      ]);
      prismaMock.pitch.count.mockResolvedValue(3);

      const result = await PitchService.getVettedInbox("p1", { id: "poster-1", role: "POSTER" });

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
      prismaMock.problem.findUnique.mockResolvedValue({ id: "p1", postedById: "poster-1" });
      prismaMock.pitch.findMany.mockResolvedValue([
        { id: "pitch-1", stepData: "{bad", scoreBreakdown: "{also bad" },
      ]);
      prismaMock.pitch.count.mockResolvedValue(1);

      const result = await PitchService.getVettedInbox("p1", { id: "poster-1", role: "POSTER" });

      expect(result.proposals[0].stepDataParsed).toBeNull();
      expect(result.proposals[0].scoreBreakdownParsed).toBeNull();
    });

    it("allows the poster who created the problem", async () => {
      prismaMock.problem.findUnique.mockResolvedValue({ id: "p1", postedById: "poster-1" });
      prismaMock.pitch.findMany.mockResolvedValue([]);
      prismaMock.pitch.count.mockResolvedValue(0);

      const result = await PitchService.getVettedInbox("p1", { id: "poster-1", role: "POSTER" });

      expect(result.vettedCount).toBe(0);
    });

    it("allows an admin on someone else's problem", async () => {
      prismaMock.problem.findUnique.mockResolvedValue({ id: "p1", postedById: "poster-1" });
      prismaMock.pitch.findMany.mockResolvedValue([]);
      prismaMock.pitch.count.mockResolvedValue(0);

      const result = await PitchService.getVettedInbox("p1", { id: "admin-1", role: "ADMIN" });

      expect(result.vettedCount).toBe(0);
    });

    it("hides the problem from a different poster", async () => {
      prismaMock.problem.findUnique.mockResolvedValue({ id: "p1", postedById: "poster-1" });

      await expect(
        PitchService.getVettedInbox("p1", { id: "poster-2", role: "POSTER" })
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("hides the problem from a solver", async () => {
      prismaMock.problem.findUnique.mockResolvedValue({ id: "p1", postedById: "poster-1" });

      await expect(
        PitchService.getVettedInbox("p1", { id: "solver-1", role: "SOLVER" })
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("allows an admin on a problem with no poster recorded", async () => {
      prismaMock.problem.findUnique.mockResolvedValue({ id: "p1", postedById: null });
      prismaMock.pitch.findMany.mockResolvedValue([]);
      prismaMock.pitch.count.mockResolvedValue(0);

      const result = await PitchService.getVettedInbox("p1", { id: "admin-1", role: "ADMIN" });

      expect(result.vettedCount).toBe(0);
    });

    it("hides the problem from a request without a session", async () => {
      prismaMock.problem.findUnique.mockResolvedValue({ id: "p1", postedById: "poster-1" });

      await expect(PitchService.getVettedInbox("p1")).rejects.toBeInstanceOf(NotFoundError);
    });

    it("allows the organization owner", async () => {
      prismaMock.problem.findUnique.mockResolvedValue({
        id: "p1",
        postedById: "poster-1",
        organization: { ownerId: "owner-1" },
      });
      prismaMock.pitch.findMany.mockResolvedValue([]);
      prismaMock.pitch.count.mockResolvedValue(0);

      const result = await PitchService.getVettedInbox("p1", {
        id: "owner-1",
        role: "POSTER",
      });

      expect(result.vettedCount).toBe(0);
    });
  });

  describe("idempotency", () => {
    it("returns the existing pitch for the same solver without charging tokens", async () => {
      prismaMock.problem.findUnique.mockResolvedValue({ id: "p1" });
      userServiceMock.getSolver.mockResolvedValue({ id: "solver-1", tokens: 44 });
      prismaMock.pitch.findUnique.mockResolvedValue({
        id: "pitch-existing",
        solverId: "solver-1",
        solver: { id: "solver-1", tokens: 44 },
        scoreBreakdown: JSON.stringify({ overallScore: 8, passed: true }),
        stepData: "{}",
      });

      const result = await PitchService.submitAndEvaluate({
        problemId: "p1",
        solverId: "solver-1",
        pitchInput,
        idempotencyKey: "key-1",
      });

      expect(result.idempotent).toBe(true);
      expect(result.pitchId).toBe("pitch-existing");
      expect(prismaMock.user.updateMany).not.toHaveBeenCalled();
      expect(prismaMock.pitch.create).not.toHaveBeenCalled();
    });

    it("rejects a key already used by another solver", async () => {
      prismaMock.problem.findUnique.mockResolvedValue({ id: "p1" });
      userServiceMock.getSolver.mockResolvedValue({ id: "solver-1", tokens: 44 });
      prismaMock.pitch.findUnique.mockResolvedValue({
        id: "pitch-existing",
        solverId: "solver-2",
        solver: { id: "solver-2", tokens: 44 },
        scoreBreakdown: "{}",
        stepData: "{}",
      });

      await expect(
        PitchService.submitAndEvaluate({
          problemId: "p1",
          solverId: "solver-1",
          pitchInput,
          idempotencyKey: "key-1",
        })
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it("refunds the token and returns the winner on a concurrent unique conflict", async () => {
      prismaMock.problem.findUnique.mockResolvedValue({ id: "p1" });
      userServiceMock.getSolver.mockResolvedValue({ id: "solver-1", tokens: 5 });
      prismaMock.pitch.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: "pitch-winner",
          solverId: "solver-1",
          solver: { id: "solver-1", tokens: 4 },
          scoreBreakdown: JSON.stringify({ overallScore: 8, passed: true }),
          stepData: "{}",
        });
      prismaMock.user.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.user.findUnique.mockResolvedValue({ tokens: 4 });
      evaluatePitchMock.mockReturnValue({ overallScore: 8, passed: true });
      prismaMock.pitch.create.mockRejectedValue({ code: "P2002" });
      prismaMock.user.update.mockResolvedValue({});

      const result = await PitchService.submitAndEvaluate({
        problemId: "p1",
        solverId: "solver-1",
        pitchInput,
        idempotencyKey: "key-1",
      });

      expect(result.idempotent).toBe(true);
      expect(result.pitchId).toBe("pitch-winner");
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: "solver-1" },
        data: { tokens: { increment: 1 } },
      });
    });
  });

  describe("updateProposalStatus", () => {
    it("rejects an unknown status before touching the database", async () => {
      await expect(
        PitchService.updateProposalStatus("pitch-1", { id: "poster-1", role: "POSTER" }, "BOGUS")
      ).rejects.toBeInstanceOf(ValidationError);

      expect(prismaMock.pitch.findUnique).not.toHaveBeenCalled();
    });

    it("hides a proposal from a different poster", async () => {
      prismaMock.pitch.findUnique.mockResolvedValue({
        id: "pitch-1",
        solver: { id: "solver-1" },
        problem: {
          postedById: "poster-1",
          organization: { ownerId: "owner-1" },
        },
      });

      await expect(
        PitchService.updateProposalStatus(
          "pitch-1",
          { id: "poster-2", role: "POSTER" },
          "SHORTLISTED"
        )
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("lets the organization owner update status and notes", async () => {
      prismaMock.pitch.findUnique.mockResolvedValue({
        id: "pitch-1",
        solver: { id: "solver-1", email: "solver@example.com" },
        problem: {
          postedById: "poster-1",
          organization: { ownerId: "owner-1" },
        },
      });
      prismaMock.pitch.update.mockResolvedValue({
        id: "pitch-1",
        status: "SHORTLISTED",
        posterNotes: "Strong proposal.",
        solver: { id: "solver-1", email: "solver@example.com", name: "Solver" },
        problem: { title: "Challenge", organization: { ownerId: "owner-1" } },
      });

      const result = await PitchService.updateProposalStatus(
        "pitch-1",
        { id: "owner-1", role: "POSTER" },
        "shortlisted",
        "Strong proposal."
      );

      expect(result.status).toBe("SHORTLISTED");
      expect(prismaMock.pitch.update).toHaveBeenCalledWith({
        where: { id: "pitch-1" },
        data: { status: "SHORTLISTED", posterNotes: "Strong proposal." },
        include: {
          solver: true,
          problem: { include: { organization: true } },
        },
      });
    });
  });
});