import { ProblemService } from "@/lib/services/problem.service";
import { withErrorHandler, successResponse } from "@/lib/api/response";

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
  const problem = await ProblemService.createProblem(body);
  return successResponse(problem, 201);
});
