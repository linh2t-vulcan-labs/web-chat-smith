import { toDomainWildcard } from "@cs/core/domain";
import { publicEnv } from "@cs/env/server";

import { buildCspDirectives, serializeCsp } from "./csp";

/**
 * Builds the Content-Security-Policy header value from runtime env — used
 * from a middleware/`proxy.ts` file, since `next.config.ts`'s `headers()` is
 * baked at build time and can't see container-start env like `@cs/env`'s
 * runtime-config bridge does.
 */
export const buildCsp = (): string => {
  const isProd = publicEnv.CS_PUBLIC_ENV_NAME === "production";
  const apiBaseUrl = publicEnv.CS_PUBLIC_API_BASE_URL;
  const domainWildcard = toDomainWildcard(publicEnv.CS_PUBLIC_COOKIE_DOMAIN);
  const webUrl = publicEnv.CS_PUBLIC_WEB_URL;

  return serializeCsp(
    buildCspDirectives({ apiBaseUrl, domainWildcard, isProd, webUrl })
  );
};
