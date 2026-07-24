/**
 * Shared structured-logging factory for API security contexts (anon + auth-v2).
 *
 * The anon and auth-v2 route groups previously shipped byte-identical logger
 * objects that differed only by `service` name (and one extra `errorName` field
 * on anon's `logError`). This factory is the single source; each group builds
 * its own logger from it and keeps its original public method names, so no call
 * site changes. Output shape and JSON key order are preserved exactly.
 */

import type { TSecurityContext } from "./security-context";

export interface CreateSecurityLoggerOptions {
  /** `service` field stamped on every log line, e.g. "AnonSession" / "AuthV2". */
  service: string;
  /** anon's `logError` also emits `errorName`; auth-v2 does not. */
  includeErrorName?: boolean;
}

const pickContext = (context: TSecurityContext) => ({
  countryCode: context.countryCode,
  ip: context.ip,
  origin: context.origin,
  userAgent: context.userAgent,
});

export function createSecurityLogger({
  service,
  includeErrorName = false,
}: CreateSecurityLoggerOptions) {
  const logEvent = (
    event: string,
    context: TSecurityContext,
    additionalData?: Record<string, unknown>
  ): void => {
    const logData = {
      context: pickContext(context),
      event,
      timestamp: new Date().toISOString(),
      ...additionalData,
    };

    console.log(JSON.stringify({ level: "info", service, ...logData }));
  };

  const logSecurityEvent = (
    event: string,
    context: TSecurityContext,
    details?: Record<string, unknown>
  ): void => {
    const logData = {
      context: pickContext(context),
      details,
      event: `SECURITY_${event}`,
      timestamp: new Date().toISOString(),
    };

    console.warn(
      JSON.stringify({
        category: "Security",
        level: "warn",
        service,
        ...logData,
      })
    );
  };

  const logError = (
    error: Error | string,
    context: TSecurityContext,
    additionalData?: Record<string, unknown>
  ): void => {
    const logData = {
      timestamp: new Date().toISOString(),
      error: typeof error === "string" ? error : error.message,
      ...(includeErrorName
        ? { errorName: typeof error === "object" ? error.name : undefined }
        : {}),
      stack: typeof error === "object" ? error.stack : undefined,
      context: pickContext(context),
      ...additionalData,
    };

    console.error(
      JSON.stringify({ category: "Error", level: "error", service, ...logData })
    );
  };

  const logSuccess = (
    operation: string,
    context: TSecurityContext,
    additionalData?: Record<string, unknown>
  ): void => {
    const logData = {
      context: pickContext(context),
      operation,
      timestamp: new Date().toISOString(),
      ...additionalData,
    };

    console.log(
      JSON.stringify({
        category: "Success",
        level: "info",
        service,
        ...logData,
      })
    );
  };

  const logPerformance = (
    operation: string,
    duration: number,
    context: TSecurityContext,
    additionalData?: Record<string, unknown>
  ): void => {
    const logData = {
      context: pickContext(context),
      duration: `${duration}ms`,
      operation,
      timestamp: new Date().toISOString(),
      ...additionalData,
    };

    console.log(
      JSON.stringify({
        category: "Performance",
        level: "info",
        service,
        ...logData,
      })
    );
  };

  const logRateLimit = (
    identifier: string,
    context: TSecurityContext,
    retryAfter?: number
  ): void => {
    const logData = {
      context: pickContext(context),
      event: "RATE_LIMIT_EXCEEDED",
      identifier,
      retryAfter,
      timestamp: new Date().toISOString(),
    };

    console.warn(
      JSON.stringify({
        category: "RateLimit",
        level: "warn",
        service,
        ...logData,
      })
    );
  };

  const logValidationFailure = (
    field: string,
    value: unknown,
    context: TSecurityContext,
    error: string
  ): void => {
    const logData = {
      context: pickContext(context),
      error,
      event: "VALIDATION_FAILURE",
      field,
      timestamp: new Date().toISOString(),
      value: typeof value === "string" ? value.slice(0, 100) : value,
    };

    console.warn(
      JSON.stringify({
        category: "Validation",
        level: "warn",
        service,
        ...logData,
      })
    );
  };

  const logCookieOperation = (
    operation: "set" | "get" | "clear",
    cookieName: string,
    context: TSecurityContext,
    success: boolean,
    additionalData?: Record<string, unknown>
  ): void => {
    const logData = {
      context: pickContext(context),
      cookieName,
      event: `COOKIE_${operation.toUpperCase()}`,
      success,
      timestamp: new Date().toISOString(),
      ...additionalData,
    };

    const level = success ? "log" : "warn";
    const logLevel = success ? "info" : "warn";
    console[level](
      JSON.stringify({
        category: "Cookie",
        level: logLevel,
        service,
        ...logData,
      })
    );
  };

  const createTimer = (
    operation: string
  ): {
    end: (
      context: TSecurityContext,
      additionalData?: Record<string, unknown>
    ) => void;
  } => {
    const startTime = Date.now();

    return {
      end: (
        context: TSecurityContext,
        additionalData?: Record<string, unknown>
      ) => {
        const duration = Date.now() - startTime;
        logPerformance(operation, duration, context, additionalData);
      },
    };
  };

  return {
    createTimer,
    logCookieOperation,
    logError,
    logEvent,
    logPerformance,
    logRateLimit,
    logSecurityEvent,
    logSuccess,
    logValidationFailure,
  };
}
