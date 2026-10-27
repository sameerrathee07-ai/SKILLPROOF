import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { PitchService } from "@/lib/services/pitch.service";
import { NotFoundError } from "@/lib/api/errors";

const { getRequestUserMock } = vi.hoisted(() => ({
  getRequestUserMock: vi.fn(),
}));

vi.mock("@/lib/services/pitch.service", () => ({
  PitchService: { getProposalForReview: vi.fn() },
}));

vi.mock("@/lib/auth/request-user", () => ({
  getRequestUser: getRequestUserMock,
}));

const mockGet = vi.mocked(PitchService.getProposalForReview);

const get = (proposalId = "pitch-1") =>
  GET(new Request(`http://localhost/api/proposals/${proposalId}`), {
    params: { id: proposalId },
  });

describe("GET /api/proposals/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRequestUserMock.mockResolvedValue({ id: "poster-1", role: "POSTER" });
  });

  it("returns 401 when there is no session", async () => {
    getRequestUserMock.mockResolvedValue(null);

    const res = await get();

    expect(res.status).toBe(401);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("returns the proposal for its owner", async () => {
    mockGet.mockResolvedValue({
      id: "pitch-1",
      status: "SUBMITTED",
      solver: { id: "solver-1", email: null },
    } as any);

    const res = await get();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.id).toBe("pitch-1");
    expect(mockGet).toHaveBeenCalledWith("pitch-1", {
      id: "poster-1",
      role: "POSTER",
    });
  });

  it("masks the solver email until the proposal is shortlisted", async () => {
    mockGet.mockResolvedValue({
      id: "pitch-1",
      status: "SUBMITTED",
      solver: { id: "solver-1", email: null },
    } as any);

    expect((await (await get()).json()).solver.email).toBeNull();
  });

  it("returns 404 instead of 403 for a non-owner", async () => {
    mockGet.mockRejectedValue(new NotFoundError("Proposal not found."));

    const res = await get();

    expect(res.status).toBe(404);
    expect((await res.json()).code).toBe("NOT_FOUND");
  });
});
