import { prisma } from "@/lib/db";
import { withErrorHandler, successResponse } from "@/lib/api/response";
import { AppError } from "@/lib/api/errors";

export const POST = withErrorHandler(async (request: Request) => {
  const body = await request.json();
  const { name, email, role } = body;

  if (!email || !name) {
    throw new AppError("Name and Email are required", 400, "MISSING_FIELDS");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    return successResponse({ user: existing });
  }

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      role: role === "POSTER" ? "POSTER" : "SOLVER",
      tokens: 50,
      credibilityScore: 1.0,
    },
  });

  return successResponse({ user }, 201);
});
