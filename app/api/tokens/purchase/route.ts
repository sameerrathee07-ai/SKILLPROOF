import { prisma } from "@/lib/db";
import { UnauthorizedError, ValidationError } from "@/lib/api/errors";
import { withErrorHandler, successResponse } from "@/lib/api/response";
import { getSessionUser } from "@/lib/auth/session-user";
import { TOKEN_TIERS } from "@/lib/tokens";
import { readJsonBody } from "@/lib/api/request-body";

export const POST = withErrorHandler(async (request: Request) => {
  const user = await getSessionUser();
  if (!user) {
    throw new UnauthorizedError();
  }

  const { tier } = await readJsonBody(request);
  const selected = TOKEN_TIERS.find((t) => t.tier === tier);
  if (!selected) {
    throw new ValidationError("Unknown token tier.");
  }

  const purchase = await prisma.tokenPurchase.create({
    data: {
      userId: user.id,
      tier: selected.tier,
      amount: selected.amount,
      tokens: selected.tokens,
      status: "PENDING",
    },
  });

  return successResponse({ purchase }, 201);
});
