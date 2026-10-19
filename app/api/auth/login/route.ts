import { prisma } from "@/lib/db";
import { withErrorHandler, successResponse, errorResponse } from "@/lib/api/response";
import { AppError } from "@/lib/api/errors";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth/session";

export const POST = withErrorHandler(async (request: Request) => {
  const body = await request.json();
  const { email } = body;

  if (!email || typeof email !== "string") {
    throw new AppError("Valid email is required", 400, "INVALID_EMAIL");
  }

  const normalizedEmail = email.trim().toLowerCase();
  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    // If not found in dev database, auto-create a default solver account for easy access
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: normalizedEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, " "),
        role: "SOLVER",
        tokens: 50,
        credibilityScore: 1.0,
      },
    });
  }

  const response = successResponse({ user });
  response.cookies.set(
    SESSION_COOKIE,
    await signSession({ userId: user.id, role: user.role }),
    sessionCookieOptions()
  );
  return response;
});
