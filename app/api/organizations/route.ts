import { prisma } from "@/lib/db";
import { OrganizationService } from "@/lib/services/organization.service";
import { withErrorHandler, successResponse } from "@/lib/api/response";
import { UnauthorizedError } from "@/lib/api/errors";
import { getRequestUser } from "@/lib/auth/request-user";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("mine") === "1") {
    const user = await getRequestUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const organization = await prisma.organization.findFirst({
      where: { ownerId: user.id },
      include: {
        _count: {
          select: { problems: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return successResponse(organization ? [organization] : []);
  }

  const orgs = await OrganizationService.listOrganizations();
  return successResponse(orgs);
});
