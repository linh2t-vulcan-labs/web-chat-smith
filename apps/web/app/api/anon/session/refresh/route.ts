import { refreshGuestSession } from "@cs/api-client/server/guest/session";
import { decodeJwtExpiryMs } from "@cs/core/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { guestApiErrorResponse, guestRequestGuard } from "../_shared";

/**
 * `getGuestTokenManager()`'s `refreshEndpoint` — called by the proactive
 * timer and by reactive 401 handling, always forcing a real rotation of the
 * guest access token via the stored refresh token (never cache-first, unlike
 * `GET /api/anon/session`).
 */
export const POST = async (request: NextRequest) => {
  const blocked = guestRequestGuard(request);
  if (blocked) {
    return blocked;
  }

  const [error, result] = await refreshGuestSession();
  if (error) {
    return guestApiErrorResponse(error, 401);
  }

  return NextResponse.json({
    accessToken: result.accessToken,
    accessTokenExpiresAt: decodeJwtExpiryMs(result.accessToken),
  });
};
