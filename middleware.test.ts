// @vitest-environment node
import { describe, it, expect, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";
import { signSession, SESSION_COOKIE } from "./lib/auth/session";

process.env.SESSION_SECRET = "middleware-test-secret";

const requestTo = (path: string, cookieToken?: string, headersInit?: Record<string, string>) =>
  new NextRequest(`http://localhost${path}`, {
    headers: {
      ...(cookieToken ? { cookie: `${SESSION_COOKIE}=${cookieToken}` } : {}),
      ...headersInit,
    },
  });

const tokenFor = (role: string) => signSession({ userId: "u1", role });

const loginRedirectFor = (path: string) =>
  `http://localhost/login?next=${encodeURIComponent(path)}`;

describe("middleware route protection", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it("forces HTTPS in production for insecure external requests", async () => {
    process.env.NODE_ENV = "production";
    const req = new NextRequest("http://skillproof.com/admin", {
      headers: {
        "x-forwarded-proto": "http",
        host: "skillproof.com",
      },
    });

    const res = await middleware(req);
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe("https://skillproof.com/admin");
  });

  it("redirects unauthenticated /admin requests to login with next", async () => {
    const res = await middleware(requestTo("/admin"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(loginRedirectFor("/admin"));
  });

  it("redirects a SOLVER away from /admin to the home page", async () => {
    const res = await middleware(requestTo("/admin", await tokenFor("SOLVER")));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/");
  });

  it("lets an ADMIN through to /admin", async () => {
    const res = await middleware(requestTo("/admin", await tokenFor("ADMIN")));
    expect(res.headers.get("x-middleware-next")).toBe("1");
    expect(res.headers.get("location")).toBeNull();
  });

  it("lets a POSTER through to /org", async () => {
    const res = await middleware(requestTo("/org/anything", await tokenFor("POSTER")));
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects an unauthenticated pitch page to login", async () => {
    const res = await middleware(requestTo("/problems/abc123/pitch"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(loginRedirectFor("/problems/abc123/pitch"));
  });

  it("lets a SOLVER through to /problems/<id>/pitch and /pitch/result", async () => {
    const cookie = await tokenFor("SOLVER");
    const pitch = await middleware(requestTo("/problems/abc123/pitch", cookie));
    expect(pitch.headers.get("x-middleware-next")).toBe("1");
    const result = await middleware(requestTo("/problems/abc123/pitch/result", cookie));
    expect(result.headers.get("x-middleware-next")).toBe("1");
  });

  it("leaves the /problems catalog untouched for anonymous visitors", async () => {
    const res = await middleware(requestTo("/problems"));
    expect(res.headers.get("x-middleware-next")).toBe("1");
    expect(res.headers.get("location")).toBeNull();
  });

  it("redirects a garbage cookie on /admin to login", async () => {
    const res = await middleware(requestTo("/admin", "not-a-real-token"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(loginRedirectFor("/admin"));
  });
});
