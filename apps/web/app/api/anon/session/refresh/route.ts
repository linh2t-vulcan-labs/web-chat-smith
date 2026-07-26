import {
  isLikelyBot,
  validateGuestRequest,
} from "@cs/api-client/server/guest/security";
import { refreshGuestSession } from "@cs/api-client/server/guest/session";
import { decodeJwtExpiryMs } from "@cs/core/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * `getGuestTokenManager()`'s `refreshEndpoint` — called by the proactive
 * timer and by reactive 401 handling, always forcing a real rotation of the
 * guest access token via the stored refresh token (never cache-first, unlike
 * `GET /api/anon/session`).
 */
export const POST = async (request: NextRequest) => {
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

  const [error, result] = await refreshGuestSession();
  if (error) {
    return NextResponse.json(
      {
        code: error.code,
        details: error.details,
        message: error.message,
        reason: error.reason,
        status: error.status,
      },
      { status: error.httpStatus || 401 }
    );
  }

  return NextResponse.json({
    accessToken: result.accessToken,
    accessTokenExpiresAt: decodeJwtExpiryMs(result.accessToken),
  });
};
