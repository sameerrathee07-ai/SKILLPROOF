/**
 * AES-256-GCM authenticated encryption for sensitive at-rest data.
 * Zero external dependencies; uses Node.js crypto standard library.
 */
import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits authentication tag

function getDerivedKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || process.env.SESSION_SECRET || "default-skillproof-secret-fallback";
  return Buffer.from(crypto.hkdfSync("sha256", secret, "skillproof-salt", "skillproof-aes-256-gcm", 32));
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Output format: base64url(iv).base64url(ciphertext).base64url(authTag)
 */
export function encryptSensitive(plaintext: string): string {
  if (typeof plaintext !== "string") {
    throw new TypeError("Plaintext to encrypt must be a string.");
  }

  const key = getDerivedKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64url"),
    encrypted.toString("base64url"),
    authTag.toString("base64url"),
  ].join(".");
}

/**
 * Decrypt an AES-256-GCM encrypted string with authentication tag validation.
 */
export function decryptSensitive(payload: string): string {
  if (!payload || typeof payload !== "string") {
    throw new TypeError("Encrypted payload must be a non-empty string.");
  }

  const parts = payload.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted payload format. Expected iv.ciphertext.tag");
  }

  const [ivB64, cipherB64, tagB64] = parts;
  const iv = Buffer.from(ivB64, "base64url");
  const ciphertext = Buffer.from(cipherB64, "base64url");
  const authTag = Buffer.from(tagB64, "base64url");

  if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error("Malformed initialization vector or authentication tag.");
  }

  const key = getDerivedKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString("utf8");
}
