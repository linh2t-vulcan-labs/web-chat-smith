import { XCountryKey, XTimezoneKey } from "@/utils/commons/keys";

import type { TAnonSecurityContext } from "../types";
import { AnonLogger } from "./logger";

/**
 * Extracts endpoint from full URL for logging
 */
function extractEndpoint(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch {
    return url;
  }
}

/**
 * Proxy fetch utility for anon API routes
 * Forwards client headers and provides logging
 */
export const ProxyFetch = {
  /**
   * Makes a proxied fetch request with client headers and logging
   */
  async fetch(
    input: string,
    context: TAnonSecurityContext,
    init: RequestInit = {}
  ): Promise<Response> {
    const startTime = Date.now();

    try {
      const response = await fetch(input, {
        ...init,
        headers: {
          ...init.headers,
          "x-forwarded-for": context.ip || "",
          "user-agent": context.userAgent || "",
          [XCountryKey]: context.countryCode || "",
          [XTimezoneKey]: context.timezone || "",
        },
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log failed request
      AnonLogger.logError(error as Error, context, {
        duration,
        endpoint: extractEndpoint(input),
        method: init.method || "GET",
        service: "UserManagementService",
      });

      throw error;
    }
  },

  /**
   * Makes a GET request
   */
  get(
    url: string,
    context: TAnonSecurityContext,
    headers?: HeadersInit
  ): Promise<Response> {
    return ProxyFetch.fetch(url, context, {
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      method: "GET",
    });
  },

  /**
   * Makes a POST request
   */
  post(
    url: string,
    context: TAnonSecurityContext,
    body?: unknown,
    headers?: HeadersInit
  ): Promise<Response> {
    return ProxyFetch.fetch(url, context, {
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      method: "POST",
    });
  },
};
