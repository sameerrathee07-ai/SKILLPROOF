import { prisma } from "@/lib/db";
import { withErrorHandler, successResponse } from "@/lib/api/response";
import { AppError, UnauthorizedError } from "@/lib/api/errors";
import { enforceRateLimit, getClientIp } from "@/lib/api/rate-limit";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth/session";

export const POST = withErrorHandler(async (request: Request) => {
  await enforceRateLimit({
    key: `auth:login:${getClientIp(request)}`,
    limit: 10,
    windowMs: 5 * 60 * 1000,
  });

  const body = await request.json();
  const { email, image } = body;

  if (!email || typeof email !== "string") {
    throw new AppError("Valid email is required", 400, "INVALID_EMAIL");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (!user) {
    throw new UnauthorizedError("No account found for this email.");
  }

  let activeUser = user;
  if (typeof image === "string" && image.trim()) {
    activeUser = await prisma.user.update({
      where: { id: user.id },
      data: { image: image.trim() },
    });
  }

  const response = successResponse({ user: activeUser });
  response.cookies.set(
    SESSION_COOKIE,
    await signSession({ userId: user.id, role: user.role }),
    sessionCookieOptions()
  );
  return response;
});
