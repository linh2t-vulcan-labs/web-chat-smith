import { NextResponse } from "next/server";

import { I18nMiddleware } from "./i18n/middleware";
import { chain } from "./libs/auth-v2/middleware/chain";
import type { CustomMiddleware } from "./libs/auth-v2/middleware/chain";
import { withInitializeResponse } from "./libs/auth-v2/middleware/initialize-response";
import { withAuth } from "./libs/auth-v2/middleware/with-auth";
import { hasUTMParams } from "./utils/commons/urls";

function withRobotsTag(middleware: CustomMiddleware): CustomMiddleware {
  return async (request, event, response) => {
    const url = new URL(request.nextUrl);
    const res = await middleware(request, event, response);
    if (hasUTMParams(url.searchParams) && res instanceof NextResponse) {
      res.headers.set("X-Robots-Tag", "noindex, follow");
    }
    return res;
  };
}

// Next 16 renamed the `middleware` file convention to `proxy`.
export const proxy = chain([
  withInitializeResponse,
  withRobotsTag,
  I18nMiddleware,
  withAuth,
]);

export const config = {
  matcher: [
    // Root must be listed explicitly: with basePath set, Next prepends it to
    // each matcher, turning the catch-all into `/super-app/(...)` which misses
    // the bare `/super-app` root. Without this, next-intl never rewrites
    // `/` → `/en` and the locale-less landing page 404s. Mirrors creative-studio.
    "/",
    // Match all paths except for:
    // - API routes
    // - Next.js internals
    // - Vercel internals
    // - files in the public folder or similar (e.g. images, favicon.ico)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
  unstable_allowDynamic: [
    "**/node_modules/reflect-metadata/**",
    "**/node_modules/lodash-es/**",
  ],
};
