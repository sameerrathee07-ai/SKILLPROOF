import { PitchService } from "@/lib/services/pitch.service";
import { withErrorHandler, successResponse } from "@/lib/api/response";
import { UnauthorizedError, ValidationError } from "@/lib/api/errors";
import { readJsonBody } from "@/lib/api/request-body";
import { getRequestUser } from "@/lib/auth/request-user";

export const PATCH = withErrorHandler(
  async (request: Request, { params }: { params: { id: string } }) => {
    const user = await getRequestUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const body = await readJsonBody(request);
    if (typeof body?.status !== "string") {
      throw new ValidationError("Proposal status is required.");
    }

    const proposal = await PitchService.updateProposalStatus(
      params.id,
      user,
      body.status,
      typeof body.posterNotes === "string" ? body.posterNotes : undefined
    );

    return successResponse(proposal);
  }
);
