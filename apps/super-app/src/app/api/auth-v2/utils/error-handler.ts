import { NextResponse } from "next/server";

import { HTTP_STATUS } from "@/utils/constants/http";

import type { TApiError, TAuthResponse } from "../types";

/**
 * Returns user-friendly error messages
 */
function getUserFriendlyMessage(
  errorCode: string,
  _statusCode: number
): string {
  const messages: Record<string, string> = {
    AUTH_ERROR: "Authentication failed. Please sign in again",
    RATE_LIMIT_ERROR: "Too many requests. Please try again later",
    REFRESH_ERROR: "Unable to refresh your session. Please sign in again",
    SECURITY_ERROR: "Request not allowed",
    SERVER_ERROR: "Something went wrong. Please try again later",
    VALIDATION_ERROR: "Please check your request and try again",
  };

  return messages[errorCode] || "An error occurred. Please try again";
}

/**
 * Centralized error handling utility for auth-v2 API routes
 * Follows SOLID principles and provides consistent error responses
 */
export const ErrorHandler = {
  /**
   * Creates a standardized error response
   */
  createErrorResponse(
    error: TApiError | Error | string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR
  ): NextResponse<TAuthResponse> {
    let errorMessage: string;
    let errorCode: string;

    if (typeof error === "string") {
      errorMessage = error;
      errorCode = "UNKNOWN_ERROR";
    } else if (error instanceof Error) {
      errorMessage = error.message;
      errorCode = error.name || "ERROR";
    } else {
      errorMessage = error.message;
      errorCode = error.code;
    }

    // Log error for debugging (in production, use proper logging service)
    console.error(`[AuthV2 API Error] ${errorCode}: ${errorMessage}`, {
      statusCode,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: errorMessage,
        message: getUserFriendlyMessage(errorCode, statusCode),
        success: false,
      },
      { status: statusCode }
    );
  },

  /**
   * Handles authentication errors
   */
  handleAuthError(error: string | Error): NextResponse<TAuthResponse> {
    return ErrorHandler.createErrorResponse(
      {
        code: "AUTH_ERROR",
        message: typeof error === "string" ? error : error.message,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      },
      HTTP_STATUS.UNAUTHORIZED
    );
  },

  /**
   * Handles rate limiting errors
   */
  handleRateLimitError(retryAfter?: number): NextResponse<TAuthResponse> {
    const headers: Record<string, string> = {};
    if (retryAfter) {
      headers["Retry-After"] = retryAfter.toString();
    }

    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Please try again later",
        success: false,
      },
      {
        headers,
        status: HTTP_STATUS.BAD_REQUEST,
      }
    );
  },

  /**
   * Handles token refresh errors
   */
  handleRefreshError(error: string | Error): NextResponse<TAuthResponse> {
    return ErrorHandler.createErrorResponse(
      {
        code: "REFRESH_ERROR",
        message: typeof error === "string" ? error : error.message,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      },
      HTTP_STATUS.UNAUTHORIZED
    );
  },

  /**
   * Handles security violations
   */
  handleSecurityError(error: string): NextResponse<TAuthResponse> {
    return ErrorHandler.createErrorResponse(
      {
        code: "SECURITY_ERROR",
        message: error,
        statusCode: HTTP_STATUS.FORBIDDEN,
      },
      HTTP_STATUS.FORBIDDEN
    );
  },

  /**
   * Handles server errors
   */
  handleServerError(_error: Error): NextResponse<TAuthResponse> {
    return ErrorHandler.createErrorResponse(
      {
        code: "SERVER_ERROR",
        message: "Internal server error",
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      },
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  },

  /**
   * Handles validation errors
   */
  handleValidationError(error: unknown): NextResponse<TAuthResponse> {
    const message =
      (error as { issues?: { message?: string }[] })?.issues?.[0]?.message ||
      "Invalid request data";
    return ErrorHandler.createErrorResponse(
      {
        code: "VALIDATION_ERROR",
        message,
        statusCode: HTTP_STATUS.BAD_REQUEST,
      },
      HTTP_STATUS.BAD_REQUEST
    );
  },

  /**
   * Wraps async functions with error handling
   */
  async withErrorHandling<T>(
    handler: () => Promise<T>
  ): Promise<NextResponse<TAuthResponse> | T> {
    try {
      return await handler();
    } catch (error) {
      if (error instanceof Error) {
        return ErrorHandler.handleServerError(error);
      }
      return ErrorHandler.createErrorResponse("Unknown error occurred");
    }
  },
};
