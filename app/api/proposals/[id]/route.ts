import { PitchService } from "@/lib/services/pitch.service";
import { withErrorHandler, successResponse } from "@/lib/api/response";

export const GET = withErrorHandler(
  async (_request: Request, { params }: { params: { id: string } }) => {
    const proposal = await PitchService.getPitchById(params.id);
    return successResponse(proposal);
  }
);
