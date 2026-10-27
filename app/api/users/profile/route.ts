import { prisma } from "@/lib/db";
import { withErrorHandler, successResponse } from "@/lib/api/response";
import { UnauthorizedError, ValidationError } from "@/lib/api/errors";
import { readJsonBody } from "@/lib/api/request-body";
import { getRequestUser } from "@/lib/auth/request-user";

export const GET = withErrorHandler(async () => {
  const reqUser = await getRequestUser();
  if (!reqUser) {
    return successResponse({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: reqUser.id },
  });

  return successResponse({ user });
});

export const PATCH = withErrorHandler(async (request: Request) => {
  const reqUser = await getRequestUser();
  if (!reqUser) {
    throw new UnauthorizedError();
  }

  const body = await readJsonBody(request);

  const updateData: {
    name?: string;
    image?: string | null;
    age?: number | null;
    company?: string | null;
    bio?: string | null;
    headline?: string | null;
  } = {};

  if (body.name !== undefined) updateData.name = String(body.name).trim();
  if (body.image !== undefined) updateData.image = body.image ? String(body.image).trim() : null;
  if (body.age !== undefined) {
    if (body.age === "" || body.age === null) {
      updateData.age = null;
    } else {
      const age = Number(body.age);
      if (!Number.isFinite(age) || age < 0 || age > 120) {
        throw new ValidationError("Age must be a number between 0 and 120.");
      }
      updateData.age = Math.trunc(age);
    }
  }
  if (body.company !== undefined) updateData.company = body.company ? String(body.company).trim() : null;
  if (body.bio !== undefined) updateData.bio = body.bio ? String(body.bio).trim() : null;
  if (body.headline !== undefined) updateData.headline = body.headline ? String(body.headline).trim() : null;

  const updatedUser = await prisma.user.update({
    where: { id: reqUser.id },
    data: updateData,
  });
  return successResponse({ user: updatedUser });
});
