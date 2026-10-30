import { prisma } from "@/lib/db";
import { withErrorHandler, successResponse } from "@/lib/api/response";
import { AppError } from "@/lib/api/errors";
import { enforceRateLimit, getClientIp } from "@/lib/api/rate-limit";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth/session";
import { checkBotSubmission } from "@/lib/security/bot-protection";
import { sanitizePlainText } from "@/lib/security/sanitize";
import { validateImageDataUrl } from "@/lib/security/upload-guard";
import { readJsonBody } from "@/lib/api/request-body";

export const POST = withErrorHandler(async (request: Request) => {
  await enforceRateLimit({
    key: `auth:signup:${getClientIp(request)}`,
    limit: 10,
    windowMs: 5 * 60 * 1000,
  });

  const body = await readJsonBody(request);

  // Bot protection check
  const botCheck = checkBotSubmission(body, request.headers);
  if (botCheck.isBot) {
    throw new AppError("Request flagged by automated protection.", 403, "BOT_DETECTED");
  }

  const { name, email, role, image } = body;

  if (!email || !name) {
    throw new AppError("Name and Email are required", 400, "MISSING_FIELDS");
  }

  const cleanName = sanitizePlainText(name);
  const normalizedEmail = String(email).trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    throw new AppError(
      "An account with this email already exists. Sign in instead.",
      409,
      "EMAIL_IN_USE"
    );
  }

  // Validate avatar image format if provided
  let safeImage: string | undefined = undefined;
  if (typeof image === "string" && image.trim()) {
    const imgCheck = validateImageDataUrl(image.trim());
    if (imgCheck.valid) {
      safeImage = image.trim();
    }
  }

  const user = await prisma.user.create({
    data: {
      name: cleanName,
      email: normalizedEmail,
      role: role === "POSTER" ? "POSTER" : "SOLVER",
      tokens: 50,
      credibilityScore: 1.0,
      ...(safeImage ? { image: safeImage } : {}),
    },
  });

  const response = successResponse({ user }, 201);
  response.cookies.set(
    SESSION_COOKIE,
    await signSession({ userId: user.id, role: user.role }),
    sessionCookieOptions()
  );
  return response;
});
