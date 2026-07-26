import { routing } from "@cs/i18n/routing";
import { buildCsp } from "@cs/security/proxy";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

/**
 * No redirect gating for the workspace routes (`/` (chat), `/design-studio` —
 * see `(workspace)/layout.tsx`), unlike apps/super-app's `/guest/*` <->
 * protected-route redirect maze: guest vs. authenticated is a session
 * concern (`GuestSessionProvider`, `ApiAuthProvider`), not a routing one —
 * both identities render the same page at the same URL, so there is nothing
 * for edge middleware to gate here. Edge middleware also can't safely run
 * the CSRF-protected guest-session calls itself — same reason
 * apps/super-app's own middleware only ever checked cookie *presence*, never
 * called the anon endpoints directly.
 */
export default function proxy(request: NextRequest) {
  const response = intlMiddleware(request);
  response.headers.set("Content-Security-Policy", buildCsp());
  return response;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
