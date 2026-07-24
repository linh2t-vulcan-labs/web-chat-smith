import { routing } from "@cs/i18n/routing";
import { buildCsp } from "@cs/security/proxy";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

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
