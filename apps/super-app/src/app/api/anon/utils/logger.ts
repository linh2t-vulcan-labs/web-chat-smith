import { createSecurityLogger } from "../../_shared/security-logger";
import type { TAnonSecurityContext } from "../types";

/**
 * Structured logging utility for anon API routes.
 * Provides consistent logging for security, debugging, and monitoring.
 * Built from the shared security-logger factory; `logGuestEvent` is the anon
 * alias for the factory's generic event logger. The two remaining methods below
 * are anon-only (external-service calls and CSRF operations).
 */
const base = createSecurityLogger({
  includeErrorName: true,
  service: "AnonSession",
});

export const AnonLogger = {
  ...base,
  logCsrfOperation(
    operation: string,
    context: TAnonSecurityContext,
    success: boolean,
    additionalData?: Record<string, unknown>
  ): void {
    const logData = {
      context: {
        countryCode: context.countryCode,
        ip: context.ip,
        origin: context.origin,
        userAgent: context.userAgent,
      },
      event: `CSRF_${operation.toUpperCase()}`,
      success,
      timestamp: new Date().toISOString(),
      ...additionalData,
    };

    const level = success ? "log" : "warn";
    const logLevel = success ? "info" : "warn";
    console[level](
      JSON.stringify({
        category: "CSRF",
        level: logLevel,
        service: "AnonSession",
        ...logData,
      })
    );
  },
  logExternalServiceCall(
    serviceName: string,
    endpoint: string,
    method: string,
    context: TAnonSecurityContext,
    duration?: number,
    statusCode?: number,
    additionalData?: Record<string, unknown>
  ): void {
    const logData = {
      context: {
        countryCode: context.countryCode,
        ip: context.ip,
        origin: context.origin,
        userAgent: context.userAgent,
      },
      duration: duration ? `${duration}ms` : undefined,
      endpoint,
      event: "EXTERNAL_SERVICE_CALL",
      method,
      serviceName,
      statusCode,
      timestamp: new Date().toISOString(),
      ...additionalData,
    };

    console.log(
      JSON.stringify({
        category: "ExternalService",
        level: "info",
        service: "AnonSession",
        ...logData,
      })
    );
  },
  logGuestEvent: base.logEvent,
};
