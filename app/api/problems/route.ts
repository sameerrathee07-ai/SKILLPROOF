import { prisma } from "@/lib/db";
import { ProblemService } from "@/lib/services/problem.service";
import { OrganizationService } from "@/lib/services/organization.service";
import { withErrorHandler, successResponse } from "@/lib/api/response";
import {
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/api/errors";
import { getRequestUser } from "@/lib/auth/request-user";

export const GET = withErrorHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const organizationId = searchParams.get("organizationId");

  const problems = await ProblemService.listProblems({
    category,
    organizationId,
  });

  return successResponse(problems);
});

export const POST = withErrorHandler(async (request: Request) => {
  const user = await getRequestUser();
  if (!user) {
    throw new UnauthorizedError();
  }
  if (user.role !== "POSTER" && user.role !== "ADMIN") {
    throw new ForbiddenError("Poster access required.");
  }

  const body = await request.json();
  let organizationId =
    typeof body.organizationId === "string" ? body.organizationId : undefined;

  if (organizationId) {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });
    const canUse =
      organization &&
      (user.role === "ADMIN" || organization.ownerId === user.id);
    if (!canUse) {
      throw new ForbiddenError("You cannot post to this organization.");
    }
  } else {
    const ownedOrganization = await prisma.organization.findFirst({
      where: { ownerId: user.id },
      orderBy: { createdAt: "asc" },
    });

    if (ownedOrganization) {
      organizationId = ownedOrganization.id;
    } else {
      const orgName =
        typeof body.orgName === "string" ? body.orgName : body.organizationName;
      if (!orgName || !orgName.trim()) {
        throw new ValidationError("Organization name is required.");
      }
      const organization = await OrganizationService.findOrCreateOrganization({
        name: orgName,
        type: typeof body.orgType === "string" ? body.orgType : undefined,
        ownerId: user.id,
      });
      organizationId = organization.id;
    }
  }

  const problem = await ProblemService.createProblem({
    title: body.title,
    description: body.description,
    frictionCategory: body.frictionCategory,
    organizationId,
    postedById: user.id,
  });

  return successResponse(problem, 201);
});
