import { getRuntimeEnv } from "@cs/env/universal";
import type {
  Environments,
  InitializePaddleOptions,
  PaddleEventData,
  PaddleSetupPwCustomer,
} from "@paddle/paddle-js";

/**
 * Get Paddle client-side token from environment.
 *
 * Uses the isomorphic getRuntimeEnv() rather than the client-only
 * getPublicEnv() — callers (e.g. GuestModalManager) are "use client"
 * components that still render during SSR, where getPublicEnv() throws.
 */
export function getClientToken(): string {
  return getRuntimeEnv().CS_PUBLIC_PADDLE_CLIENT_TOKEN || "";
}

/**
 * Determine environment from token prefix or env var
 * Tokens starting with 'test_' are sandbox, 'live_' are production
 */
export function getEnvironment(token?: string): Environments {
  const t = token || getClientToken();
  if (t.startsWith("test_")) {
    return "sandbox";
  }
  if (t.startsWith("live_")) {
    return "production";
  }

  // Fallback to env or default sandbox
  const envName = getRuntimeEnv().CS_PUBLIC_ENV_NAME?.toLowerCase();
  return envName === "production" ? "production" : "sandbox";
}

export interface BuildConfigOptions {
  pwCustomer?: PaddleSetupPwCustomer | null;
  environment?: Environments;
  eventCallback?: (data: PaddleEventData) => void;
}

/**
 * Build Paddle initialization config from environment and options
 */
export function buildInitializeConfig(
  options?: BuildConfigOptions
): InitializePaddleOptions {
  const token = getClientToken();
  if (!token) {
    throw new Error("CS_PUBLIC_PADDLE_CLIENT_TOKEN is missing");
  }

  const environment = options?.environment ?? getEnvironment(token);

  return {
    environment,
    eventCallback: options?.eventCallback,
    pwCustomer: options?.pwCustomer ?? undefined,
    token,
  };
}
