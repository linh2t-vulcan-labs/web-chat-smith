import { CALLBACK_URL_QUERY_PARAM } from "../constants/common";
import {
  ASSISTANT_WRITING_URL,
  CONVERSATION_URL,
  GUEST_ASSISTANT_WRITING_URL,
  GUEST_URL,
  LOGIN_PAGE_URL,
} from "../constants/url";

/**
 * Determines the appropriate guest mode redirect path based on the current pathname
 * @param pathname - The current pathname
 * @returns The guest mode redirect path
 */
function getGuestRedirectPath(pathname: string): string {
  // Handle conversation routes
  if (pathname.startsWith(CONVERSATION_URL)) {
    return LOGIN_PAGE_URL;
  }

  // Handle assistant writing routes
  if (pathname.startsWith(ASSISTANT_WRITING_URL)) {
    return GUEST_ASSISTANT_WRITING_URL;
  }

  // Default to guest home
  return GUEST_URL;
}

/**
 * Creates a redirect URL with callback URL parameter and preserves current query params
 * @param redirectPath - The path to redirect to
 * @param callbackUrl - The callback URL to preserve (pathname only)
 * @param currentQueryParams - Current page query parameters to preserve (optional)
 * @returns The complete redirect URL with callback parameter and preserved query params
 */
function createRedirectUrlWithCallback(
  redirectPath: string,
  callbackUrl: string,
  currentQueryParams?: URLSearchParams
): string {
  const url = new URL(redirectPath, window.location.origin);

  // Set the callback URL (pathname only)
  url.searchParams.set(CALLBACK_URL_QUERY_PARAM, callbackUrl);

  // Preserve other query parameters from the current page
  if (currentQueryParams) {
    for (const [key, value] of currentQueryParams) {
      // Don't override the callbackUrl we just set
      if (key !== CALLBACK_URL_QUERY_PARAM) {
        url.searchParams.set(key, value);
      }
    }
  }

  return url.toString();
}

/**
 * Creates a simple redirect URL without callback parameters
 * @param redirectPath - The path to redirect to
 * @returns The redirect URL
 */
function createSimpleRedirectUrl(redirectPath: string): string {
  return redirectPath;
}

/**
 * Handles logout redirect logic with callback URL support and query param preservation
 * @param currentPathname - The current pathname
 * @param includeCallbackUrl - Whether to include callback URL in redirect
 * @param currentQueryParams - Current page query parameters to preserve (optional)
 * @returns The redirect URL
 */
export function handleLogoutRedirect(
  currentPathname: string,
  includeCallbackUrl = false,
  currentQueryParams?: URLSearchParams
): string {
  const guestRedirectPath = getGuestRedirectPath(currentPathname);

  if (includeCallbackUrl) {
    return createRedirectUrlWithCallback(
      guestRedirectPath,
      currentPathname,
      currentQueryParams
    );
  }

  return createSimpleRedirectUrl(guestRedirectPath);
}
