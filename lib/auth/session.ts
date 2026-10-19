export const SESSION_COOKIE = "skillproof_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = { userId: string; role: string; exp: number };

// No static imports of Prisma or next/headers: this module is bundled into the
// edge runtime by middleware.ts. getSessionUser lazy-loads the Node-only pieces
// so they never reach the edge bundle at module scope.
const encoder = new TextEncoder();

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getSecretKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set. Add it to .env.local (see .env.example).");
  }
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signSession(payload: { userId: string; role: string }): Promise<string> {
  const key = await getSecretKey();
  const body: SessionPayload = {
    userId: payload.userId,
    role: payload.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const encoded = base64UrlEncode(encoder.encode(JSON.stringify(body)));
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(encoded));
  return `${encoded}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  const [encoded, signaturePart] = token.split(".");
  if (!encoded || !signaturePart) return null;
  const key = await getSecretKey();
  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecode(signaturePart) as BufferSource,
      encoder.encode(encoded) as BufferSource
    );
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(encoded))) as SessionPayload;
    if (
      typeof payload?.userId !== "string" ||
      typeof payload?.role !== "string" ||
      typeof payload?.exp !== "number" ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(): {
  httpOnly: true;
  sameSite: "lax";
  path: "/";
  secure: boolean;
  maxAge: number;
} {
  return {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

/**
 * Node runtime only (route handlers, server components). Middleware cannot use
 * this: it runs in the edge runtime where Prisma/SQLite do not exist.
 */
export async function getSessionUser(): Promise<{ id: string; role: string } | null> {
  const { cookies } = await import("next/headers");
  const payload = await verifySession(cookies().get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  const { prisma } = await import("@/lib/db");
  return prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, role: true },
  });
}
