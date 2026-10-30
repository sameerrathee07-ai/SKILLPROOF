import { describe, it, expect } from "vitest";
import { checkBotSubmission } from "./bot-protection";

describe("Bot Protection", () => {
  it("allows standard human submissions with empty or absent honeypot", () => {
    const cleanBody = { name: "Alice", email: "alice@example.com" };
    expect(checkBotSubmission(cleanBody).isBot).toBe(false);

    const bodyWithEmptyHoneypot = { ...cleanBody, _hp: "" };
    expect(checkBotSubmission(bodyWithEmptyHoneypot).isBot).toBe(false);
  });

  it("detects automated bot filling honeypot fields", () => {
    const botBody = {
      name: "Bot User",
      email: "bot@spam.com",
      _gotcha: "spam-payload",
    };
    const res = checkBotSubmission(botBody);
    expect(res.isBot).toBe(true);
    expect(res.reason).toContain("_gotcha");
  });

  it("detects malicious vulnerability scanners by user-agent", () => {
    const headers = new Headers({
      "user-agent": "sqlmap/1.6#stable (https://sqlmap.org)",
    });
    const res = checkBotSubmission({}, headers);
    expect(res.isBot).toBe(true);
    expect(res.reason).toContain("vulnerability scanner");
  });

  it("permits standard browser user-agents", () => {
    const headers = new Headers({
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0",
    });
    expect(checkBotSubmission({}, headers).isBot).toBe(false);
  });
});
