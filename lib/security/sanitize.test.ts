import { describe, it, expect } from "vitest";
import { escapeHtml, sanitizePlainText, sanitizeRecord } from "./sanitize";

describe("Sanitization & HTML Escaping", () => {
  it("escapes special HTML characters to prevent XSS", () => {
    const malicious = '<script>alert("XSS")</script>';
    const escaped = escapeHtml(malicious);
    expect(escaped).toBe("&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;");
  });

  it("escapes quotes and ampersands", () => {
    expect(escapeHtml("Tom & 'Jerry'")).toBe("Tom &amp; &#x27;Jerry&#x27;");
  });

  it("strips null bytes and malicious control characters", () => {
    const inputWithNull = "hello\0world\x07";
    expect(sanitizePlainText(inputWithNull)).toBe("helloworld");
  });

  it("recursively sanitizes records", () => {
    const dirty = {
      name: "  Alice\0  ",
      nested: {
        bio: "Bio with\x00 null byte  ",
        age: 25,
      },
      tags: ["  tag1\0 "],
    };
    const cleaned = sanitizeRecord(dirty);
    expect(cleaned.name).toBe("Alice");
    expect(cleaned.nested.bio).toBe("Bio with null byte");
    expect(cleaned.nested.age).toBe(25);
    expect(cleaned.tags[0]).toBe("tag1");
  });
});
