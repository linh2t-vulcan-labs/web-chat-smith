import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { DESIGN_STUDIO_USECASE_SLUGS } from "@/features/suite/utils/constants/route";
import { routing } from "@/i18n/routing";
import { COOKIE_NAME } from "@/utils/commons/keys";
import { CALLBACK_URL_QUERY_PARAM } from "@/utils/constants/common";
import {
  ASSISTANT_WRITING_URL,
  CONVERSATION_URL,
  DESIGN_STUDIO_URL,
  GUEST_DESIGN_STUDIO_URL,
  GUEST_URL,
  LOGIN_PAGE_URL,
  MANAGE_ACCOUNT_URL,
} from "@/utils/constants/url";

import type { CustomMiddleware } from "./chain";

// Protected route patterns (require authentication)
const PROTECTED_ROUTE_PATTERNS = [
  CONVERSATION_URL,
  ASSISTANT_WRITING_URL,
  MANAGE_ACCOUNT_URL,
  DESIGN_STUDIO_URL,
];

// Routes that should redirect to /conversation when authenticated
const AUTH_REDIRECT_TO_CONVERSATION = new Set([GUEST_URL, LOGIN_PAGE_URL]);

function getLocaleFromPathname(pathname: string): string {
  const segments = pathname.split("/");
  const [, maybeLocale] = segments;

  if (
    maybeLocale &&
    routing.locales.includes(maybeLocale as (typeof routing.locales)[number])
  ) {
    return maybeLocale;
  }

  // With "as-needed" mode, if no locale is found, return default locale
  return routing.defaultLocale;
}

function stripLocaleFromPathname(pathname: string): string {
  const segments = pathname.split("/");
  const [, maybeLocale] = segments;

  if (
    routing.locales.includes(maybeLocale as (typeof routing.locales)[number])
  ) {
    const strippedSegments = ["", ...segments.slice(2)];
    const strippedPath = strippedSegments.join("/") || "/";
    return strippedPath.startsWith("/") ? strippedPath : `/${strippedPath}`;
  }

  return pathname;
}

function buildLocalizedPath(path: string, locale: string): string {
  // With "as-needed" mode, don't add locale prefix for default locale
  if (locale === routing.defaultLocale) {
    return path;
  }

  const dummyBase = "http://example.com";
  const url = new URL(path, dummyBase);
  const pathname = url.pathname === "/" ? "" : url.pathname;

  url.pathname = `/${locale}${pathname}`;

  return `${url.pathname}${url.search}`;
}

/**
 * Redirects authenticated users while preserving query parameters (except callbackUrl).
 *
 * Security: callbackUrl should never persist for authenticated users as it's only
 * needed during the login flow to preserve navigation intent. Once authenticated,
 * callbackUrl serves no purpose and should be removed to:
 * 1. Prevent URL pollution and cleaner browser history
 * 2. Avoid exposing internal navigation intent
 * 3. Follow security best practices for authentication redirects
 */
function redirectWithUser(req: NextRequest, path: string) {
  const locale = getLocaleFromPathname(req.nextUrl.pathname);
  const localizedPath = buildLocalizedPath(path, locale);
  const newUrl = new URL(localizedPath, req.url);

  // Preserve query parameters from the original request
  const originalSearchParams = req.nextUrl.searchParams;
  for (const [key, value] of originalSearchParams) {
    // Skip callbackUrl for authenticated users - it's only needed during login flow
    if (key !== CALLBACK_URL_QUERY_PARAM) {
      newUrl.searchParams.set(key, value);
    }
  }

  const res = NextResponse.redirect(newUrl);

  return res;
}

/**
 * Redirects unauthenticated users from protected routes to login with callbackUrl.
 * This preserves navigation intent when sessions expire or tokens are missing.
 *
 * Preserves all original query parameters and adds callbackUrl with the original pathname.
 */
function redirectToLoginWithCallback(
  req: NextRequest,
  originalPathname: string
) {
  const targetPath = toGuestRoute(originalPathname);
  const newUrl = new URL(targetPath, req.url);

  // Preserve all existing query parameters from the original request
  const originalSearchParams = req.nextUrl.searchParams;
  for (const [key, value] of originalSearchParams) {
    // Preserve all params including tracking params (utm_source, utm_campaign, ref, etc.)
    newUrl.searchParams.set(key, value);
  }

  // Add callbackUrl to preserve navigation intent for expired/missing sessions
  // This allows users to resume where they left off after re-authentication
  newUrl.searchParams.set(CALLBACK_URL_QUERY_PARAM, originalPathname);

  return NextResponse.redirect(newUrl);
}

/**
 * Check if the pathname matches a protected route pattern
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PATTERNS.some((pattern) =>
    pathname.startsWith(pattern)
  );
}

/**
 * Check if the pathname is a guest route
 */
function isGuestRoute(pathname: string): boolean {
  return pathname.startsWith("/guest") || pathname === GUEST_URL;
}

/**
 * Check if the pathname is a redirect to login page
 */
