import { createSecurityLogger } from "../../_shared/security-logger";

/**
 * Structured logging utility for auth-v2 API routes.
 * Provides consistent logging for security, debugging, and monitoring.
 * Built from the shared security-logger factory; `logAuthEvent` is the
 * auth-v2 alias for the factory's generic event logger.
 */
const base = createSecurityLogger({ service: "AuthV2" });

export const AuthLogger = {
  ...base,
  logAuthEvent: base.logEvent,
};
