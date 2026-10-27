import { describe, it, expect } from "vitest";
import { normalizeUrl } from "./utils";

describe("normalizeUrl", () => {
  it("keeps absolute and protocol-relative links", () => {
    expect(normalizeUrl("https://example.com/path")).toBe("https://example.com/path");
    expect(normalizeUrl("http://example.com")).toBe("http://example.com");
    expect(normalizeUrl("mailto:hello@example.com")).toBe("mailto:hello@example.com");
    expect(normalizeUrl("/problems")).toBe("/problems");
  });

  it("adds https to bare domains and strips leading slashes", () => {
    expect(normalizeUrl("github.com/solver/repo")).toBe("https://github.com/solver/repo");
    expect(normalizeUrl("//portfolio.example.com")).toBe("https://portfolio.example.com");
  });

  it("returns an empty string for blank input", () => {
    expect(normalizeUrl("   ")).toBe("");
  });
});
