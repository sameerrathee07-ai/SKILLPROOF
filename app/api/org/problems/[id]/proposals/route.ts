import { PitchService } from "@/lib/services/pitch.service";
import { withErrorHandler, successResponse } from "@/lib/api/response";

export const GET = withErrorHandler(
  async (_request: Request, { params }: { params: { id: string } }) => {
    const vettedInbox = await PitchService.getVettedInbox(params.id);
    return successResponse(vettedInbox);
  }
);
