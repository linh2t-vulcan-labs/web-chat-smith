"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

import { getTokenManager } from "../core/token-manager";
import type { TokenManager, TokenManagerOptions } from "../core/token-manager";

interface AuthContextValue {
  accessToken: string | null;
  isAuthenticated: boolean;
  /** True until the mount-time session restore (via the `refresh_token` cookie) settles — lets callers avoid flashing a logged-out UI on reload. */
  isInitializing: boolean;
  /** True while a sign-in/sign-out is in progress in ANY tab — see `TokenManager.setPending()`. UI can use this to disable its own auth button while a different tab is mid-flow. */
  isPending: boolean;
  /** Wraps `TokenManager.setPending()` — callers bracket their sign-in/sign-out flow with `setPending(true)`/`setPending(false)`. */
  setPending: (pending: boolean) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export interface ApiAuthProviderProps {
  children: ReactNode;
  options?: TokenManagerOptions;
}

interface AuthState {
  tokenManager: TokenManager | null;
  accessToken: string | null;
  isInitializing: boolean;
  isPending: boolean;
}

const INITIAL_STATE: AuthState = {
  accessToken: null,
  isInitializing: true,
  isPending: false,
  tokenManager: null,
};

/**
 * Holds the single per-tab TokenManager instance and exposes session state
 * to the component tree — mount once near the app root, above anything
 * that calls an `auth: "required"` endpoint (see §4/§7).
 *
 * `getTokenManager()` is only ever called from inside the effect (never
 * during render) — it throws outside the browser, and this "use client"
 * component still renders once on the server for the initial HTML.
 */
export const ApiAuthProvider = ({
  children,
  options,
}: ApiAuthProviderProps) => {
  const [state, setState] = useState<AuthState>(INITIAL_STATE);

  useEffect(() => {
    const tokenManager = getTokenManager({
      ...options,
      onAccessTokenChange: (accessToken) => {
        setState((previous) => ({ ...previous, accessToken }));
        options?.onAccessTokenChange?.(accessToken);
      },
      onPendingChange: (isPending) => {
        setState((previous) => ({ ...previous, isPending }));
        options?.onPendingChange?.(isPending);
      },
    });
    // Initializing local state from a freshly-constructed external
    // singleton on mount — the sanctioned "subscribe to an external system"
    // effect shape, just without an extra render cycle in between.
    // oxlint-disable-next-line react/react-compiler -- initial sync from the TokenManager singleton, not a derivable render value
    setState({
      accessToken: tokenManager.getAccessToken(),
      isInitializing: true,
      isPending: tokenManager.getPending(),
      tokenManager,
    });

    // On a cold load, the TokenManager instance above is fresh (in-memory
    // only) even when a valid `refresh_token` httpOnly cookie survived the
    // reload — without this, every consumer stays "logged out" until
    // something else happens to call an `auth: "required"` endpoint.
    // `restoreSessionOnce()` only actually hits `GET /api/auth/session` the
    // FIRST time this runs for the tab — this effect re-runs on every
    // `ApiAuthProvider` remount (e.g. a locale switch remounts everything
    // under `[locale]/layout.tsx`), and repeating a doomed-to-401 restore
    // call each time when already known to be logged out would be both
    // wasted requests and console noise. That restore call is itself
    // cache-first (reads the mirrored `access_token` cookie server-side,
    // only forces a real refresh-token rotation if it's missing/expired —
    // see `TokenManager.restoreSessionOnce()`), so a warm reload settles
    // near-instantly with zero backend rotations. A settled error (e.g. no
    // cookie) is just as legitimate an outcome as success, not a failure to
    // surface — success is reported separately via `onAccessTokenChange`.
    const restoreSession = async () => {
      await tokenManager.restoreSessionOnce();
      setState((previous) => ({ ...previous, isInitializing: false }));
    };
    void restoreSession();
    // getTokenManager() is a per-tab singleton — options only take effect on
    // the first construction, so this intentionally runs once on mount.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AuthContextValue = {
    accessToken: state.accessToken,
    isAuthenticated: state.accessToken !== null,
    isInitializing: state.isInitializing,
    isPending: state.isPending,
    logout: async () => {
      await state.tokenManager?.logout();
    },
    setPending: (pending) => {
      state.tokenManager?.setPending(pending);
    },
  };

  // oxlint-disable-next-line react/jsx-no-constructed-context-values -- React Compiler (enabled for this app) memoizes this automatically
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useApiAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useApiAuth must be used within an <ApiAuthProvider>");
  }
  return context;
};
