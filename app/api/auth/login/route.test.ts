import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

process.env.SESSION_SECRET = "route-test-secret";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: { user: { findUnique: vi.fn(), create: vi.fn() } },
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));

const req = (body: unknown) =>
  new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockReset();
    prismaMock.user.create.mockReset();
  });

  it("returns the existing user without creating", async () => {
    const existing = { id: "u1", email: "x@y.com", name: "X" };
    prismaMock.user.findUnique.mockResolvedValue(existing);

    const res = await POST(req({ email: "x@y.com" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ user: existing });
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("creates a user with a normalized email when not found", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const created = { id: "u2", email: "a@b.com", name: "a", role: "SOLVER" };
    prismaMock.user.create.mockResolvedValue(created);

    const res = await POST(req({ email: "  A@B.com  " }));
    expect(res.status).toBe(200);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: "a@b.com" } });
    expect(prismaMock.user.create).toHaveBeenCalled();
    expect((await res.json()).user).toEqual(created);
  });

  it("sets a signed session cookie on success", async () => {
    const existing = { id: "u1", email: "x@y.com", name: "X", role: "SOLVER" };
    prismaMock.user.findUnique.mockResolvedValue(existing);

    const res = await POST(req({ email: "x@y.com" }), undefined);
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("skillproof_session=");
    expect(cookie).toContain("HttpOnly");
  });

  it("returns 400 when email is missing", async () => {
    const res = await POST(req({}));
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("INVALID_EMAIL");
  });

  it("returns 400 when email is not a string", async () => {
    const res = await POST(req({ email: 123 }));
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("INVALID_EMAIL");
  });
});