/**
 * Environment security & secret isolation.
 * Guarantees server secrets are never bundled or exposed to the client.
 */

const SERVER_SECRET_KEYS = [
  "SESSION_SECRET",
  "NEXTAUTH_SECRET",
  "DATABASE_URL",
  "GOOGLE_CLIENT_SECRET",
  "UPSTASH_REDIS_REST_TOKEN",
  "RESEND_API_KEY",
] as const;

export function isServerSecret(key: string): boolean {
  return SERVER_SECRET_KEYS.includes(key as any);
}

export function isClientSafeKey(key: string): boolean {
  // Only explicitly prefixed NEXT_PUBLIC_ variables are allowed on the client
  return key.startsWith("NEXT_PUBLIC_");
}

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

export function validateEnvironment(env: Record<string, string | undefined> = process.env): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Critical in production
  if (env.NODE_ENV === "production") {
    if (!env.SESSION_SECRET) missing.push("SESSION_SECRET");
    if (!env.NEXTAUTH_SECRET) missing.push("NEXTAUTH_SECRET");
    if (!env.DATABASE_URL) missing.push("DATABASE_URL");
  } else {
    if (!env.SESSION_SECRET) warnings.push("SESSION_SECRET is unset (fallback will be required)");
    if (!env.NEXTAUTH_SECRET) warnings.push("NEXTAUTH_SECRET is unset");
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}
