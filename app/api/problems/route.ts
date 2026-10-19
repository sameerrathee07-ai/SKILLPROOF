import { ProblemService } from "@/lib/services/problem.service";
import { withErrorHandler, successResponse } from "@/lib/api/response";
import { getSessionUser } from "@/lib/auth/session";

export const GET = withErrorHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const organizationId = searchParams.get("organizationId");

  const problems = await ProblemService.listProblems({
    category,
    organizationId,
  });

  return successResponse(problems);
});

export const POST = withErrorHandler(async (request: Request) => {
  const body = await request.json();
  const user = await getSessionUser();
  const problem = await ProblemService.createProblem({ ...body, postedById: user?.id });
  return successResponse(problem, 201);
});
