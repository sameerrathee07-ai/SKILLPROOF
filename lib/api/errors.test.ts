import { describe, it, expect } from "vitest";
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/api/errors";

describe("AppError", () => {
  it("captures message, name, status, code, and details", () => {
    const err = new AppError("boom", 418, "TEAPOT", { extra: 1 });
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("AppError");
    expect(err.message).toBe("boom");
    expect(err.statusCode).toBe(418);
    expect(err.code).toBe("TEAPOT");
    expect(err.details).toEqual({ extra: 1 });
  });

  it("defaults to 500 / INTERNAL_SERVER_ERROR", () => {
    const err = new AppError("boom");
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe("INTERNAL_SERVER_ERROR");
    expect(err.details).toBeUndefined();
  });
});

describe("ValidationError", () => {
  it("is a 400 VALIDATION_ERROR AppError", () => {
    const err = new ValidationError("bad input", { field: "x" });
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.details).toEqual({ field: "x" });
  });
});

describe("NotFoundError", () => {
  it("is a 404 NOT_FOUND AppError", () => {
    const err = new NotFoundError("missing");
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
  });
});

describe("UnauthorizedError", () => {
  it("is a 401 UNAUTHORIZED AppError with default message", () => {
    const err = new UnauthorizedError();
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
    expect(err.message).toBe("Unauthorized");
  });
});