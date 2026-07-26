import { setSessionCookies } from "@cs/api-client/server/cookies";
import { ensureServerAccessToken } from "@cs/api-client/server/server-fetch";
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
 * `verifyOAuthToken` (see docs/runbook/api-client.md §4.1/§16). `provider`
 * defaults to the bare backend provider key ("google", the
 * `/oauth/{provider}/token` path segment), matching
 * `apps/super-app/src/core/repositories/user-service.ts` — not Firebase's
 * dotted `sign_in_provider` format ("google.com"), which the backend
 * rejects.
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
    provider: body.provider ?? "google",
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

/**
 * Called once per browser tab by `TokenManager.restoreSessionOnce()` on cold
 * load — reuses `ensureServerAccessToken()` (already used internally by
 * `serverFetch()` for Server Components), which reads the mirrored
 * `access_token` cookie first and only rotates via `refreshServerSession()`
 * when it's missing/expired. Unlike `POST /api/auth/refresh` (used by the
 * proactive timer and reactive 401 handling, which both need a REAL rotation
 * every time), this route deliberately avoids forcing a refresh-token
 * rotation just because the tab reloaded.
 */
export const GET = async () => {
  const [error, accessToken] = await ensureServerAccessToken();

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

  return NextResponse.json({ accessToken });
};
