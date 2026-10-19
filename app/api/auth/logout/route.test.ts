import { describe, it, expect } from "vitest";
import { POST } from "./route";

describe("POST /api/auth/logout", () => {
  it("clears the session cookie", async () => {
    const res = await POST(
      new Request("http://localhost/api/auth/logout", { method: "POST" }),
      undefined
    );

    expect(res.status).toBe(200);
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("skillproof_session=");
    expect(cookie).toContain("Max-Age=0");
  });
});
