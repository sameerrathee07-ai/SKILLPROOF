import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "./route";

const { getRequestUserMock, adjustMock } = vi.hoisted(() => ({
  getRequestUserMock: vi.fn(),
  adjustMock: vi.fn(),
}));

vi.mock("@/lib/services/user.service", () => ({
  UserService: { adjustSolverCredibility: adjustMock },
}));

vi.mock("@/lib/auth/request-user", () => ({
  getRequestUser: getRequestUserMock,
}));

const patch = (body: string, userId = "user-1") =>
  PATCH(
    new Request(`http://localhost/api/admin/users/${userId}/credibility`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body,
    }),
    { params: { id: userId } }
  );

describe("PATCH /api/admin/users/[id]/credibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRequestUserMock.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
  });

  it("returns 401 when there is no session", async () => {
    getRequestUserMock.mockResolvedValue(null);

    const res = await patch(JSON.stringify({ delta: -0.5 }));

    expect(res.status).toBe(401);
    expect(adjustMock).not.toHaveBeenCalled();
  });

  it("returns 403 for a non-admin", async () => {
    getRequestUserMock.mockResolvedValue({ id: "solver-1", role: "SOLVER" });

    const res = await patch(JSON.stringify({ delta: -0.5 }));

    expect(res.status).toBe(403);
    expect(adjustMock).not.toHaveBeenCalled();
  });

  it("rejects a zero, non-finite, or out-of-range delta", async () => {
    for (const delta of [0, Number.NaN, 11]) {
      const res = await patch(JSON.stringify({ delta }));
      expect(res.status).toBe(400);
    }
    expect(adjustMock).not.toHaveBeenCalled();
  });

  it("applies a negative delta as an admin action", async () => {
    adjustMock.mockResolvedValue({ id: "user-1", credibilityScore: 0.5 });

    const res = await patch(JSON.stringify({ delta: -0.5 }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.credibilityScore).toBe(0.5);
    expect(adjustMock).toHaveBeenCalledWith("user-1", -0.5);
  });
});
