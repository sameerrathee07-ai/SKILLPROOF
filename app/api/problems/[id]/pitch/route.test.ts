import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { PitchService } from "@/lib/services/pitch.service";

const { getRequestUserMock } = vi.hoisted(() => ({
  getRequestUserMock: vi.fn(),
}));

vi.mock("@/lib/services/pitch.service", () => ({
  PitchService: {
    submitAndEvaluate: vi.fn(),
  },
}));

vi.mock("@/lib/auth/request-user", () => ({
  getRequestUser: getRequestUserMock,
}));

const mockSubmit = vi.mocked(PitchService.submitAndEvaluate);

const validPitchInput = {
  step1Diagnosis:
    "Root cause is operational latency in attendance feedback loops. Paper registers create a 4-day blind spot where consecutive absences go unnoticed.",
  step2Solution:
    "A progressive web app (PWA) for faculty with quick batch tap-marking and automated webhook triggers.",
  step2Deliverables:
    "1. Mobile-first Faculty Attendance PWA. 2. Counselor Triage Dashboard. 3. Automated WhatsApp Cloud API webhook.",
  step2Milestones:
    "Sprint 1: Schema and PWA UI. Sprint 2: Webhooks and dashboard. Sprint 3: Pilot test and handover.",
  step3Alternatives: [
    {
      name: "Biometric Hardware Terminals",
      pros: "Fully automated without faculty intervention.",
      cons: "High initial hardware cost and long hallway queues.",
      rejectionReason: "Prohibitive setup expense and hallway bottleneck delays.",
    },
    {
      name: "Commercial Off-the-Shelf ERP",
      pros: "Feature-rich platform available immediately.",
      cons: "Expensive recurring per-student subscription fees.",
      rejectionReason: "Vendor lock-in and high recurring monthly expense.",
    },
  ],
  step4Budget:
    "Total Project Cost: ₹24,000 INR (Milestone 1: ₹8,000; Milestone 2: ₹10,000; Milestone 3: ₹6,000).",
  step4CostBreakdown:
    "Hosting on Vercel and Supabase free tier with WhatsApp Cloud API free tier.",
  step5Experience:
    "Built and deployed an attendance tracking portal for my university IEEE student branch (350 active members).",
  step5ProofLinks:
    "https://github.com/example/attendance-demo",
  step5Constraints:
    "Faculty have variable digital literacy, so attendance interface requires large touch buttons.",
};

const makeRequest = (body: unknown, problemId = "prob-123") =>
  POST(
    new Request(`http://localhost/api/problems/${problemId}/pitch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    { params: { id: problemId } }
  );

describe("POST /api/problems/[id]/pitch API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRequestUserMock.mockResolvedValue({ id: "solver-1", role: "SOLVER" });
  });

  it("accepts a valid pitch submission, passes to service, and returns 201", async () => {
    mockSubmit.mockResolvedValue({
      pitchId: "pitch-999",
      evaluation: { overallScore: 8.5, passed: true, knockedOut: false } as any,
      solver: { id: "solver-1" } as any,
      pitch: { id: "pitch-999" } as any,
      tokensRemaining: 44,
    });

    const res = await makeRequest({
      pitchInput: validPitchInput,
      solverId: "spoofed-solver",
      revisionCount: 0,
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.pitchId).toBe("pitch-999");
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({
      problemId: "prob-123",
      pitchInput: expect.objectContaining({
        step1Diagnosis: validPitchInput.step1Diagnosis,
      }),
      solverId: "solver-1",
      revisionCount: 0,
    });
  });

  it("rejects a request without a session with 401", async () => {
    getRequestUserMock.mockResolvedValue(null);

    const res = await makeRequest({ pitchInput: validPitchInput });

    expect(res.status).toBe(401);
    expect((await res.json()).code).toBe("UNAUTHORIZED");
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("rejects empty submission with 400 and does NOT call scoring service", async () => {
    const res = await makeRequest({
      pitchInput: {},
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(body.details).toBeDefined();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("rejects keyboard-mash text ('asdfgh') with 400 and specific error message", async () => {
    const res = await makeRequest({
      pitchInput: {
        ...validPitchInput,
        step1Diagnosis: "asdfgh operational issues in the process",
      },
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(body.error).toContain("keyboard-mash");
    expect(body.details["step1Diagnosis"]).toContain("keyboard-mash");
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("rejects placeholder junk ('test', 'idk', 'n/a') with 400", async () => {
    const res = await makeRequest({
      pitchInput: {
        ...validPitchInput,
        step4Budget: "idk",
      },
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(body.details["step4Budget"]).toBeDefined();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("rejects repeated characters ('aaaa') with 400", async () => {
    const res = await makeRequest({
      pitchInput: {
        ...validPitchInput,
        step2Solution: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      },
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(body.details["step2Solution"]).toContain("repetitive characters");
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("rejects lorem ipsum placeholder with 400", async () => {
    const res = await makeRequest({
      pitchInput: {
        ...validPitchInput,
        step5Experience: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      },
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(body.details["step5Experience"]).toContain("lorem ipsum");
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("rejects single characters and short one-word answers with 400", async () => {
    const res = await makeRequest({
      pitchInput: {
        ...validPitchInput,
        step1Diagnosis: "x",
      },
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(body.details["step1Diagnosis"]).toContain("at least 20 characters");
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});
