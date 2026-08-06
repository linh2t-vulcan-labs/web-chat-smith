import type { ApiError } from "@cs/api-client/errors/api-error";
import { NextResponse } from "next/server";

/**
 * Maps an `ApiError` to the JSON error shape every `app/api/*` route sends
 * back to the client, falling back to `fallbackStatus` when the error
 * carries no `httpStatus` of its own.
 */
export const apiErrorResponse = (
  error: ApiError,
  fallbackStatus: number
): NextResponse =>
  NextResponse.json(
    {
      code: error.code,
      details: error.details,
      message: error.message,
      reason: error.reason,
      status: error.status,
    },
    { status: error.httpStatus || fallbackStatus }
  );
