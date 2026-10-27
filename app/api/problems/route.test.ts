import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { ProblemService } from "@/lib/services/problem.service";
import { OrganizationService } from "@/lib/services/organization.service";

const { prismaMock, getRequestUserMock } = vi.hoisted(() => ({
  prismaMock: {
    organization: { findUnique: vi.fn(), findFirst: vi.fn() },
  },
  getRequestUserMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/request-user", () => ({ getRequestUser: getRequestUserMock }));
vi.mock("@/lib/services/problem.service", () => ({
  ProblemService: { listProblems: vi.fn(), createProblem: vi.fn() },
}));
vi.mock("@/lib/services/organization.service", () => ({
  OrganizationService: { findOrCreateOrganization: vi.fn() },
}));

const mockList = vi.mocked(ProblemService.listProblems);
const mockCreate = vi.mocked(ProblemService.createProblem);
const mockFindOrCreate = vi.mocked(OrganizationService.findOrCreateOrganization);

const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/problems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    undefined
  );

const validProblem = {
  title: "Attendance blind spot",
  description: "Paper registers hide consecutive absences for days.",
  frictionCategory: "EDUCATION",
};

describe("GET /api/problems", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is public and forwards the filters", async () => {
    mockList.mockResolvedValue([]);

    const res = await GET(
      new Request(
        "http://localhost/api/problems?category=EDUCATION&organizationId=org-1"
      ),
      undefined
    );

    expect(res.status).toBe(200);
    expect(mockList).toHaveBeenCalledWith({
      category: "EDUCATION",
      organizationId: "org-1",
    });
  });
});

describe("POST /api/problems", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRequestUserMock.mockResolvedValue({ id: "poster-1", role: "POSTER" });
    mockCreate.mockResolvedValue({ id: "problem-1" } as any);
  });

  it("returns 401 when there is no session", async () => {
    getRequestUserMock.mockResolvedValue(null);

    const res = await post(validProblem);

    expect(res.status).toBe(401);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 403 for a solver", async () => {
    getRequestUserMock.mockResolvedValue({ id: "solver-1", role: "SOLVER" });

    const res = await post(validProblem);

    expect(res.status).toBe(403);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects posting into an organization the caller does not own", async () => {
    prismaMock.organization.findUnique.mockResolvedValue({
      id: "org-1",
      ownerId: "someone-else",
    });

    const res = await post({ ...validProblem, organizationId: "org-1" });

    expect(res.status).toBe(403);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("binds the problem to the caller's existing organization", async () => {
    prismaMock.organization.findUnique.mockResolvedValue({
      id: "org-1",
      ownerId: "poster-1",
    });

    const res = await post({ ...validProblem, organizationId: "org-1" });

    expect(res.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-1",
        postedById: "poster-1",
      })
    );
  });

  it("requires an organization name when the poster owns no organization", async () => {
    prismaMock.organization.findFirst.mockResolvedValue(null);

    const res = await post(validProblem);

    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("VALIDATION_ERROR");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("creates an organization owned by the caller when none exists", async () => {
    prismaMock.organization.findFirst.mockResolvedValue(null);
    mockFindOrCreate.mockResolvedValue({ id: "org-new" } as any);

    const res = await post({ ...validProblem, orgName: "Fresh Org" });

    expect(res.status).toBe(201);
    expect(mockFindOrCreate).toHaveBeenCalledWith({
      name: "Fresh Org",
      type: undefined,
      ownerId: "poster-1",
    });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: "org-new" })
    );
  });

  it("reuses the poster's first organization instead of creating another", async () => {
    prismaMock.organization.findFirst.mockResolvedValue({
      id: "org-existing",
      ownerId: "poster-1",
    });

    const res = await post({ ...validProblem, orgName: "Ignored Name" });

    expect(res.status).toBe(201);
    expect(mockFindOrCreate).not.toHaveBeenCalled();
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: "org-existing" })
    );
  });
});
