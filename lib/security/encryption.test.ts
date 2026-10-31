import { describe, it, expect } from "vitest";
import { encryptSensitive, decryptSensitive } from "./encryption";

describe("AES-256-GCM encryption", () => {
  it("encrypts and decrypts string correctly", () => {
    const original = "super-secret-oauth-refresh-token-12345";
    const encrypted = encryptSensitive(original);

    expect(encrypted).not.toBe(original);
    expect(encrypted.split(".").length).toBe(3);

    const decrypted = decryptSensitive(encrypted);
    expect(decrypted).toBe(original);
  });

  it("produces different ciphertexts for the same plaintext due to random IV", () => {
    const message = "sensitive-content";
    const enc1 = encryptSensitive(message);
    const enc2 = encryptSensitive(message);

    expect(enc1).not.toBe(enc2);
    expect(decryptSensitive(enc1)).toBe(message);
    expect(decryptSensitive(enc2)).toBe(message);
  });

  it("fails to decrypt tampered ciphertext", () => {
    const encrypted = encryptSensitive("my-confidential-note");
    const [iv, cipher, tag] = encrypted.split(".");
    // Flip the first base64 char so the change cannot land in padding bits
    const tamperedCipher = (cipher[0] === "A" ? "B" : "A") + cipher.slice(1);
    const tamperedPayload = [iv, tamperedCipher, tag].join(".");

    expect(() => decryptSensitive(tamperedPayload)).toThrow();
  });

  it("fails to decrypt tampered auth tag", () => {
    const encrypted = encryptSensitive("my-confidential-note");
    const [iv, cipher, tag] = encrypted.split(".");
    const rawTag = Buffer.from(tag, "base64url");
    rawTag[0] ^= 1;
    const tamperedTag = rawTag.toString("base64url");
    const tamperedPayload = [iv, cipher, tamperedTag].join(".");

    expect(() => decryptSensitive(tamperedPayload)).toThrow();
  });

  it("rejects invalid payload structures", () => {
    expect(() => decryptSensitive("invalid-string")).toThrow();
    expect(() => decryptSensitive("")).toThrow();
  });
});
