import createMiddleware from "next-intl/middleware";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { CustomMiddleware } from "../libs/auth-v2/middleware/chain";
import { routing } from "./routing";

const intlMiddleware = createMiddleware(routing);

export function I18nMiddleware(middleware: CustomMiddleware): CustomMiddleware {
  return async (
    request: NextRequest,
    event: NextFetchEvent,
    response: NextResponse
  ) => {
    // Call the next-intl middleware first (it only takes request, not event)
    const intlResult = intlMiddleware(request);
    const intlResponse =
      intlResult instanceof Promise ? await intlResult : intlResult;

    // If next-intl returns a redirect (307, 308, or any redirect status), return it directly
    if (intlResponse instanceof NextResponse) {
      const isRedirect =
        intlResponse.status >= 300 && intlResponse.status < 400;
      if (isRedirect) {
        return intlResponse;
      }

      // If next-intl returns a rewritten response, use it as the base for continuing the chain
      // Merge any additional headers from the original response
      for (const [key, value] of response.headers.entries()) {
        if (!intlResponse.headers.has(key)) {
          intlResponse.headers.set(key, value);
        }
      }

      // Continue with the middleware chain using the rewritten response
      return middleware(request, event, intlResponse);
    }

    // Continue with the middleware chain using the original response
    return middleware(request, event, response);
  };
}
