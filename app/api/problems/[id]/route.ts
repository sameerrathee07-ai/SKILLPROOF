import { ProblemService } from "@/lib/services/problem.service";
import { withErrorHandler, successResponse } from "@/lib/api/response";

export const GET = withErrorHandler(
  async (_request: Request, { params }: { params: { id: string } }) => {
    const problem = await ProblemService.getProblemById(params.id);
    return successResponse(problem);
  }
);
