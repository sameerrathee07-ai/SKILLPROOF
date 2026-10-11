import { NextResponse } from "next/server";
import { AppError } from "./errors";

/**
 * Standardized success response builder
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Standardized error response builder with error classification
 */
export function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  const errMessage = error instanceof Error ? error.message : "Internal server error";
  console.error("[Unhandled API Error]:", error);

  return NextResponse.json(
    {
      error: errMessage,
      code: "INTERNAL_SERVER_ERROR",
    },
    { status: 500 }
  );
}

/**
 * Higher-order wrapper for Next.js route handlers
 */
export function withErrorHandler<T = any>(
  handler: (request: Request, context: T) => Promise<NextResponse>
) {
  return async (request: Request, context: T): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
