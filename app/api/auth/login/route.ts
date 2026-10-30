import { prisma } from "@/lib/db";
import { withErrorHandler, successResponse } from "@/lib/api/response";
import { AppError, UnauthorizedError } from "@/lib/api/errors";
import { enforceRateLimit, getClientIp } from "@/lib/api/rate-limit";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth/session";
import { checkBotSubmission } from "@/lib/security/bot-protection";
import { verifyPassword } from "@/lib/security/password";
import { validateImageDataUrl } from "@/lib/security/upload-guard";
import { readJsonBody } from "@/lib/api/request-body";

export const POST = withErrorHandler(async (request: Request) => {
  const ip = getClientIp(request);
  await enforceRateLimit({
    key: `auth:login:${ip}`,
    limit: 10,
    windowMs: 5 * 60 * 1000,
  });

  const body = await readJsonBody(request);

  // Bot protection: check honeypots & crawler signatures
  const botCheck = checkBotSubmission(body, request.headers);
  if (botCheck.isBot) {
    throw new AppError("Request flagged by automated protection.", 403, "BOT_DETECTED");
  }

  const { email, image, password } = body;

  if (!email || typeof email !== "string") {
    throw new AppError("Valid email is required", 400, "INVALID_EMAIL");
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Dual rate limit: prevent brute force targeting a single email across IPs
  await enforceRateLimit({
    key: `auth:login:email:${normalizedEmail}`,
    limit: 10,
    windowMs: 5 * 60 * 1000,
  });

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (!user) {
    throw new UnauthorizedError("No account found for this email.");
  }

  // Password verification if password authentication is utilized
  if ((user as any).passwordHash && typeof password === "string") {
    const valid = await verifyPassword(password, (user as any).passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid credentials.");
    }
  }

  let activeUser = user;
  if (typeof image === "string" && image.trim()) {
    const imgCheck = validateImageDataUrl(image.trim());
    if (imgCheck.valid) {
      activeUser = await prisma.user.update({
        where: { id: user.id },
        data: { image: image.trim() },
      });
    }
  }

  // Trim sensitive password hash before returning
  if ((activeUser as any).passwordHash) {
    const { passwordHash: _, ...safeUser } = activeUser as any;
    activeUser = safeUser;
  }

  const response = successResponse({ user: activeUser });
  response.cookies.set(
    SESSION_COOKIE,
    await signSession({ userId: user.id, role: user.role }),
    sessionCookieOptions()
  );
  return response;
});
