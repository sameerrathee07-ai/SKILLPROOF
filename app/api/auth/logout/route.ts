import { withErrorHandler, successResponse } from "@/lib/api/response";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";

export const POST = withErrorHandler(async () => {
  const response = successResponse({ success: true });
  response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return response;
});
