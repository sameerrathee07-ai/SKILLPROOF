/**
 * Password hashing and verification using Node.js crypto.scrypt with timingSafeEqual.
 * OWASP-compliant, zero external dependencies.
 */
import crypto from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(crypto.scrypt);

const SALT_BYTE_LENGTH = 16;
const KEY_BYTE_LENGTH = 64;

export interface PasswordValidation {
  valid: boolean;
  reason?: string;
}

export function validatePasswordStrength(password: unknown): PasswordValidation {
  if (typeof password !== "string") {
    return { valid: false, reason: "Password must be a string." };
  }
  if (password.length < 8) {
    return { valid: false, reason: "Password must be at least 8 characters long." };
  }
  if (password.length > 128) {
    return { valid: false, reason: "Password must not exceed 128 characters." };
  }
  return { valid: true };
}

/**
 * Hash a password using a randomly generated salt and scrypt.
 * Output format: `<salt_hex>:<hash_hex>`
 */
export async function hashPassword(password: string): Promise<string> {
  const strength = validatePasswordStrength(password);
  if (!strength.valid) {
    throw new Error(strength.reason || "Invalid password.");
  }

  const salt = crypto.randomBytes(SALT_BYTE_LENGTH);
  const derivedKey = (await scryptAsync(password, salt, KEY_BYTE_LENGTH)) as Buffer;

  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

/**
 * Verify a password against an scrypt stored hash using timing-safe comparison.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (typeof password !== "string" || typeof storedHash !== "string") {
    return false;
  }

  const [saltHex, originalHashHex] = storedHash.split(":");
  if (!saltHex || !originalHashHex) {
    return false;
  }

  try {
    const salt = Buffer.from(saltHex, "hex");
    const originalHash = Buffer.from(originalHashHex, "hex");
    if (salt.length !== SALT_BYTE_LENGTH || originalHash.length !== KEY_BYTE_LENGTH) {
      return false;
    }

    const derivedKey = (await scryptAsync(password, salt, KEY_BYTE_LENGTH)) as Buffer;
    return crypto.timingSafeEqual(originalHash, derivedKey);
  } catch {
    return false;
  }
}
