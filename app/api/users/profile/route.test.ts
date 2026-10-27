import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH } from "./route";

const { prismaMock, getRequestUserMock } = vi.hoisted(() => ({
  prismaMock: {
    user: { findUnique: vi.fn(), update: vi.fn() },
  },
  getRequestUserMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/request-user", () => ({ getRequestUser: getRequestUserMock }));

const patch = (body: unknown) =>
  PATCH(
    new Request("http://localhost/api/users/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
    undefined
  );

describe("GET /api/users/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a null user for anonymous visitors", async () => {
    getRequestUserMock.mockResolvedValue(null);

    const res = await GET(new Request("http://localhost/api/users/profile"), undefined);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.user).toBeNull();
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns the session user", async () => {
    getRequestUserMock.mockResolvedValue({ id: "u1", role: "SOLVER" });
    prismaMock.user.findUnique.mockResolvedValue({ id: "u1", name: "Ada" });

    const res = await GET(new Request("http://localhost/api/users/profile"), undefined);

    expect((await res.json()).user.name).toBe("Ada");
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: "u1" } });
  });
});

describe("PATCH /api/users/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRequestUserMock.mockResolvedValue({ id: "u1", role: "SOLVER" });
    prismaMock.user.update.mockImplementation(async ({ data }) => ({ id: "u1", ...data }));
  });

  it("returns 401 when there is no session", async () => {
    getRequestUserMock.mockResolvedValue(null);

    const res = await patch({ name: "Ada" });

    expect(res.status).toBe(401);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("returns 400 for a malformed body", async () => {
    const res = await patch("{nope");

    expect(res.status).toBe(400);
  });

  it("ignores attempts to change role or id", async () => {
    await patch({ name: "Ada", role: "ADMIN", id: "someone-else" });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { name: "Ada" },
    });
  });

  it("rejects a non-numeric age instead of hitting the database", async () => {
    const res = await patch({ age: "abc" });

    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("VALIDATION_ERROR");
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("rejects an out-of-range age", async () => {
    const res = await patch({ age: 500 });

    expect(res.status).toBe(400);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("stores a numeric age and clears it when blank", async () => {
    await patch({ age: "42" });
    expect(prismaMock.user.update.mock.calls[0][0].data.age).toBe(42);

    prismaMock.user.update.mockClear();
    await patch({ age: "" });
    expect(prismaMock.user.update.mock.calls[0][0].data.age).toBeNull();
  });

  it("trims text fields and omits fields the caller did not send", async () => {
    await patch({ name: "  Ada  ", bio: "  Builds things  " });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { name: "Ada", bio: "Builds things" },
    });
  });
});

