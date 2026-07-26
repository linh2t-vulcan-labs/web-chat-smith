"use client";

import { getGuestTokenManager } from "@cs/api-client/core/token-manager";
import { useApiAuth } from "@cs/api-client/providers/auth-provider";
import { getRuntimeEnv } from "@cs/env/universal";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

interface GuestSessionState {
  isGuest: boolean;
  guestAccessToken: string | null;
  isInitializing: boolean;
  /** True while a Turnstile challenge must resolve before a guest session can be created — see the invisible `<Turnstile>` render below. */
  needsCaptcha: boolean;
  /** True once `MAX_CAPTCHA_ATTEMPTS` create-session attempts have all failed — stops retrying instead of looping forever on a persistent failure (e.g. a backend/config error unrelated to the captcha itself). */
  captchaFailed: boolean;
}

interface GuestSessionContextValue extends GuestSessionState {
  /**
   * Resolves with the guest access token — immediately if one already
   * exists, or once the in-flight bootstrap/captcha/create sequence
   * produces one. Rejects if verification has already given up
   * (`captchaFailed`) or if `timeoutMs` elapses first. This is the primitive
   * a feature needing a token waits on WITHOUT blocking page render — see
   * `useEnsureAccessToken()` (apps/web/hooks/use-ensure-access-token.ts) for
   * the identity-agnostic wrapper features should actually call.
   */
  ensureGuestAccessToken: (timeoutMs?: number) => Promise<string>;
}

const DEFAULT_ENSURE_TOKEN_TIMEOUT_MS = 20_000;

interface TokenWaiter {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}

const GuestSessionContext = createContext<GuestSessionContextValue | null>(
  null
);

const INITIAL_STATE: GuestSessionState = {
  captchaFailed: false,
  guestAccessToken: null,
  isGuest: false,
  isInitializing: true,
  needsCaptcha: false,
};

/**
 * A failure here (network error, or a create-session rejection unrelated to
 * the captcha's own validity — e.g. a misconfigured backend dependency) is
 * otherwise indistinguishable from "the challenge needs solving again," and
 * `.reset()` on an invisible/managed widget re-executes near-instantly — a
 * persistent failure would retry in a tight loop with no backoff. Confirmed
 * live: a missing-nonce bug on the server side alone produced dozens of
 * retries within milliseconds before this cap was added.
 */
const MAX_CAPTCHA_ATTEMPTS = 3;

interface CreateGuestSessionResponse {
  accessToken: string;
  accessTokenExpiresAt: number;
}

/**
 * Provisions and tracks a guest session for the workspace route group
 * (`(workspace)/layout.tsx`) — the actual "gating" a visitor observes: the
 * page renders immediately, and a real guest session is transparently
 * provisioned within the first render via `getGuestTokenManager()`.
 *
 * Deliberately its own component/context rather than reusing
 * `ApiAuthProvider` — that provider's `AuthContext` is a single module-level
 * React context, so mounting a second instance for the guest identity would
 * let any `useApiAuth()` call inside this subtree silently resolve to
 * whichever instance is innermost instead of throwing. Guest and
 * authenticated are tracked through separate contexts on purpose (see
 * docs/runbook/api-client.md §4.5).
 *
 * Never bootstraps a guest session once a real one exists: gated on
 * `useApiAuth()` so an authenticated visitor never runs guest bootstrap, and
 * a fresh sign-in (the "conversion" moment) tears any existing guest session
 * down instead of leaving both identities live indefinitely.
 *
 * Guest session CREATION requires a Turnstile token (the backend rejects
 * `POST /anon/sessions` without one — confirmed live against staging), which
 * is an async, invisible client-side challenge — `GET /api/anon/session`
 * (the `TokenManager` restore path) is restore-ONLY and 404s when no guest
 * session exists yet, at which point this component renders the invisible
 * widget and, on success, creates the session itself and injects it into
 * `getGuestTokenManager()` via `setSession()` (the same public method the
 * authenticated flow already uses right after its own Firebase→Vulcan
 * exchange).
 */
