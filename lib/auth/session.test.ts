// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import {
  signSession,
  verifySession,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  sessionCookieOptions,
} from "./session";

const SECRET = "test-secret-0123456789abcdef";

const toB64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

// Mirrors the production algorithm so tests can craft tokens with a controlled exp.
async function signWith(secret: string, payload: object) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const body = toB64url(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  return `${body}.${toB64url(new Uint8Array(sig))}`;
}

describe("session", () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = SECRET;
  });

  it("signs and verifies a roundtrip payload", async () => {
    const token = await signSession({ userId: "u1", role: "SOLVER" });
    const payload = await verifySession(token);
    expect(payload).not.toBeNull();
    expect(payload!.userId).toBe("u1");
    expect(payload!.role).toBe("SOLVER");
    expect(payload!.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it("returns null for a tampered payload", async () => {
    const token = await signSession({ userId: "u1", role: "SOLVER" });
    const [body, sig] = token.split(".");
    const i = Math.floor(body.length / 2);
    const flipped = body.slice(0, i) + (body[i] === "A" ? "B" : "A") + body.slice(i + 1);
    expect(await verifySession(`${flipped}.${sig}`)).toBeNull();
  });

  it("returns null for a token signed with a different secret", async () => {
    const token = await signSession({ userId: "u1", role: "SOLVER" });
    process.env.SESSION_SECRET = "other-secret";
    expect(await verifySession(token)).toBeNull();
  });

  it("returns null for garbage, empty, or undefined tokens", async () => {
    expect(await verifySession(undefined)).toBeNull();
    expect(await verifySession("")).toBeNull();
    expect(await verifySession("garbage")).toBeNull();
    expect(await verifySession("a.b.c")).toBeNull();
  });

  it("returns null for an expired token", async () => {
    const expired = await signWith(SECRET, {
      userId: "u1",
      role: "SOLVER",
      exp: Math.floor(Date.now() / 1000) - 10,
    });
    expect(await verifySession(expired)).toBeNull();
  });

  it("exposes the cookie constants and options", () => {
    expect(SESSION_COOKIE).toBe("skillproof_session");
    const opts = sessionCookieOptions();
    expect(opts).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
  });
});
