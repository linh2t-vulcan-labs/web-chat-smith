import type { ApiError } from "@cs/api-client/errors/api-error";
import {
  isLikelyBot,
  validateGuestRequest,
} from "@cs/api-client/server/guest/security";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { apiErrorResponse } from "../../_shared";

/**
 * Shared origin/referer + bot check for every `app/api/anon/session/*`
 * route. Returns the 403 response to send back when the request should be
 * rejected, or `null` when the request may proceed.
 */
export const guestRequestGuard = (
  request: NextRequest
): NextResponse | null => {
  const validation = validateGuestRequest(request);
  if (!validation.isValid) {
    return NextResponse.json({ message: validation.error }, { status: 403 });
  }
  if (isLikelyBot(request)) {
    return NextResponse.json(
      { message: "Automated requests not allowed" },
      { status: 403 }
    );
  }
  return null;
};

/**
 * Maps an `ApiError` to the JSON error shape every `app/api/anon/session/*`
 * route sends back to the client, falling back to `fallbackStatus` when the
 * error carries no `httpStatus` of its own.
 */
export const guestApiErrorResponse = (
  error: ApiError,
  fallbackStatus: number
): NextResponse => apiErrorResponse(error, fallbackStatus);
