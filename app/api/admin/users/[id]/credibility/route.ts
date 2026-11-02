import { UserService } from "@/lib/services/user.service";
import { withErrorHandler, successResponse } from "@/lib/api/response";
import {
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/api/errors";
import { readJsonBody } from "@/lib/api/request-body";
import { getRequestUser } from "@/lib/auth/request-user";

export const dynamic = "force-dynamic";

export const PATCH = withErrorHandler(
  async (request: Request, { params }: { params: { id: string } }) => {
    const user = await getRequestUser();
    if (!user) throw new UnauthorizedError();
    if (user.role !== "ADMIN") throw new ForbiddenError();

    const body = await readJsonBody(request);
    const delta = body?.delta;
    if (
      typeof delta !== "number" ||
      !Number.isFinite(delta) ||
      delta === 0 ||
      Math.abs(delta) > 10
    ) {
      throw new ValidationError(
        "Credibility change must be a non-zero number between -10 and 10."
      );
    }

    const updated = await UserService.adjustSolverCredibility(params.id, delta);
    return successResponse(updated);
  }
);
