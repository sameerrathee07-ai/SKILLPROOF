import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

const { prismaMock, getRequestUserMock } = vi.hoisted(() => ({
  prismaMock: { pitch: { findMany: vi.fn() } },
  getRequestUserMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/request-user", () => ({ getRequestUser: getRequestUserMock }));

describe("GET /api/users/submissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRequestUserMock.mockResolvedValue({ id: "solver-1", role: "SOLVER" });
    prismaMock.pitch.findMany.mockResolvedValue([]);
  });

  it("returns 401 when there is no session", async () => {
    getRequestUserMock.mockResolvedValue(null);

    const res = await GET(new Request("http://localhost/api/users/submissions"), undefined);

    expect(res.status).toBe(401);
    expect(prismaMock.pitch.findMany).not.toHaveBeenCalled();
  });

  it("scopes the query to the session user", async () => {
    await GET(new Request("http://localhost/api/users/submissions"), undefined);

    expect(prismaMock.pitch.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { solverId: "solver-1" } })
    );
  });

  it("selects only public submission fields", async () => {
    await GET(new Request("http://localhost/api/users/submissions"), undefined);

    const select = prismaMock.pitch.findMany.mock.calls[0][0].select;

    expect(select).not.toHaveProperty("solver");
    expect(select).not.toHaveProperty("stepData");
    expect(select).not.toHaveProperty("idempotencyKey");
    expect(select.problem.select).not.toHaveProperty("postedById");
  });

  it("returns the solver's submissions", async () => {
    prismaMock.pitch.findMany.mockResolvedValue([
      { id: "pitch-1", status: "SHORTLISTED", score: 8.4 },
    ]);

    const res = await GET(new Request("http://localhost/api/users/submissions"), undefined);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].status).toBe("SHORTLISTED");
  });
});

