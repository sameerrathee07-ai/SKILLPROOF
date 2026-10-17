import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: { user: { findUnique: vi.fn(), create: vi.fn() } },
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));

const req = (body: unknown) =>
  new Request("http://localhost/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockReset();
    prismaMock.user.create.mockReset();
  });

  it("returns the existing user when the email is taken", async () => {
    const existing = { id: "u1", email: "x@y.com", name: "X" };
    prismaMock.user.findUnique.mockResolvedValue(existing);

    const res = await POST(req({ name: "X", email: "x@y.com" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ user: existing });
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("creates a SOLVER by default with a normalized email", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const created = { id: "u2", email: "a@b.com", name: "A", role: "SOLVER" };
    prismaMock.user.create.mockResolvedValue(created);

    const res = await POST(req({ name: "A", email: "  A@B.com  " }));
    expect(res.status).toBe(201);
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        name: "A",
        email: "a@b.com",
        role: "SOLVER",
        tokens: 50,
        credibilityScore: 1.0,
      },
    });
    expect((await res.json()).user).toEqual(created);
  });

  it("maps a POSTER role", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({ id: "u3", role: "POSTER" });

    const res = await POST(req({ name: "P", email: "p@b.com", role: "POSTER" }));
    expect(res.status).toBe(201);
    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ role: "POSTER" }) })
    );
  });

  it("coerces unknown roles to SOLVER", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({ id: "u4", role: "SOLVER" });

    await POST(req({ name: "S", email: "s@b.com", role: "ADMIN" }));
    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ role: "SOLVER" }) })
    );
  });

  it("returns 400 when name or email is missing", async () => {
    const missingName = await POST(req({ email: "x@y.com" }));
    expect(missingName.status).toBe(400);
    expect((await missingName.json()).code).toBe("MISSING_FIELDS");

    const missingEmail = await POST(req({ name: "X" }));
    expect(missingEmail.status).toBe(400);
  });
});