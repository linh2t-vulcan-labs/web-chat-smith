import { setSessionCookies } from "@cs/api-client/server/cookies";
import { userManagement } from "@cs/api-client/services/user-management";
import { decodeJwtExpiryMs } from "@cs/core/jwt";
import { NextResponse } from "next/server";

interface ExchangeRequestBody {
  idToken?: string;
  provider?: string;
  projectId?: string;
  countryCode?: string;
}

/**
 * Firebase ID token -> Vulcan access/refresh token exchange (same-origin,
 * no CORS needed). Reuses the exact contract `temp/` already had for
 * `verifyOAuthToken` (see docs/runbook/api-client.md §4.1/§16).
 */
export const POST = async (request: Request) => {
  const body = (await request
    .json()
    .catch(() => null)) as ExchangeRequestBody | null;

  if (!(body?.idToken && body.projectId)) {
    return NextResponse.json(
      {
        message: "idToken and projectId are required",
        reason: "ERROR_INVALID_REQUEST",
      },
      { status: 400 }
    );
  }

  const [error, result] = await userManagement.verifyOAuthToken({
    countryCode: body.countryCode,
    idToken: body.idToken,
    projectId: body.projectId,
    provider: body.provider ?? "google.com",
  });

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

  const accessTokenExpiresAt = decodeJwtExpiryMs(result.accessToken);
  await setSessionCookies({
    accessToken: result.accessToken,
    accessTokenExpiresAt,
    refreshToken: result.refreshToken,
  });

  return NextResponse.json({
    accessToken: result.accessToken,
    accessTokenExpiresAt,
  });
};
