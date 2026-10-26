import { PitchService } from "@/lib/services/pitch.service";
import { withErrorHandler, successResponse } from "@/lib/api/response";
import { getRequestUser } from "@/lib/auth/request-user";
import { UnauthorizedError } from "@/lib/api/errors";

export const GET = withErrorHandler(
  async (_request: Request, { params }: { params: { id: string } }) => {
    const user = await getRequestUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const vettedInbox = await PitchService.getVettedInbox(params.id, {
      id: user.id,
      role: user.role,
    });
    return successResponse(vettedInbox);
  }
);
