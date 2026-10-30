import { describe, it, expect } from "vitest";
import { trimUserForOwner, trimUserForPublic } from "./trim-response";

describe("Response Trimming & Data Minimization", () => {
  const fullDbUser = {
    id: "usr_123",
    name: "Alice",
    email: "alice@example.com",
    role: "SOLVER",
    tokens: 42,
    credibilityScore: 7.5,
    passwordHash: "secret_salt:secret_hash",
    accounts: [{ access_token: "leaked_token" }],
    sessions: [{ sessionToken: "session_abc" }],
    image: "/avatar.png",
    age: 26,
    company: "Acme Corp",
    bio: "Engineer",
    headline: "Fullstack Dev",
    createdAt: new Date(),
  };

  it("trims user object for owner, stripping passwordHash, accounts, and sessions", () => {
    const trimmed = trimUserForOwner(fullDbUser);
    expect(trimmed.id).toBe("usr_123");
    expect(trimmed.email).toBe("alice@example.com");
    expect((trimmed as any).passwordHash).toBeUndefined();
    expect((trimmed as any).accounts).toBeUndefined();
    expect((trimmed as any).sessions).toBeUndefined();
  });

  it("trims user object for public view, stripping email in addition to credentials", () => {
    const publicUser = trimUserForPublic(fullDbUser);
    expect(publicUser.id).toBe("usr_123");
    expect((publicUser as any).email).toBeUndefined();
    expect((publicUser as any).passwordHash).toBeUndefined();
  });
});
