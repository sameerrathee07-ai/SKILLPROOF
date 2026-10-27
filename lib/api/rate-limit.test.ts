import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  rateLimit,
  enforceRateLimit,
  resetRateLimitsForTests,
} from "./rate-limit";
import { RateLimitError } from "./errors";

describe("rateLimit", () => {
  beforeEach(() => {
    resetRateLimitsForTests();
    vi.unstubAllEnvs();
  });

  it("allows requests up to the limit and blocks the next one", async () => {
    const options = { key: "pitch:user-1", limit: 2, windowMs: 60_000 };

    expect((await rateLimit(options)).allowed).toBe(true);
    expect((await rateLimit(options)).allowed).toBe(true);

    const blocked = await rateLimit(options);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("tracks separate keys independently", async () => {
    expect(
      (await rateLimit({ key: "login:ip-1", limit: 1, windowMs: 60_000 })).allowed
    ).toBe(true);
    expect(
      (await rateLimit({ key: "login:ip-2", limit: 1, windowMs: 60_000 })).allowed
    ).toBe(true);
  });

  it("throws RateLimitError from enforceRateLimit", async () => {
    const options = { key: "pitch:user-2", limit: 1, windowMs: 60_000 };
    await enforceRateLimit(options);

    await expect(enforceRateLimit(options)).rejects.toBeInstanceOf(RateLimitError);
  });
});
