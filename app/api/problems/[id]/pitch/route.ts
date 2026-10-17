import { PitchService } from "@/lib/services/pitch.service";
import { withErrorHandler, successResponse } from "@/lib/api/response";
import { validateFullPitch } from "@/lib/validations/pitch.schema";
import { ValidationError } from "@/lib/api/errors";

export const POST = withErrorHandler(
  async (request: Request, { params }: { params: { id: string } }) => {
    if (!params?.id) {
      throw new ValidationError("Missing target problem ID.");
    }

    const body = await request.json();
    const { pitchInput, solverId, revisionCount } = body;

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
      solverId,
      revisionCount,
    });

    return successResponse(result, 201);
  }
);
