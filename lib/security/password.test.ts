import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, validatePasswordStrength } from "./password";

describe("Password Hashing & Verification", () => {
  it("validates password length bounds", () => {
    expect(validatePasswordStrength("short").valid).toBe(false);
    expect(validatePasswordStrength("a".repeat(129)).valid).toBe(false);
    expect(validatePasswordStrength("validPassword123!").valid).toBe(true);
  });

  it("hashes password and verifies correct password", async () => {
    const raw = "MySecureP@ssw0rd!";
    const hashed = await hashPassword(raw);

    expect(hashed).not.toBe(raw);
    expect(hashed).toContain(":");

    const matches = await verifyPassword(raw, hashed);
    expect(matches).toBe(true);
  });

  it("rejects incorrect password", async () => {
    const raw = "MySecureP@ssw0rd!";
    const hashed = await hashPassword(raw);

    const matches = await verifyPassword("WrongPassword123!", hashed);
    expect(matches).toBe(false);
  });

  it("generates different hashes for identical passwords due to salt", async () => {
    const raw = "SamePasswordEveryTime";
    const hash1 = await hashPassword(raw);
    const hash2 = await hashPassword(raw);

    expect(hash1).not.toBe(hash2);
    expect(await verifyPassword(raw, hash1)).toBe(true);
    expect(await verifyPassword(raw, hash2)).toBe(true);
  });

  it("handles malformed hashes gracefully without throwing", async () => {
    expect(await verifyPassword("password", "malformed")).toBe(false);
    expect(await verifyPassword("password", "abc:def")).toBe(false);
    expect(await verifyPassword("password", "")).toBe(false);
  });
});
