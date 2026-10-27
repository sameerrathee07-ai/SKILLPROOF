import { PitchService } from "@/lib/services/pitch.service";
import { withErrorHandler, successResponse } from "@/lib/api/response";
import { UnauthorizedError } from "@/lib/api/errors";
import { getRequestUser } from "@/lib/auth/request-user";

export const GET = withErrorHandler(
  async (_request: Request, { params }: { params: { id: string } }) => {
    const user = await getRequestUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const proposal = await PitchService.getProposalForReview(params.id, user);
    return successResponse(proposal);
  }
);
