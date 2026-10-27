import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH } from "./route";
import { ProblemService } from "@/lib/services/problem.service";
import { NotFoundError, ValidationError } from "@/lib/api/errors";

const { getRequestUserMock } = vi.hoisted(() => ({
  getRequestUserMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: {} }));
vi.mock("@/lib/auth/request-user", () => ({ getRequestUser: getRequestUserMock }));
vi.mock("@/lib/services/problem.service", () => ({
  ProblemService: { getProblemById: vi.fn(), updateProblemStatus: vi.fn() },
}));

const mockGet = vi.mocked(ProblemService.getProblemById);
const mockUpdate = vi.mocked(ProblemService.updateProblemStatus);

const patch = (body: unknown, problemId = "problem-1") =>
  PATCH(
    new Request(`http://localhost/api/problems/${problemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
    { params: { id: problemId } }
  );

describe("GET /api/problems/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the problem", async () => {
    mockGet.mockResolvedValue({ id: "problem-1", status: "OPEN" } as any);

    const res = await GET(new Request("http://localhost/api/problems/problem-1"), {
      params: { id: "problem-1" },
    });

    expect(res.status).toBe(200);
    expect((await res.json()).id).toBe("problem-1");
  });

  it("returns 404 for a missing problem", async () => {
    mockGet.mockRejectedValue(new NotFoundError("Problem not found."));

    const res = await GET(new Request("http://localhost/api/problems/nope"), {
      params: { id: "nope" },
    });

    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/problems/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRequestUserMock.mockResolvedValue({ id: "poster-1", role: "POSTER" });
  });

  it("returns 401 when there is no session", async () => {
    getRequestUserMock.mockResolvedValue(null);

    const res = await patch({ status: "CLOSED" });

    expect(res.status).toBe(401);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns 400 when the status is missing", async () => {
    const res = await patch({});

    expect(res.status).toBe(400);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns 400 for a malformed body", async () => {
    const res = await patch("{oops");

    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for an unsupported status", async () => {
    mockUpdate.mockRejectedValue(new ValidationError('Invalid problem status "BOGUS".'));

    const res = await patch({ status: "BOGUS" });

    expect(res.status).toBe(400);
  });

  it("returns 404 when the caller does not own the problem", async () => {
    mockUpdate.mockRejectedValue(new NotFoundError("Problem not found."));

    const res = await patch({ status: "CLOSED" });

    expect(res.status).toBe(404);
  });

  it("closes an owned problem", async () => {
    mockUpdate.mockResolvedValue({ id: "problem-1", status: "CLOSED" } as any);

    const res = await patch({ status: "closed" });

    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith("problem-1", "closed", {
      id: "poster-1",
      role: "POSTER",
    });
    expect((await res.json()).status).toBe("CLOSED");
  });
});
