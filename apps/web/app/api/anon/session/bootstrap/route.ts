import {
  isLikelyBot,
  validateGuestRequest,
} from "@cs/api-client/server/guest/security";
import { bootstrapGuestSession } from "@cs/api-client/server/guest/session";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * GET /api/anon/bootstrap equivalent — issues a CSRF token + nonce bound to
 * our origin. Not called by `TokenManager` directly (it self-bootstraps
 * lazily inside `createGuestSession`/`refreshGuestSession` when the CSRF
 * cookie is missing) — exposed as its own route for parity with
 * apps/super-app and as the integration point a future captcha widget would
 * call before `POST`-ing a captcha token to session creation.
 */
export const GET = async (request: NextRequest) => {
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

  const [error, bootstrap] = await bootstrapGuestSession();
  if (error) {
    return NextResponse.json(
      {
        code: error.code,
        details: error.details,
        message: error.message,
        reason: error.reason,
        status: error.status,
      },
      { status: error.httpStatus || 502 }
    );
  }

  return NextResponse.json(bootstrap);
};
