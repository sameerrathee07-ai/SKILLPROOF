import { ProblemService } from "@/lib/services/problem.service";
import { withErrorHandler, successResponse } from "@/lib/api/response";
import { UnauthorizedError, ValidationError } from "@/lib/api/errors";
import { readJsonBody } from "@/lib/api/request-body";
import { getRequestUser } from "@/lib/auth/request-user";

export const GET = withErrorHandler(
  async (_request: Request, { params }: { params: { id: string } }) => {
    const problem = await ProblemService.getProblemById(params.id);
    return successResponse(problem);
  }
);

export const PATCH = withErrorHandler(
  async (request: Request, { params }: { params: { id: string } }) => {
    const user = await getRequestUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const body = await readJsonBody(request);
    if (typeof body?.status !== "string") {
      throw new ValidationError("Problem status is required.");
    }

    const problem = await ProblemService.updateProblemStatus(
      params.id,
      body.status,
      user
    );
    return successResponse(problem);
  }
);
