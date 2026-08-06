import { bootstrapGuestSession } from "@cs/api-client/server/guest/session";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { guestApiErrorResponse, guestRequestGuard } from "../_shared";

/**
 * GET /api/anon/bootstrap equivalent — issues a CSRF token + nonce bound to
 * our origin. Not called by `TokenManager` directly (it self-bootstraps
 * lazily inside `createGuestSession`/`refreshGuestSession` when the CSRF
 * cookie is missing) — exposed as its own route for parity with
 * apps/super-app and as the integration point a future captcha widget would
 * call before `POST`-ing a captcha token to session creation.
 */
export const GET = async (request: NextRequest) => {
  const blocked = guestRequestGuard(request);
  if (blocked) {
    return blocked;
  }

  const [error, bootstrap] = await bootstrapGuestSession();
  if (error) {
    return guestApiErrorResponse(error, 502);
  }

  return NextResponse.json(bootstrap);
};
