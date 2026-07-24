"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

import { getTokenManager } from "../core/token-manager";
import type { TokenManager, TokenManagerOptions } from "../core/token-manager";

interface AuthContextValue {
  accessToken: string | null;
  isAuthenticated: boolean;
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
}

const INITIAL_STATE: AuthState = { accessToken: null, tokenManager: null };

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
    });
    // Initializing local state from a freshly-constructed external
    // singleton on mount — the sanctioned "subscribe to an external system"
    // effect shape, just without an extra render cycle in between.
    // oxlint-disable-next-line react/react-compiler -- initial sync from the TokenManager singleton, not a derivable render value
    setState({ accessToken: tokenManager.getAccessToken(), tokenManager });
    // getTokenManager() is a per-tab singleton — options only take effect on
    // the first construction, so this intentionally runs once on mount.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AuthContextValue = {
    accessToken: state.accessToken,
    isAuthenticated: state.accessToken !== null,
    logout: async () => {
      await state.tokenManager?.logout();
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
