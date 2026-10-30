import { describe, it, expect, vi } from "vitest";
import { successResponse, errorResponse, withErrorHandler } from "@/lib/api/response";
import { AppError, NotFoundError, ValidationError } from "@/lib/api/errors";

describe("successResponse", () => {
  it("serializes data with an explicit status", async () => {
    const res = successResponse({ ok: true }, 201);
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("defaults to status 200", async () => {
    const res = successResponse({ a: 1 });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ a: 1 });
  });
});

describe("errorResponse", () => {
  it("classifies an AppError with its status, code, and details", async () => {
    const res = errorResponse(new ValidationError("bad input", { field: "x" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "bad input",
      code: "VALIDATION_ERROR",
      details: { field: "x" },
    });
  });

  it("classifies a NotFoundError", async () => {
    const res = errorResponse(new NotFoundError("gone"));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "gone", code: "NOT_FOUND" });
  });

  it("falls back to 500 for a generic Error", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = errorResponse(new Error("boom"));
    spy.mockRestore();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "boom", code: "INTERNAL_SERVER_ERROR" });
  });

  it("masks generic Error messages in production to prevent leaking internal details", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = errorResponse(new Error("sensitive postgres connection leaked"));
    spy.mockRestore();
    process.env.NODE_ENV = originalEnv;

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      error: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  });

  it("falls back to 500 for a non-Error throw", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = errorResponse("a string");
    spy.mockRestore();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      error: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  });
});

describe("withErrorHandler", () => {
  it("returns the handler result on success", async () => {
    const handler = withErrorHandler(async () => successResponse({ ok: true }));
    const res = await handler(new Request("http://localhost/api"));
    expect(res.status).toBe(200);
  });

  it("converts a thrown AppError into an error response", async () => {
    const handler = withErrorHandler(async () => {
      throw new NotFoundError("missing");
    });
    const res = await handler(new Request("http://localhost/api"));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "missing", code: "NOT_FOUND" });
  });
});