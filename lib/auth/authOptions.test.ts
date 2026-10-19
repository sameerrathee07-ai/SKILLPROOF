// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { authOptions } from "./authOptions";

const { cookieValue, prismaMock } = vi.hoisted(() => ({
  cookieValue: { current: undefined as string | undefined },
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  cookies: () => ({
    get: (name: string) =>
      name === "skillproof_oauth_role" && cookieValue.current
        ? { name, value: cookieValue.current }
        : undefined,
  }),
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));
vi.mock("@next-auth/prisma-adapter", () => ({ PrismaAdapter: () => ({}) }));

const jwt = authOptions.callbacks!.jwt!;

function runJwt(trigger: "signUp" | "signIn") {
  return jwt({
    token: { name: "Test" },
    user: { id: "u1" },
    account: null,
    trigger,
    isNewUser: trigger === "signUp",
  } as never);
}

describe("authOptions jwt", () => {
  beforeEach(() => {
    cookieValue.current = undefined;
    prismaMock.user.findUnique.mockReset();
    prismaMock.user.update.mockReset();
    prismaMock.user.findUnique.mockResolvedValue({
      role: "POSTER",
      tokens: 50,
      credibilityScore: 1,
    });
    prismaMock.user.update.mockResolvedValue({});
  });

  it("applies the selected role to a new Google account", async () => {
    cookieValue.current = "POSTER";
    const token = await runJwt("signUp");

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { role: "POSTER" },
    });
    expect(token.role).toBe("POSTER");
  });

  it("ignores the role cookie for an existing account", async () => {
    cookieValue.current = "POSTER";
    const token = await runJwt("signIn");

    expect(prismaMock.user.update).not.toHaveBeenCalled();
    expect(token.role).toBe("POSTER");
  });

  it("does not apply an invalid role", async () => {
    cookieValue.current = "ADMIN";
    prismaMock.user.findUnique.mockResolvedValue({
      role: "SOLVER",
      tokens: 50,
      credibilityScore: 1,
    });

    const token = await runJwt("signUp");
    expect(prismaMock.user.update).not.toHaveBeenCalled();
    expect(token.role).toBe("SOLVER");
  });
});
