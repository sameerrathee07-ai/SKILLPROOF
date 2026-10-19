import { describe, it, expect } from "vitest";
import { safeNextPath } from "./next-path";

describe("safeNextPath", () => {
  it("keeps a same-site path", () => {
    expect(safeNextPath("?next=%2Ftokens")).toBe("/tokens");
  });

  it("keeps a same-site path with a query string", () => {
    expect(safeNextPath("?next=%2Fproblems%2Fabc%3Ftab%3D1")).toBe(
      "/problems/abc?tab=1"
    );
  });

  it("falls back to /problems when next is missing", () => {
    expect(safeNextPath("")).toBe("/problems");
  });

  it("rejects absolute URLs", () => {
    expect(safeNextPath("?next=https%3A%2F%2Fevil.com")).toBe("/problems");
  });

  it("rejects protocol-relative paths", () => {
    expect(safeNextPath("?next=%2F%2Fevil.com")).toBe("/problems");
  });

  it("rejects backslash paths that browsers treat as external", () => {
    expect(safeNextPath("?next=%2F%5Cevil.com")).toBe("/problems");
  });
});
