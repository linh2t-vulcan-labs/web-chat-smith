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
 * `guest_session` cookie if present, 404s otherwise. Deliberately does NOT
 * auto-create — creating a guest session requires a Turnstile captcha token
 * (an async client-side step), which `POST` below handles.
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
    return NextResponse.json({ message: "No guest session" }, { status: 404 });
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
