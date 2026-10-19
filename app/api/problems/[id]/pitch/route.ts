import { PitchService } from "@/lib/services/pitch.service";
import { withErrorHandler, successResponse } from "@/lib/api/response";
import { validateFullPitch } from "@/lib/validations/pitch.schema";
import { UnauthorizedError, ValidationError } from "@/lib/api/errors";
import { getRequestUser } from "@/lib/auth/request-user";

export const POST = withErrorHandler(
  async (request: Request, { params }: { params: { id: string } }) => {
    if (!params?.id) {
      throw new ValidationError("Missing target problem ID.");
    }

    const user = await getRequestUser();
    if (!user) {
      throw new UnauthorizedError("Sign in to submit a pitch.");
    }

    const body = await request.json();
    const { pitchInput, revisionCount } = body;

    const validation = validateFullPitch(pitchInput);
    if (!validation.isValid) {
      throw new ValidationError(
        validation.firstError || "Invalid pitch input.",
        validation.errors
      );
    }

    const result = await PitchService.submitAndEvaluate({
      problemId: params.id,
      pitchInput,
      solverId: user.id,
      revisionCount,
    });

    return successResponse(result, 201);
  }
);
