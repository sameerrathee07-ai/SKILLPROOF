import { prisma } from "@/lib/db";
import { withErrorHandler, successResponse } from "@/lib/api/response";
import { UnauthorizedError } from "@/lib/api/errors";
import { getRequestUser } from "@/lib/auth/request-user";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  const user = await getRequestUser();
  if (!user) {
    throw new UnauthorizedError();
  }

  const submissions = await prisma.pitch.findMany({
    where: { solverId: user.id },
    select: {
      id: true,
      problemId: true,
      score: true,
      passed: true,
      status: true,
      createdAt: true,
      problem: {
        select: {
          title: true,
          frictionCategory: true,
          organization: { select: { name: true, type: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return successResponse(submissions);
});
