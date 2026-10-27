import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "./route";
import { PitchService } from "@/lib/services/pitch.service";
import { NotFoundError, ValidationError } from "@/lib/api/errors";

const { getRequestUserMock } = vi.hoisted(() => ({
  getRequestUserMock: vi.fn(),
}));

vi.mock("@/lib/services/pitch.service", () => ({
  PitchService: { updateProposalStatus: vi.fn() },
}));

vi.mock("@/lib/auth/request-user", () => ({
  getRequestUser: getRequestUserMock,
}));

const mockUpdate = vi.mocked(PitchService.updateProposalStatus);

const patch = (body: string, problemId = "pitch-1") =>
  PATCH(
    new Request(`http://localhost/api/proposals/${problemId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body,
    }),
    { params: { id: problemId } }
  );

describe("PATCH /api/proposals/[id]/status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRequestUserMock.mockResolvedValue({ id: "poster-1", role: "POSTER" });
  });

  it("returns 401 when there is no session", async () => {
    getRequestUserMock.mockResolvedValue(null);

    const res = await patch(JSON.stringify({ status: "SHORTLISTED" }));

    expect(res.status).toBe(401);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns 400 when the status is missing", async () => {
    const res = await patch(JSON.stringify({ posterNotes: "notes only" }));

    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("VALIDATION_ERROR");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns 400 rather than 500 for a malformed body", async () => {
    const res = await patch("{not json");

    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("VALIDATION_ERROR");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("passes the proposal id, status, and notes to the service", async () => {
    mockUpdate.mockResolvedValue({ id: "pitch-1", status: "SHORTLISTED" } as any);

    const res = await patch(
      JSON.stringify({ status: "SHORTLISTED", posterNotes: "Strong work." })
    );

    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      "pitch-1",
      { id: "poster-1", role: "POSTER" },
      "SHORTLISTED",
      "Strong work."
    );
  });

  it("ignores a non-string poster notes value", async () => {
    mockUpdate.mockResolvedValue({ id: "pitch-1", status: "ACCEPTED" } as any);

    await patch(JSON.stringify({ status: "ACCEPTED", posterNotes: 42 }));

    expect(mockUpdate).toHaveBeenCalledWith(
      "pitch-1",
      { id: "poster-1", role: "POSTER" },
      "ACCEPTED",
      undefined
    );
  });

  it("returns 404 when the service rejects the caller", async () => {
    mockUpdate.mockRejectedValue(new NotFoundError("Proposal not found."));

    const res = await patch(JSON.stringify({ status: "SHORTLISTED" }));

    expect(res.status).toBe(404);
  });

  it("returns 400 for an illegal transition", async () => {
    mockUpdate.mockRejectedValue(new ValidationError("Cannot move a proposal from DECLINED to ACCEPTED."));

    const res = await patch(JSON.stringify({ status: "ACCEPTED" }));

    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("DECLINED");
  });

  it("never returns the solver email for a SUBMITTED proposal", async () => {
    mockUpdate.mockResolvedValue({
      id: "pitch-1",
      status: "SUBMITTED",
      solver: { id: "solver-1", email: null },
    } as any);

    const res = await patch(JSON.stringify({ status: "SUBMITTED" }));
    const data = await res.json();

    expect(data.solver.email).toBeNull();
  });
});