function isRedirectToLoginPage(pathname: string): boolean {
  return [CONVERSATION_URL, MANAGE_ACCOUNT_URL].some((pattern) =>
    pathname.startsWith(pattern)
  );
}

/**
 * Convert a protected route to its guest equivalent path (pathname only, no query params)
 * e.g., /conversation/123 -> /login
 *       /assistant/writing/123 -> /guest/assistant/writing
 *       /conversation -> /login
 *       /design-studio/logo -> /guest/design-studio/logo  (use-case slug → guest deep link)
 *       /design-studio/<projectId> -> /guest/design-studio (no guest page for it → guest home)
 *
 * Note: This function only maps paths. Query parameters (including callbackUrl) are handled
 * separately in the redirect logic to preserve intent distinction.
 */
function toGuestRoute(pathname: string): string {
  // Redirect all /conversation paths to login page
  if (isRedirectToLoginPage(pathname)) {
    return LOGIN_PAGE_URL;
  }

  if (pathname === GUEST_URL) {
    return GUEST_URL;
  }

  // Redirect all /assistant/writing paths (including with IDs) to /guest/assistant/writing
  if (pathname.startsWith(ASSISTANT_WRITING_URL)) {
    return `/guest${ASSISTANT_WRITING_URL}`;
  }

  // Design Studio: keep a use-case slug deep link (guests have /guest/design-studio/<slug>), but
  // collapse the bare root, a project id, or view-all (no guest page for those) to the guest home so
  // the guest never lands on a 404. Only the first path segment after the root decides the mapping.
  if (pathname === DESIGN_STUDIO_URL) {
    return GUEST_DESIGN_STUDIO_URL;
  }
  if (pathname.startsWith(`${DESIGN_STUDIO_URL}/`)) {
    const [firstSegment] = pathname
      .slice(`${DESIGN_STUDIO_URL}/`.length)
      .split("/");
    return firstSegment && DESIGN_STUDIO_USECASE_SLUGS.includes(firstSegment)
      ? `${GUEST_DESIGN_STUDIO_URL}/${firstSegment}`
      : GUEST_DESIGN_STUDIO_URL;
  }

  return GUEST_URL;
}

/**
 * Convert a guest route to its protected equivalent
 * e.g., /guest/assistant/writing -> /assistant/writing
 *       /guest/conversation/123 -> /conversation/123
 */
function toProtectedRoute(pathname: string): string {
  if (pathname === GUEST_URL || pathname === "/guest") {
    return CONVERSATION_URL;
  }
  if (pathname.startsWith("/guest/")) {
    return pathname.replace("/guest", "");
  }
  return pathname;
}

export function withAuth(middleware: CustomMiddleware) {
  return (
    request: NextRequest,
    event: NextFetchEvent,
    response: NextResponse
  ) => {
    const originalPathname = request.nextUrl.pathname;
    const pathname = stripLocaleFromPathname(originalPathname);
    const vulcanAuthToken = request.cookies.get(
      COOKIE_NAME.VULCAN_AUTH_TOKEN
    )?.value;

    const isAuthenticated = Boolean(vulcanAuthToken);

    // Authenticated user cases
    if (isAuthenticated) {
      // Clear any guest cookies when authenticated user is detected

      // Remove callbackUrl from query params when authenticated user accesses any route
      // Security: callbackUrl should never persist for authenticated users as it's only
      // needed during the login flow. Once authenticated, it serves no purpose and
      // should be removed to prevent URL pollution and follow security best practices.
      if (request.nextUrl.searchParams.has(CALLBACK_URL_QUERY_PARAM)) {
        const newUrl = new URL(request.url);
        newUrl.searchParams.delete(CALLBACK_URL_QUERY_PARAM);
        // Preserve all other query parameters
        return NextResponse.redirect(newUrl);
      }

      // Redirect authenticated users from guest routes to protected routes
      if (isGuestRoute(pathname) && pathname !== GUEST_URL) {
        const protectedRoute = toProtectedRoute(pathname);
        const redirectResponse = redirectWithUser(request, protectedRoute);
        return redirectResponse;
      }

      // Redirect from root or login page to conversation
      if (AUTH_REDIRECT_TO_CONVERSATION.has(pathname)) {
        const redirectResponse = redirectWithUser(request, CONVERSATION_URL);
        return redirectResponse;
      }
    }

    // Unauthenticated user cases
    // Check if trying to access a protected route
    if (!isAuthenticated && isProtectedRoute(pathname)) {
      // Redirect to login with callbackUrl to preserve navigation intent
      // This handles cases where:
      // - Token expired
      // - Token is missing
      // - User refreshed page after session timeout
      //
      // Note: Explicit sign-out is handled by route handlers which redirect
      // directly to /login without callbackUrl. The middleware will not
      // override that since /login is a public route.
      return redirectToLoginWithCallback(request, pathname);
    }

    // Allow access to public routes (login, guest routes, etc.)
    // No redirect needed - this includes explicit sign-out redirects to /login

    // Continue with the middleware chain
    return middleware(request, event, response);
  };
}
