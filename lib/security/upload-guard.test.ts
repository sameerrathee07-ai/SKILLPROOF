import { describe, it, expect } from "vitest";
import {
  sanitizeFileName,
  validateImageBytes,
  validateImageDataUrl,
  MAX_UPLOAD_BYTES,
} from "./upload-guard";

describe("Upload Guard & File Restriction", () => {
  it("sanitizes filenames and eliminates path traversal", () => {
    expect(sanitizeFileName("../../../etc/passwd")).toBe("passwd");
    expect(sanitizeFileName("..\\..\\malicious.exe")).toBe("malicious.exe");
    expect(sanitizeFileName("profile pic (1).png")).toBe("profile_pic__1_.png");
  });

  it("accepts valid PNG magic bytes", () => {
    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    expect(validateImageBytes(pngHeader).valid).toBe(true);
  });

  it("accepts valid JPEG magic bytes", () => {
    const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
    expect(validateImageBytes(jpegHeader).valid).toBe(true);
  });

  it("rejects non-image or executable files", () => {
    const exeBuffer = Buffer.from("MZ\x90\x00\x03\x00\x00\x00"); // DOS executable header
    const res = validateImageBytes(exeBuffer);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("Invalid image signature");
  });

  it("rejects files exceeding size limit", () => {
    const oversizedBuffer = Buffer.alloc(MAX_UPLOAD_BYTES + 10);
    const res = validateImageBytes(oversizedBuffer);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("exceeds maximum allowed size");
  });

  it("validates base64 data URLs", () => {
    const pngBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    expect(validateImageDataUrl(pngBase64).valid).toBe(true);

    const textDataUrl = "data:text/plain;base64,SGVsbG8gV29ybGQ=";
    expect(validateImageDataUrl(textDataUrl).valid).toBe(false);
  });

  it("permits trusted absolute and https avatar URLs", () => {
    expect(validateImageDataUrl("https://example.com/avatar.jpg").valid).toBe(true);
    expect(validateImageDataUrl("/avatars/solver.png").valid).toBe(true);
    expect(validateImageDataUrl("javascript:alert(1)").valid).toBe(false);
  });
});
