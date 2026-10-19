import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NotFoundError } from "@/lib/api/errors";

const { getVettedInboxMock, getSessionUserMock } = vi.hoisted(() => ({
  getVettedInboxMock: vi.fn(),
  getSessionUserMock: vi.fn(),
}));

vi.mock("@/lib/services/pitch.service", () => ({
  PitchService: { getVettedInbox: getVettedInboxMock },
}));

vi.mock("@/lib/auth/session", () => ({
  getSessionUser: getSessionUserMock,
}));

const makeRequest = (problemId = "prob-1") =>
  new Request(`http://localhost/api/org/problems/${problemId}/proposals`);

const makeContext = (problemId = "prob-1") => ({ params: { id: problemId } });

describe("GET /api/org/problems/[id]/proposals API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without a session", async () => {
    getSessionUserMock.mockResolvedValue(null);

    const res = await GET(makeRequest(), makeContext());

    expect(res.status).toBe(401);
    expect(getVettedInboxMock).not.toHaveBeenCalled();
  });

  it("passes the session user to the service and returns the inbox", async () => {
    getSessionUserMock.mockResolvedValue({ id: "poster-1", role: "POSTER" });
    getVettedInboxMock.mockResolvedValue({ vettedCount: 0 });

    const res = await GET(makeRequest(), makeContext());

    expect(res.status).toBe(200);
    expect(getVettedInboxMock).toHaveBeenCalledWith("prob-1", { id: "poster-1", role: "POSTER" });
    expect(await res.json()).toEqual({ vettedCount: 0 });
  });

  it("returns 404 when the service hides the problem", async () => {
    getSessionUserMock.mockResolvedValue({ id: "poster-2", role: "POSTER" });
    getVettedInboxMock.mockRejectedValue(new NotFoundError(`Problem with id "prob-1" not found.`));

    const res = await GET(makeRequest(), makeContext());

    expect(res.status).toBe(404);
  });
});
