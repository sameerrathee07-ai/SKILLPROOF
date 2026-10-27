import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE, verifySession } from "./session";

/**
 * Node runtime only (route handlers, server components). Middleware cannot use
 * this: it runs in the edge runtime where Prisma does not exist.
 */
export async function getSessionUser(): Promise<{ id: string; role: string } | null> {
  const payload = await verifySession(cookies().get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  return prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, role: true },
  });
}
