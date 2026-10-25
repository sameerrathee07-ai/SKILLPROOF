import { prisma } from "@/lib/db";
import { withErrorHandler, successResponse } from "@/lib/api/response";
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
  const body = await request.json();
  const reqUser = await getRequestUser();

  const updateData: {
    name?: string;
    image?: string | null;
    role?: string;
    age?: number | null;
    company?: string | null;
    bio?: string | null;
    headline?: string | null;
  } = {};

  if (body.name !== undefined) updateData.name = String(body.name).trim();
  if (body.image !== undefined) updateData.image = body.image ? String(body.image).trim() : null;
  if (body.role !== undefined && ["SOLVER", "POSTER", "ADMIN"].includes(body.role)) {
    updateData.role = body.role;
  }
  if (body.age !== undefined) {
    updateData.age = body.age === "" || body.age === null ? null : Number(body.age);
  }
  if (body.company !== undefined) updateData.company = body.company ? String(body.company).trim() : null;
  if (body.bio !== undefined) updateData.bio = body.bio ? String(body.bio).trim() : null;
  if (body.headline !== undefined) updateData.headline = body.headline ? String(body.headline).trim() : null;

  if (reqUser) {
    const updatedUser = await prisma.user.update({
      where: { id: reqUser.id },
      data: updateData,
    });
    return successResponse({ user: updatedUser });
  }

  // If guest, echo back the merged update for local auth state
  return successResponse({ user: { id: "guest", ...updateData } });
});
