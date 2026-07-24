import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { HTTP_STATUS } from "@/utils/constants/http";

import { AnonSecurityMiddleware } from "../../middleware/security";
import { AnonCookieManager } from "../../utils/cookie-manager";
import { AnonErrorHandler } from "../../utils/error-handler";
import { AnonLogger } from "../../utils/logger";

/**
 * GET /api/anon/session/verify
 * Checks if captcha has been verified for this user
 *
 * Security Features:
 * - Origin validation
 * - Rate limiting protection
 * - Cookie-based verification tracking
 */
export async function GET(request: NextRequest) {
  const securityContext =
    AnonSecurityMiddleware.extractSecurityContext(request);

  try {
    // Security validation
    const securityValidation = AnonSecurityMiddleware.validateRequest(request);
    if (!securityValidation.isValid) {
      return AnonErrorHandler.handleSecurityError(
        securityValidation.error ?? "Request origin not allowed"
      );
    }

    // Rate limiting check
    const rateLimitCheck = await AnonSecurityMiddleware.checkRateLimit(
      request,
      securityContext.ip || "unknown"
    );
    if (!rateLimitCheck.isValid) {
      return AnonErrorHandler.handleRateLimitError(rateLimitCheck.retryAfter);
    }

    // Check if guest session exists first
    const guestToken = await AnonCookieManager.getGuestSessionCookie();

    // If guest session cookie does not exist, return false and clear captcha token
    const isVerified = !!guestToken;

    if (!guestToken) {
      await AnonCookieManager.clearGuestSessionCookie();
    }

    // Return verification status
    return NextResponse.json(
      {
        data: {
          isVerified,
        },
        success: true,
      },
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    AnonLogger.logError(error as Error, securityContext, {
      location: "GET /api/anon/session/verify",
    });

    return AnonErrorHandler.handleServerError(error as Error);
  }
}
