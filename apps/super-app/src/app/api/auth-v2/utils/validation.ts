import type { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { HTTP_STATUS } from "@/utils/constants/http";

import { createRequestValidator } from "../../_shared/request-validation";
import { RefreshTokenRequestSchema, VerifyTokenRequestSchema } from "../types";
import { ErrorHandler } from "./error-handler";

const TOKEN_PART_PATTERN = /^[A-Za-z0-9_-]+$/u;

const base = createRequestValidator({ errorHandler: ErrorHandler });

/**
 * Request validation utility for auth-v2 API routes.
 * Shared primitives (validateJsonRequest / validateHeaders / validateCountryCode)
 * come from the request-validation factory; the methods below are auth-v2 specific.
 */
export const RequestValidator = {
  ...base,
  /**
   * Validates provider format
   */
  validateProvider(provider: string): {
    isValid: boolean;
    error?: string;
  } {
    const allowedProviders = ["google", "facebook", "apple"];

    if (!provider || typeof provider !== "string") {
      return {
        error: "Provider must be a non-empty string",
        isValid: false,
      };
    }

    if (!allowedProviders.includes(provider.toLowerCase())) {
      return {
        error: `Provider must be one of: ${allowedProviders.join(", ")}`,
        isValid: false,
      };
    }

    return { isValid: true };
  },

  /**
   * Validates refresh token request (can be empty body)
   */
  async validateRefreshTokenRequest(
    request: NextRequest
  ): Promise<
    | { success: true; data: z.infer<typeof RefreshTokenRequestSchema> }
    | { success: false; error: NextResponse }
  > {
    try {
      const body = await request.json();

      // Refresh token request can have empty body or optional refreshToken
      const validatedData = RefreshTokenRequestSchema.parse(body || {});

      return {
        data: validatedData,
        success: true,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          error: ErrorHandler.handleValidationError(error),
          success: false,
        };
      }

      return {
        error: ErrorHandler.createErrorResponse(
          "Invalid JSON request body",
          400
        ),
        success: false,
      };
    }
  },

  /**
   * Validates token format (basic validation)
   */
  validateTokenFormat(token: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!token || typeof token !== "string") {
      return {
        error: "Token must be a non-empty string",
        isValid: false,
      };
    }

    // Basic JWT format validation (3 parts separated by dots)
    const parts = token.split(".");
    if (parts.length !== 3) {
      return {
        error: "Invalid token format",
        isValid: false,
      };
    }

    // Check if each part is base64-like (basic validation)
    for (const part of parts) {
      if (!part || !TOKEN_PART_PATTERN.test(part)) {
        return {
          error: "Invalid token format",
          isValid: false,
        };
      }
    }

    return { isValid: true };
  },

  /**
   * Validates verify token request
   */
  validateVerifyTokenRequest(
    request: NextRequest
  ): Promise<
    | { success: true; data: z.infer<typeof VerifyTokenRequestSchema> }
    | { success: false; error: NextResponse }
  > {
    return RequestValidator.validateJsonRequest(
      request,
      VerifyTokenRequestSchema
    );
  },

  /**
   * Comprehensive request validation for verify token
   */
  async validateVerifyTokenRequestComplete(request: NextRequest): Promise<
    | {
        success: true;
        data: { token: string; provider: string; countryCode: string | null };
      }
    | { success: false; error: NextResponse }
  > {
    // Validate headers
    const headerValidation = RequestValidator.validateHeaders(request);
    if (!headerValidation.isValid) {
      if (!headerValidation.error) {
        throw new Error("Header validation failed without an error message");
      }
      return {
        error: ErrorHandler.createErrorResponse(
          headerValidation.error,
          HTTP_STATUS.BAD_REQUEST
        ),
        success: false,
      };
    }

    // Validate JSON body
    const bodyValidation =
      await RequestValidator.validateVerifyTokenRequest(request);
    if (!bodyValidation.success) {
      return bodyValidation;
    }

    const { token, provider } = bodyValidation.data;

    // Validate token format
    const tokenValidation = RequestValidator.validateTokenFormat(token);
    if (!tokenValidation.isValid) {
      if (!tokenValidation.error) {
        throw new Error("Token validation failed without an error message");
      }
      return {
        error: ErrorHandler.createErrorResponse(
          tokenValidation.error,
          HTTP_STATUS.BAD_REQUEST
        ),
        success: false,
      };
    }

    // Validate provider
    const providerValidation = RequestValidator.validateProvider(provider);
    if (!providerValidation.isValid) {
      if (!providerValidation.error) {
        throw new Error("Provider validation failed without an error message");
      }
      return {
        error: ErrorHandler.createErrorResponse(
          providerValidation.error,
          HTTP_STATUS.BAD_REQUEST
        ),
        success: false,
      };
    }

    // Get and validate country code
    const countryCode = request.headers.get("cf-ipcountry");
    const countryValidation = RequestValidator.validateCountryCode(countryCode);
    if (!countryValidation.isValid) {
      if (!countryValidation.error) {
        throw new Error(
          "Country code validation failed without an error message"
        );
      }
      return {
        error: ErrorHandler.createErrorResponse(
          countryValidation.error,
          HTTP_STATUS.BAD_REQUEST
        ),
        success: false,
      };
    }

    return {
      data: {
        countryCode,
        provider,
        token,
      },
      success: true,
    };
  },
};
