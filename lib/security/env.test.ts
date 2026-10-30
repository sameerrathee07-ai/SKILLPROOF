import { describe, it, expect } from "vitest";
import { isServerSecret, isClientSafeKey, validateEnvironment } from "./env";

describe("env security", () => {
  it("identifies sensitive server secrets", () => {
    expect(isServerSecret("SESSION_SECRET")).toBe(true);
    expect(isServerSecret("DATABASE_URL")).toBe(true);
    expect(isServerSecret("NEXT_PUBLIC_GATE_THRESHOLD")).toBe(false);
  });

  it("identifies client-safe environment variables", () => {
    expect(isClientSafeKey("NEXT_PUBLIC_GATE_THRESHOLD")).toBe(true);
    expect(isClientSafeKey("DATABASE_URL")).toBe(false);
    expect(isClientSafeKey("SESSION_SECRET")).toBe(false);
  });

  it("validates missing secrets in production", () => {
    const res = validateEnvironment({
      NODE_ENV: "production",
      // missing secrets
    });
    expect(res.valid).toBe(false);
    expect(res.missing).toContain("SESSION_SECRET");
    expect(res.missing).toContain("DATABASE_URL");
  });

  it("accepts valid production configuration", () => {
    const res = validateEnvironment({
      NODE_ENV: "production",
      SESSION_SECRET: "mock-secret-at-least-32-chars-long",
      NEXTAUTH_SECRET: "mock-nextauth-secret-key-32-chars",
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
    });
    expect(res.valid).toBe(true);
    expect(res.missing.length).toBe(0);
  });
});
