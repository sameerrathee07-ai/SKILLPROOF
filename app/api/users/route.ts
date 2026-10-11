import { UserService } from "@/lib/services/user.service";
import { withErrorHandler, successResponse } from "@/lib/api/response";

export const GET = withErrorHandler(async () => {
  const users = await UserService.listUsers();
  return successResponse(users);
});
