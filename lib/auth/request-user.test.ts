import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRequestUser } from "./request-user";

const { getSessionUserMock, getServerSessionMock } = vi.hoisted(() => ({
  getSessionUserMock: vi.fn(),
  getServerSessionMock: vi.fn(),
}));

vi.mock("./session-user", () => ({ getSessionUser: getSessionUserMock }));
vi.mock("./authOptions", () => ({ authOptions: {} }));
vi.mock("next-auth", () => ({ getServerSession: getServerSessionMock }));

describe("getRequestUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("prefers the local email session", async () => {
    getSessionUserMock.mockResolvedValue({ id: "local-1", role: "SOLVER" });

    const user = await getRequestUser();

    expect(user).toEqual({ id: "local-1", role: "SOLVER" });
    expect(getServerSessionMock).not.toHaveBeenCalled();
  });

  it("falls back to the NextAuth session", async () => {
    getSessionUserMock.mockResolvedValue(null);
    getServerSessionMock.mockResolvedValue({
      user: { id: "oauth-1", role: "POSTER", email: "p@example.com" },
    });

    const user = await getRequestUser();

    expect(user).toEqual({ id: "oauth-1", role: "POSTER" });
  });

  it("returns null when neither session exists", async () => {
    getSessionUserMock.mockResolvedValue(null);
    getServerSessionMock.mockResolvedValue(null);

    await expect(getRequestUser()).resolves.toBeNull();
  });

  it("returns null when the OAuth session has no user id", async () => {
    getSessionUserMock.mockResolvedValue(null);
    getServerSessionMock.mockResolvedValue({ user: { role: "POSTER" } });

    await expect(getRequestUser()).resolves.toBeNull();
  });
});
