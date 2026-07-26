import { useApiAuth } from "@cs/api-client/providers/auth-provider";

import { useGuestSession } from "@/components/providers/guest-session-provider";

/**
 * Single entry point for any feature that needs an access token — hides
 * which identity (authenticated or guest) is actually active. Resolves
 * immediately once a token exists; the first time (guest bootstrap/captcha
 * still in flight), it waits WITHOUT blocking page render — the caller
 * should show its own local pending state around the `await`, not a
 * page-wide loader (see `GuestSessionProvider`'s doc comment for why guest
 * verification itself is non-blocking).
 *
 * Rejects if guest verification has given up (`captchaFailed`) or times out
 * — the caller decides how to surface that (inline retry, disabled button,
 * etc.). No manual `useCallback` here — React Compiler (enabled for this
 * app) already memoizes the returned function.
 */
export const useEnsureAccessToken = (): (() => Promise<string>) => {
  const { isAuthenticated, accessToken } = useApiAuth();
  const { ensureGuestAccessToken } = useGuestSession();

  return (): Promise<string> => {
    if (isAuthenticated && accessToken) {
      return Promise.resolve(accessToken);
    }
    return ensureGuestAccessToken();
  };
};
