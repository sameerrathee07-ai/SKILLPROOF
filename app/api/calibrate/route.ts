import { runCalibrationSuite } from "@/lib/scoring/calibrationData";
import { withErrorHandler, successResponse } from "@/lib/api/response";
import { ForbiddenError, UnauthorizedError } from "@/lib/api/errors";
import { getRequestUser } from "@/lib/auth/request-user";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  const user = await getRequestUser();
  if (!user) throw new UnauthorizedError();
  if (user.role !== "ADMIN") throw new ForbiddenError();

  const report = runCalibrationSuite();
  return successResponse(report);
});
