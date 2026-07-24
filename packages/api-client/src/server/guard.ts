import "server-only";
import { redirect } from "next/navigation";

import { getRefreshTokenCookie } from "./cookies";

export interface RequireSessionOptions {
  /** Where to send an unauthenticated request. Default "/login". */
  loginPath?: string;
}

/**
 * Call at the top of a Server Component/layout that requires an
 * authenticated session — redirects to `loginPath` before rendering anything
 * if no `refresh_token` cookie is present (see docs/runbook/api-client.md §1).
 *
 * Deliberately cheap: only checks cookie *presence*, no backend call and no
 * refresh — a present-but-expired access token is a different case, already
 * handled by `serverFetch`'s own refresh-and-retry (see server-fetch.ts).
 * This only covers the "no session at all" case those retries can't recover
 * from (there's nothing to refresh).
 */
export const requireAuthenticatedSession = async (
  options: RequireSessionOptions = {}
): Promise<void> => {
  const refreshToken = await getRefreshTokenCookie();
  if (!refreshToken) {
    redirect(options.loginPath ?? "/login");
  }
};
