import type { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Shared request-validation primitives for the anon + auth-v2 API route groups.
 *
 * Only the byte-identical validators live here: `validateJsonRequest`,
 * `validateHeaders`, `validateCountryCode`. Group-specific validators (token
 * format, per-endpoint "complete" validators, etc.) stay in each group's own
 * `validation.ts`. Each group injects its OWN error handler — their error
 * response bodies/codes differ by design, so that handler is NOT shared here.
 */

const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/u;

/** The error-handler surface the shared JSON validator depends on. */
export interface TValidatorErrorHandler {
  handleValidationError: (error: z.ZodError) => NextResponse;
  createErrorResponse: (message: string, statusCode: number) => NextResponse;
}

export interface CreateRequestValidatorOptions {
  errorHandler: TValidatorErrorHandler;
}

/**
 * Validates request headers. Pure (no injected deps) → module scope.
 */
export const validateHeaders = (
  request: NextRequest
): {
  isValid: boolean;
  error?: string;
} => {
  const contentType = request.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return {
      error: "Content-Type must be application/json",
      isValid: false,
    };
  }

  return { isValid: true };
};

/**
 * Validates country code format. Pure (no injected deps) → module scope.
 */
export const validateCountryCode = (
  countryCode: string | null
): {
  isValid: boolean;
  error?: string;
} => {
  if (!countryCode) {
    return { isValid: true }; // Country code is optional
  }

  // Basic country code validation (2-letter ISO code)
  if (!COUNTRY_CODE_PATTERN.test(countryCode)) {
    return {
      error: "Country code must be a 2-letter ISO code",
      isValid: false,
    };
  }

  return { isValid: true };
};

export function createRequestValidator({
  errorHandler,
}: CreateRequestValidatorOptions) {
  const validateJsonRequest = async <T>(
    request: NextRequest,
    schema: z.ZodSchema<T>
  ): Promise<
    { success: true; data: T } | { success: false; error: NextResponse }
  > => {
    try {
      const body = await request.json();
      const validatedData = schema.parse(body);

      return {
        data: validatedData,
        success: true,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          error: errorHandler.handleValidationError(error),
          success: false,
        };
      }

      return {
        error: errorHandler.createErrorResponse(
          "Invalid JSON request body",
          400
        ),
        success: false,
      };
    }
  };

  return { validateCountryCode, validateHeaders, validateJsonRequest };
}
