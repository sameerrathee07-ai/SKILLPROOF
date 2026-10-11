import { OrganizationService } from "@/lib/services/organization.service";
import { withErrorHandler, successResponse } from "@/lib/api/response";

export const GET = withErrorHandler(async () => {
  const orgs = await OrganizationService.listOrganizations();
  return successResponse(orgs);
});
