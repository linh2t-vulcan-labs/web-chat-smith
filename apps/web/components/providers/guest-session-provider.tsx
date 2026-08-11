"use client";

import { getGuestTokenManager } from "@cs/api-client/core/token-manager";
import { useApiAuth } from "@cs/api-client/providers/auth-provider";
import { getRuntimeEnv } from "@cs/env/universal";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

import { GuestCaptchaWidget } from "./guest-captcha-widget";

export interface GuestSessionInitialState {
  hasGuestSessionCookie: boolean;
}

interface GuestSessionState {
  isGuest: boolean;
  guestAccessToken: string | null;
  isInitializing: boolean;
  /** True while a Turnstile challenge must resolve before a guest session can be created — see `<GuestCaptchaWidget>` below. */
  needsCaptcha: boolean;
  /** True once `GuestCaptchaWidget` has given up retrying the challenge — stops retrying instead of looping forever on a persistent failure (e.g. a backend/config error unrelated to the captcha itself). */
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
 * Pending `ensureGuestAccessToken()` callers, module-scoped rather than a
 * `useRef` — like `getGuestTokenManager()` itself, a caller waiting on a
 * token has nothing to do with any particular `GuestSessionProvider`
 * instance and must survive this provider's own remounts (a locale switch
 * remounts everything under `[locale]/layout.tsx` — see the state
 * initializer's comment below); a per-instance ref would silently drop
 * whoever was waiting at the moment of remount.
 */
let guestTokenWaiters: TokenWaiter[] = [];

const flushGuestTokenWaiters = (
  result: { token: string } | { error: Error }
) => {
  const waiters = guestTokenWaiters;
  guestTokenWaiters = [];
  for (const waiter of waiters) {
    if ("token" in result) {
      waiter.resolve(result.token);
    } else {
      waiter.reject(result.error);
    }
  }
};

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
 * (the `TokenManager` restore path) is restore-ONLY and reports `{
 * accessToken: null }` (a `200`, not an error) when no guest session exists
 * yet, at which point this component renders the invisible widget and, on
 * success, creates the session itself and injects it into
 * `getGuestTokenManager()` via `setSession()` (the same public method the
 * authenticated flow already uses right after its own Firebase→Vulcan
 * exchange).
 */
export const GuestSessionProvider = ({
  children,
  initialState,
}: {
  children: ReactNode;
  /**
   * Server-read `guest_session` cookie presence from
   * `GuestSessionInitialState`. When it's absent, the mount effect skips
   * `restoreSessionOnce()` — not to dodge an error (the route returns a
   * clean `200` either way, see its doc comment), but to skip waiting on a
   * network round-trip already known to come back empty — and jumps
   * straight to `needsCaptcha: true`. Omitted (e.g. any other call site)
   * keeps the old behavior: always attempt the restore first.
   */
  initialState?: GuestSessionInitialState;
}) => {
  const { isAuthenticated, isInitializing: isAuthInitializing } = useApiAuth();
  const [state, setState] = useState<GuestSessionState>(() => {
    // `locale` is a root param, so this provider mounts inside
    // `app/[locale]/(workspace)/layout.tsx` and fully remounts on a locale
    // switch (see that file's comment). `getGuestTokenManager()` is a
    // module-level singleton unaffected by the remount — seed from its
    // already-live token instead of always cold-starting, so a locale
    // switch doesn't visibly re-show "provisioning session…" for a guest
    // who already has one. Guarded to client-only: this initializer also
    // runs during SSR (a "use client" component still renders server-side),
    // and `getGuestTokenManager()` throws outside the browser.
    const existingToken =
      typeof window === "undefined"
        ? null
        : getGuestTokenManager().getAccessToken();
    return existingToken
      ? {
          ...INITIAL_STATE,
          guestAccessToken: existingToken,
          isGuest: true,
          isInitializing: false,
        }
      : INITIAL_STATE;
  });
  /**
   * `guestTokenManager.addListener` callback below — reacts to a guest
   * access token appearing/disappearing (restored, created via the captcha
   * flow, or cleared by the proactive-refresh timer hitting an
   * expired/rotated refresh token).
   */
  const handleGuestAccessTokenChange = (accessToken: string | null) => {
    setState((previous) => ({
      ...previous,
      guestAccessToken: accessToken,
      isGuest: accessToken !== null,
      // A session appearing (restored, or created via the captcha flow
      // below) always means the challenge is no longer needed. The
      // reverse — a token going away, e.g. the proactive-refresh timer
      // hitting an expired/rotated guest refresh token — always means a
      // NEW guest session must be provisioned, so re-arm the captcha
      // instead of leaving `needsCaptcha` at its old (possibly `false`)
      // value: without this, a guest session that silently expires
      // mid-visit never recovers (no captcha ever shows again to
      // re-provision one). Safe even during the authenticated-teardown
      // path above: `value` below ignores `state` entirely whenever
      // `isAuthenticated` is true.
      needsCaptcha: accessToken === null,
    }));
    if (accessToken !== null) {
      flushGuestTokenWaiters({ token: accessToken });
    }
  };

  // Server-read `guest_session` cookie presence — destructured to a
  // primitive so the effect below can depend on it without re-running every
  // time a caller passes a fresh `initialState` object.
  const hasGuestSessionCookie = initialState?.hasGuestSessionCookie;

  // Tear down any existing guest session once a real identity is
  // authenticated — no state update needed here, `value` below already
  // computes the logged-out-guest shape directly from `isAuthenticated` once
  // it's true. Only actually calls the backend (`POST
  // /api/anon/session/logout`) when a guest session could plausibly exist —
  // per the server-read `initialState`, or unknown (`initialState ===
  // undefined`, e.g. any other call site) — skipping it for the common
  // steady-state case of an already-authenticated user reloading a page that
  // never had a guest cookie to begin with.
  useEffect(() => {
    if (isAuthInitializing || !isAuthenticated) {
      return;
    }
    if (initialState === undefined || hasGuestSessionCookie) {
      void getGuestTokenManager().logout();
    }
  }, [
    isAuthenticated,
    isAuthInitializing,
    initialState,
    hasGuestSessionCookie,
  ]);

  // oxlint-disable-next-line react-doctor/effect-needs-cleanup
  useEffect(() => {
    // Wait for the authenticated identity to settle first — a still-restoring
    // auth session shouldn't cause a guest session to be provisioned and
    // then immediately torn down a moment later — and skip entirely once
    // authenticated, since the effect above owns that teardown.
    if (isAuthInitializing || isAuthenticated) {
      return;
    }

    let restoreWasCancelled = false;
    const guestTokenManager = getGuestTokenManager();
    const unsubscribe = guestTokenManager.addListener({
      onAccessTokenChange: handleGuestAccessTokenChange,
    });

    // A server-read `guest_session` cookie presence check
    // (`GuestSessionInitialState`) already told us there's no cookie at all —
    // skip the round-trip a `restoreSessionOnce()` call would need (it
    // returns a clean `200 { accessToken: null }` either way, not an error —
    // see route.ts — so this is purely about not waiting on it, not about
    // dodging a failure) instead of blocking the captcha on it.
    const hasNoGuestCookie =
      initialState !== undefined && !hasGuestSessionCookie;

    const restore = async () => {
      if (!hasNoGuestCookie) {
        await guestTokenManager.restoreSessionOnce();
      }
      if (restoreWasCancelled) {
        return;
      }
      setState((previous) => ({
        ...previous,
        isInitializing: false,
        needsCaptcha: guestTokenManager.getAccessToken() === null,
      }));
    };
    void restore();

    return () => {
      restoreWasCancelled = true;
      unsubscribe();
    };
  }, [
    isAuthenticated,
    isAuthInitializing,
    initialState,
    hasGuestSessionCookie,
  ]);

  const handleCaptchaGiveUp = () => {
    setState((previous) => ({ ...previous, captchaFailed: true }));
    flushGuestTokenWaiters({ error: new Error("Guest verification failed") });
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

    const { promise, resolve, reject } = Promise.withResolvers<string>();
    const waiter: TokenWaiter = { reject, resolve };
    const timer = setTimeout(() => {
      guestTokenWaiters = guestTokenWaiters.filter((w) => w !== waiter);
      reject(new Error("Timed out waiting for guest session"));
    }, timeoutMs);

    guestTokenWaiters.push({
      reject: (error) => {
        clearTimeout(timer);
        reject(error);
      },
      resolve: (token) => {
        clearTimeout(timer);
        resolve(token);
      },
    });

    return promise;
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
    <GuestSessionContext value={value}>
      {value.needsCaptcha && !value.captchaFailed && siteKey ? (
        <GuestCaptchaWidget onGiveUp={handleCaptchaGiveUp} siteKey={siteKey} />
      ) : null}
      {children}
    </GuestSessionContext>
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
