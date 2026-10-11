import { runCalibrationSuite } from "@/lib/scoring/calibrationData";
import { withErrorHandler, successResponse } from "@/lib/api/response";

export const GET = withErrorHandler(async () => {
  const report = runCalibrationSuite();
  return successResponse(report);
});
