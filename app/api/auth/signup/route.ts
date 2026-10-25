import { prisma } from "@/lib/db";
import { withErrorHandler, successResponse } from "@/lib/api/response";
import { AppError } from "@/lib/api/errors";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth/session";

export const POST = withErrorHandler(async (request: Request) => {
  const body = await request.json();
  const { name, email, role, image } = body;

  if (!email || !name) {
    throw new AppError("Name and Email are required", 400, "MISSING_FIELDS");
  }

  const normalizedEmail = email.trim().toLowerCase();
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

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      role: role === "POSTER" ? "POSTER" : "SOLVER",
      tokens: 50,
      credibilityScore: 1.0,
      ...(typeof image === "string" && image.trim() ? { image: image.trim() } : {}),
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
