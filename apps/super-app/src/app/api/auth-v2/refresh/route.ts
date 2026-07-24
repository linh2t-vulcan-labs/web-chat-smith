import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { userServerService } from "@/core/repositories";
import { HTTP_STATUS } from "@/utils/constants/http";

import { SecurityMiddleware } from "../middleware/security";
import type { TRefreshTokenResponse } from "../types";
import { CookieManager } from "../utils/cookie-manager";
import { ErrorHandler } from "../utils/error-handler";
import { AuthLogger } from "../utils/logger";
import { getProxyHeaders } from "../utils/proxy-headers";
import { RequestValidator } from "../utils/validation";

/**
 * POST /api/auth-v2/refresh
 * Refreshes authentication tokens using refresh token from cookies
 *
 * Security Features:
 * - Origin validation (only allows requests from same domain)
 * - Request validation using Zod schemas
 * - Rate limiting protection
 * - Structured logging for security monitoring
 * - Secure cookie configuration
 * - Refresh token validation
 */
export async function POST(request: NextRequest) {
  const securityContext = SecurityMiddleware.extractSecurityContext(request);

  try {
    // Security validation
    const securityValidation = SecurityMiddleware.validateRequest(request);
    if (!securityValidation.isValid) {
      if (!securityValidation.error) {
        throw new Error("Security validation failed without an error message");
      }
      return ErrorHandler.handleSecurityError(securityValidation.error);
    }

    // Content-Type validation
    const contentTypeValidation =
      SecurityMiddleware.validateContentType(request);
    if (!contentTypeValidation.isValid) {
      if (!contentTypeValidation.error) {
        throw new Error(
          "Content-Type validation failed without an error message"
        );
      }
      return ErrorHandler.createErrorResponse(
        contentTypeValidation.error,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Rate limiting check
    const rateLimitCheck = await SecurityMiddleware.checkRateLimit(
      request,
      securityContext.ip || "unknown"
    );
    if (!rateLimitCheck.isValid) {
      return ErrorHandler.handleRateLimitError(rateLimitCheck.retryAfter);
    }

    // Get refresh token from encrypted VULCAN_AUTH_TOKEN cookie
    const refreshToken = await CookieManager.getRefreshTokenFromEncrypted();
    if (!refreshToken) {
      // Clear corrupted cookies and return auth error
      await CookieManager.clearAuthCookies();
      return ErrorHandler.handleAuthError("Refresh token not found");
    }

    // Validate refresh token format
    const tokenValidation = RequestValidator.validateTokenFormat(refreshToken);
    if (!tokenValidation.isValid) {
      if (!tokenValidation.error) {
        throw new Error("Token validation failed without an error message");
      }
      return ErrorHandler.handleAuthError(tokenValidation.error);
    }

    // Refresh token
    const [error, result] = await userServerService.refreshToken(
      refreshToken,
      false,
      getProxyHeaders(request)
    );

    if (error) {
      AuthLogger.logError(
        error.message || "Token refresh failed",
        securityContext,
        {
          externalServiceError: error.error
            ? JSON.stringify(error.error)
            : undefined,
          refreshToken: `${refreshToken.slice(0, 20)}...`,
          statusCode: error.status,
        }
      );
      await CookieManager.clearAuthCookies();
      return ErrorHandler.handleRefreshError("Failed to refresh token");
    }

    // Validate cookie security settings
    if (!CookieManager.validateCookieSecurity()) {
      AuthLogger.logError(
        "Invalid cookie security configuration",
        securityContext
      );
      return ErrorHandler.handleServerError(
        new Error("Cookie security configuration invalid")
      );
    }

    // Update authentication cookies (now async)
    await CookieManager.updateTokenCookies(
      result.accessToken,
      result.refreshToken
    );

    // Return success response
    const response: TRefreshTokenResponse = {
      data: {
        accessToken: result.accessToken,
      },
      message: "Token refresh successful",
      success: true,
    };

    return NextResponse.json(response, { status: HTTP_STATUS.OK });
  } catch (error) {
    AuthLogger.logError(error as Error, securityContext);
    return ErrorHandler.handleServerError(error as Error);
  }
}