export const GuestSessionProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isInitializing: isAuthInitializing } = useApiAuth();
  const [state, setState] = useState<GuestSessionState>(INITIAL_STATE);
  // oxlint-disable-next-line unicorn/no-useless-undefined -- this repo's @types/react has no zero-arg useRef overload, so an explicit initial value is required
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);
  const captchaAttemptsRef = useRef(0);
  const waitersRef = useRef<TokenWaiter[]>([]);

  const flushWaiters = (result: { token: string } | { error: Error }) => {
    const waiters = waitersRef.current;
    waitersRef.current = [];
    for (const waiter of waiters) {
      if ("token" in result) {
        waiter.resolve(result.token);
      } else {
        waiter.reject(result.error);
      }
    }
  };

  useEffect(() => {
    // Wait for the authenticated identity to settle first so a
    // still-restoring auth session doesn't cause a guest session to be
    // provisioned and then immediately torn down a moment later.
    if (isAuthInitializing) {
      return;
    }

    // Tear down any existing guest session — no state update needed here,
    // `value` below already computes the logged-out-guest shape directly
    // from `isAuthenticated` once it's true.
    if (isAuthenticated) {
      void getGuestTokenManager().logout();
      return;
    }

    const guestTokenManager = getGuestTokenManager({
      onAccessTokenChange: (accessToken) => {
        setState((previous) => ({
          ...previous,
          guestAccessToken: accessToken,
          isGuest: accessToken !== null,
          // A session appearing (restored, or created via the captcha flow
          // below) always means the challenge is no longer needed.
          needsCaptcha: accessToken === null ? previous.needsCaptcha : false,
        }));
        if (accessToken !== null) {
          flushWaiters({ token: accessToken });
        }
      },
    });

    const restore = async () => {
      await guestTokenManager.restoreSessionOnce();
      setState((previous) => ({
        ...previous,
        isInitializing: false,
        needsCaptcha: guestTokenManager.getAccessToken() === null,
      }));
    };
    void restore();
  }, [isAuthenticated, isAuthInitializing]);

  const retryOrGiveUp = () => {
    captchaAttemptsRef.current += 1;
    if (captchaAttemptsRef.current < MAX_CAPTCHA_ATTEMPTS) {
      turnstileRef.current?.reset();
      return;
    }
    setState((previous) => ({ ...previous, captchaFailed: true }));
    flushWaiters({ error: new Error("Guest verification failed") });
  };

  /** See `GuestSessionContextValue.ensureGuestAccessToken`'s doc comment. */
  const ensureGuestAccessToken = (
    timeoutMs = DEFAULT_ENSURE_TOKEN_TIMEOUT_MS
  ): Promise<string> => {
    if (state.guestAccessToken) {
      return Promise.resolve(state.guestAccessToken);
    }
    if (state.captchaFailed) {
      return Promise.reject(new Error("Guest verification failed"));
    }

    // oxlint-disable-next-line promise/avoid-new -- bridging callback-based waiter registration (flushWaiters, resolved/rejected from elsewhere) into a Promise; there's no async operation here to `await` instead
    return new Promise<string>((resolve, reject) => {
      const waiter: TokenWaiter = { reject, resolve };
      const timer = setTimeout(() => {
        waitersRef.current = waitersRef.current.filter((w) => w !== waiter);
        reject(new Error("Timed out waiting for guest session"));
      }, timeoutMs);

      waitersRef.current.push({
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
        resolve: (token) => {
          clearTimeout(timer);
          resolve(token);
        },
      });
    });
  };

  const handleCaptchaSuccess = async (captchaToken: string) => {
    try {
      const response = await fetch("/api/anon/session", {
        body: JSON.stringify({ captchaToken }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        retryOrGiveUp();
        return;
      }

      const data = (await response.json()) as CreateGuestSessionResponse;
      // Triggers the `onAccessTokenChange` callback above, which flips
      // `needsCaptcha` off — no separate state update needed here.
      getGuestTokenManager().setSession(
        data.accessToken,
        data.accessTokenExpiresAt
      );
    } catch {
      retryOrGiveUp();
    }
  };

  const value: GuestSessionContextValue = isAuthenticated
    ? {
        captchaFailed: false,
        ensureGuestAccessToken,
        guestAccessToken: null,
        isGuest: false,
        isInitializing: false,
        needsCaptcha: false,
      }
    : { ...state, ensureGuestAccessToken };

  const siteKey = getRuntimeEnv().CS_PUBLIC_TURNSTILE_CAPTCHA_SITEKEY;

  return (
    // oxlint-disable-next-line react/jsx-no-constructed-context-values -- React Compiler (enabled for this app) memoizes this automatically
    <GuestSessionContext.Provider value={value}>
      {
        // oxlint-disable-next-line react/react-compiler -- `ensureGuestAccessToken`/`retryOrGiveUp` close over refs (turnstileRef, waitersRef) but are only ever invoked from event handlers or the Promise executor above, never during render itself
        value.needsCaptcha && !value.captchaFailed && siteKey && (
          <Turnstile
            onError={retryOrGiveUp}
            onExpire={retryOrGiveUp}
            onSuccess={(token) => void handleCaptchaSuccess(token)}
            options={{ size: "invisible" }}
            ref={turnstileRef}
            siteKey={siteKey}
          />
        )
      }
      {children}
    </GuestSessionContext.Provider>
  );
};

export const useGuestSession = (): GuestSessionContextValue => {
  const context = useContext(GuestSessionContext);
  if (!context) {
    throw new Error(
      "useGuestSession must be used within a <GuestSessionProvider>"
    );
  }
  return context;
};
