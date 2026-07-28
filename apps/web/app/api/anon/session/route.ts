import { getGuestSessionCookie } from "@cs/api-client/server/guest/cookies";
import {
  isLikelyBot,
  validateGuestRequest,
} from "@cs/api-client/server/guest/security";
import { createGuestSession } from "@cs/api-client/server/guest/session";
import { decodeJwtExpiryMs } from "@cs/core/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * `getGuestTokenManager()`'s `restoreEndpoint` — called once per tab by
 * `restoreSessionOnce()` on cold load. Mirrors `GET /api/auth/session`'s
 * cache-first contract, but is restore-ONLY: returns the existing
 * `guest_session` cookie if present. Deliberately does NOT auto-create —
 * creating a guest session requires a Turnstile captcha token (an async
 * client-side step), which `POST` below handles.
 *
 * "No session" is reported as a plain `200` with `accessToken: null`, NOT a
 * `404` — same reasoning as `GET /api/auth/session` (see that route's doc
 * comment): this is a "check if a session exists" endpoint called on every
 * cold load, and a brand-new visitor with no guest session yet is the
 * expected common case, not an error. A `404` still shows up as a
 * browser-level "Failed to load resource" console entry regardless of how
 * gracefully `TokenManager`/`GuestSessionProvider` handle it.
 * `TokenManager.performCacheFirstRestore()` (shared by both the guest and
 * authenticated identity) already treats `accessToken: null` in a `200` as
 * "no session" — see that method.
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

  const session = await getGuestSessionCookie();
  if (!session) {
    return NextResponse.json({ accessToken: null });
  }

  return NextResponse.json({
    accessToken: session.accessToken,
    accessTokenExpiresAt: decodeJwtExpiryMs(session.accessToken),
  });
};

interface CreateGuestSessionBody {
  captchaToken?: string;
}

/**
 * Creates a guest session from a Turnstile token obtained client-side (see
 * `components/providers/guest-session-provider.tsx`). Short-circuits to the
 * existing `guest_session` cookie first (no captcha needed on that path).
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

  const body = (await request
    .json()
    .catch(() => null)) as CreateGuestSessionBody | null;
  if (!body?.captchaToken) {
    return NextResponse.json(
      { message: "captchaToken is required" },
      { status: 400 }
    );
  }

  const [error, session] = await createGuestSession(body.captchaToken);
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

  return NextResponse.json({
    accessToken: session.accessToken,
    accessTokenExpiresAt: decodeJwtExpiryMs(session.accessToken),
  });
};
