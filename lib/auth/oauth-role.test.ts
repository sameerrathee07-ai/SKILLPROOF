import { describe, it, expect } from "vitest";
import { parseOAuthRole } from "./oauth-role";

describe("parseOAuthRole", () => {
  it("accepts solver and poster", () => {
    expect(parseOAuthRole("SOLVER")).toBe("SOLVER");
    expect(parseOAuthRole("POSTER")).toBe("POSTER");
  });

  it("rejects missing or unknown roles", () => {
    expect(parseOAuthRole(undefined)).toBeNull();
    expect(parseOAuthRole("ADMIN")).toBeNull();
    expect(parseOAuthRole("solver")).toBeNull();
  });
});
