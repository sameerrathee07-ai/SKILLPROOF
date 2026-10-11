import { PitchService } from "@/lib/services/pitch.service";
import { withErrorHandler, successResponse } from "@/lib/api/response";

export const POST = withErrorHandler(
  async (request: Request, { params }: { params: { id: string } }) => {
    const body = await request.json();
    const { pitchInput, solverId, revisionCount } = body;

    const result = await PitchService.submitAndEvaluate({
      problemId: params.id,
      pitchInput,
      solverId,
      revisionCount,
    });

    return successResponse(result, 201);
  }
);
