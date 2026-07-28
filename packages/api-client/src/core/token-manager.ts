import { createBroadcastChannel } from "@cs/core/broadcast";
import type { BroadcastChannelBus } from "@cs/core/broadcast";
import { decodeJwtExpiryMs } from "@cs/core/jwt";

import { ApiError } from "../errors/api-error";
import type { ApiResult } from "../errors/api-error";
import type { IdentityMode } from "../types";
import { httpRequest } from "./http-client";
import { sleep } from "./retry";

const LOCK_NAME_PREFIX = "cs-vulcan-token-refresh";
const BROADCAST_CHANNEL_NAME_PREFIX = "cs-vulcan-token-sync";
/** Refresh this many ms before `exp` — see docs/runbook/api-client.md §4.3/§4.4 (no refresh-token grace period). */
const PROACTIVE_REFRESH_SAFETY_BUFFER_MS = 75_000;
/**
 * Confirmed directly against stg-api.vulcanlabs.co (2026-07-21, see
 * docs/runbook/api-client.md §4.3 point 5) — the backend returns this exact
 * reason both when a refresh_token is genuinely expired AND when it was
 * already rotated by a concurrent refresh (this session's own race-loser
 * case, distinct from a malformed/garbage token, which comes back as
 * `INVALID_TOKEN` instead and is never retried).
 */
const REFRESH_RACE_REASON = "TOKEN_EXPIRED";
const REFRESH_RACE_RETRY_BASE_MS = 200;
const REFRESH_RACE_RETRY_JITTER_MS = 300;

interface RefreshResponse {
  accessToken: string;
  accessTokenExpiresAt?: number;
}

/**
 * `GET /api/auth/session` (restore-only) reports "no session" as a `200`
 * with `accessToken: null` instead of a `401` — see that route's doc
 * comment. `POST /api/auth/refresh` (`RefreshResponse` above) never has
 * this ambiguity: a failed rotation is always a real error.
 */
interface RestoreResponse {
  accessToken: string | null;
  accessTokenExpiresAt?: number;
}

type BroadcastMessage =
  | { type: "refreshed"; accessToken: string; expiresAt: number }
  | { type: "logout" }
  | { type: "pending"; pending: boolean };

interface Session {
  accessToken: string;
  expiresAt: number;
}

export interface TokenManagerOptions {
  identity?: IdentityMode;
  /** Same-origin Route Handler — always forces a real refresh-token rotation. Used by the proactive timer and reactive 401 handling, never by `restoreSessionOnce()` (see §4.1/§4.3). */
  refreshEndpoint?: string;
  /** Same-origin Route Handler — reads the mirrored `access_token` cookie first, only rotates if it's missing/expired. Used ONLY by `restoreSessionOnce()` on cold load, so a reload with a still-valid access token costs zero backend rotations. */
  restoreEndpoint?: string;
  logoutEndpoint?: string;
  onAccessTokenChange?: (accessToken: string | null) => void;
  /** Fires on every tab, including the one that called `setPending()` — see `setPending()`. */
  onPendingChange?: (pending: boolean) => void;
}

/**
 * Owns the in-memory access token for one browser tab: single-flight
 * refresh, proactive refresh before `exp`, and cross-tab coordination via
 * Web Locks + BroadcastChannel. See docs/runbook/api-client.md §4.3 — this
 * coordination is mandatory, not best-effort, because the backend has no
 * refresh-token rotation grace period.
 */
export class TokenManager {
  private session: Session | null = null;
  private pending = false;
  private restorePromise: Promise<void> | null = null;
  private readonly identity: IdentityMode;
  private readonly refreshEndpoint: string;
  private readonly restoreEndpoint: string;
  private readonly logoutEndpoint: string;
  private readonly onAccessTokenChange?: (token: string | null) => void;
  private readonly onPendingChange?: (pending: boolean) => void;
  private inFlightRefresh: Promise<ApiResult<string>> | null = null;
  private proactiveTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly lockName: string;
  private readonly channel: BroadcastChannelBus<BroadcastMessage>;
  private readonly unsubscribeChannel: () => void;

  constructor(options: TokenManagerOptions = {}) {
    this.identity = options.identity ?? "authenticated";
    this.refreshEndpoint = options.refreshEndpoint ?? "/api/auth/refresh";
    this.restoreEndpoint = options.restoreEndpoint ?? "/api/auth/session";
    this.logoutEndpoint = options.logoutEndpoint ?? "/api/auth/logout";
    this.onAccessTokenChange = options.onAccessTokenChange;
    this.onPendingChange = options.onPendingChange;

    // Scoped by identity — a guest and an authenticated TokenManager can be
    // live in the same tab at once (see `getGuestTokenManager()`), and must
    // never share a lock or broadcast channel with each other, only with
    // same-identity instances in other tabs.
    this.lockName = `${LOCK_NAME_PREFIX}-${this.identity}`;
    this.channel = createBroadcastChannel<BroadcastMessage>(
      `${BROADCAST_CHANNEL_NAME_PREFIX}-${this.identity}`
    );
    this.unsubscribeChannel = this.channel.subscribe(this.handleBroadcast);
  }

  getAccessToken(): string | null {
    return this.session?.accessToken ?? null;
  }

  getIdentity(): IdentityMode {
    return this.identity;
  }

  isExpired(): boolean {
    return !this.session || Date.now() >= this.session.expiresAt;
  }

  getPending(): boolean {
    return this.pending;
  }

  /**
   * Marks a sign-in/sign-out as in progress across every tab — for UI that
   * wants to disable its own auth button while a *different* tab is mid-flow
   * (e.g. a Firebase popup awaiting the user), not just while this tab's own
   * request is in flight. Purely a UI signal: unlike `setSession`/`logout`,
   * nothing here touches the actual session state.
   */
  setPending(pending: boolean, broadcast = true): void {
    this.pending = pending;
    this.onPendingChange?.(pending);
    if (broadcast) {
      this.channel.publish({
        pending,
        type: "pending",
      } satisfies BroadcastMessage);
    }
  }

  /** Called right after Firebase->Vulcan exchange, with the token from the JSON response body. */
  setSession(accessToken: string, expiresAt?: number): void {
    this.applySession({
      accessToken,
      expiresAt: expiresAt ?? decodeJwtExpiryMs(accessToken),
    });
  }

  /**
   * Returns a valid access token, transparently refreshing if the current
   * one is missing/expired. Safe to call from many concurrent requests —
   * they all await the same in-flight refresh (single-flight).
   */
  ensureAccessToken(): Promise<ApiResult<string>> {
    if (this.session && !this.isExpired()) {
      return Promise.resolve([null, this.session.accessToken]);
    }
    return this.refresh();
  }

  /**
   * Attempts to restore a session from the `refresh_token` cookie exactly
   * once per tab lifetime, no matter how many times `ApiAuthProvider`
   * mounts. `TokenManager` is a per-tab singleton (`getTokenManager()`) that
   * outlives any one React component instance — a client-side navigation
   * that remounts `ApiAuthProvider` must NOT re-trigger a real restore call
   * when already known to be logged out; that cookie's presence/absence
   * doesn't change between remounts within the same tab.
   *
   * Caches the in-flight PROMISE (`restorePromise`), not just a boolean —
   * React's Strict Mode (`reactStrictMode: true`, see
   * `packages/next-config/src/config.ts`) double-invokes effects in dev, so
   * `ApiAuthProvider`'s mount effect calls this twice back-to-back, well
   * before the first call's network round-trip resolves. A boolean guard
   * (the previous implementation) let the second call see the flag already
   * set and return immediately — resolving `isInitializing: false` in
   * `ApiAuthProvider` before `accessToken` was actually set, which visibly
   * flashed a "signed out" UI (e.g. `AuthStatus` briefly rendering
   * `SignInWithGoogleButton`) for an already-authenticated user before
   * flipping to the real signed-in view a moment later. Caching the promise
   * means every caller — however many times this is invoked — awaits the
   * SAME underlying restore attempt and only resolves once it actually
   * settles, the same single-flight shape `refresh()` already uses via
   * `inFlightRefresh`.
   *
   * Goes through `refresh({ cacheFirst: true })`, NOT a plain call to
   * `restoreEndpoint` — it still needs the same Web Locks/single-flight
   * protection as a real rotation, because `restoreEndpoint` itself falls
   * through to a real rotation server-side when the mirrored `access_token`
   * cookie is missing/expired (see `ensureServerAccessToken()`), and that
   * fallback case is exactly as race-prone across concurrently-reloading
   * tabs as `refresh()`'s existing rotate path.
   */
  async restoreSessionOnce(): Promise<void> {
    if (!this.restorePromise) {
      // Callers only need to know the attempt settled, not its result (a
      // settled error is as legitimate an outcome as success, see
      // `ApiAuthProvider`'s doc comment) — hence `Promise<void>`.
      this.restorePromise = (async () => {
        await this.refresh({ cacheFirst: true });
      })();
    }
    await this.restorePromise;
  }

  /** Explicit refresh entry point — used both by the proactive timer and by reactive 401 handling. Always forces a real rotation unless `cacheFirst` is set (only `restoreSessionOnce()` does that). */
  async refresh(
    options: { cacheFirst?: boolean } = {}
  ): Promise<ApiResult<string>> {
    if (this.inFlightRefresh) {
      return this.inFlightRefresh;
    }
    const run = this.runRefreshWithLock(options.cacheFirst ?? false);
    this.inFlightRefresh = run;
    try {
      return await run;
    } finally {
      this.inFlightRefresh = null;
    }
  }

  async logout(): Promise<void> {
    try {
      await httpRequest(this.logoutEndpoint, { method: "POST" });
    } catch {
      // Best-effort — cookies are cleared server-side regardless (see server/server-fetch.ts#logoutSession).
    }
    this.clearSession();
  }

  dispose(): void {
    this.clearProactiveTimer();
    this.unsubscribeChannel();
    this.channel.close();
  }

  private readonly handleBroadcast = (message: BroadcastMessage) => {
    if (message.type === "refreshed") {
      this.applySession(
        { accessToken: message.accessToken, expiresAt: message.expiresAt },
        false
      );
    } else if (message.type === "logout") {
      this.clearSession(false);
    } else if (message.type === "pending") {
      this.setPending(message.pending, false);
    }
  };

  private runRefreshWithLock(cacheFirst: boolean): Promise<ApiResult<string>> {
    if (typeof navigator !== "undefined" && navigator.locks) {
      return navigator.locks.request(this.lockName, () =>
        this.performRefresh(cacheFirst)
      );
    }
    // Web Locks unsupported (very old browser) — same-tab single-flight above still applies.
    return this.performRefresh(cacheFirst);
  }

  private async performRefresh(
    cacheFirst: boolean
  ): Promise<ApiResult<string>> {
    // Lock acquired: a sibling tab may have already refreshed and broadcast
    // a fresh token while we were waiting — reuse it instead of refreshing again.
    if (this.session && !this.isExpired()) {
      return [null, this.session.accessToken];
    }

    if (cacheFirst) {
      return this.performCacheFirstRestore();
    }

    const first = await this.callRefreshEndpoint();

    // A short jittered wait, then ONE fresh call to `refreshEndpoint` — not
    // a retry with the same in-memory refresh_token, but a brand new HTTP
    // request that re-reads whatever refresh_token cookie the browser has
    // *right now*. If this was the race loser, a concurrent winner's
    // rotation has likely landed by then and this succeeds; if the token is
    // genuinely expired, it fails again harmlessly.
    const [error, result] =
      first[0]?.reason === REFRESH_RACE_REASON
        ? await sleep(
            REFRESH_RACE_RETRY_BASE_MS +
              Math.random() * REFRESH_RACE_RETRY_JITTER_MS
          ).then(() => this.callRefreshEndpoint())
        : first;

    if (error) {
      if (error.isAuthError) {
        this.clearSession();
      }
      return [error, null];
    }

    this.applySession({
      accessToken: result.accessToken,
      expiresAt:
        result.accessTokenExpiresAt ?? decodeJwtExpiryMs(result.accessToken),
    });
    return [null, result.accessToken];
  }

  /**
   * `restoreEndpoint` (`GET /api/auth/session` server-side) reads the
   * mirrored `access_token` cookie first and only rotates via a real
   * `refreshServerSession()` call when that cookie is missing/expired — this
   * method just applies whatever it returns, no jittered race-retry needed
   * here since a cache hit never touches the backend at all (nothing to
   * race), and a cache miss falls through to the exact same rotation the
   * non-cache-first path performs (still inside the same Web Lock).
   */
  private async performCacheFirstRestore(): Promise<ApiResult<string>> {
    const [error, result] = await this.callRestoreEndpoint();
    if (error) {
      if (error.isAuthError) {
        this.clearSession();
      }
      return [error, null];
    }

    if (result.accessToken === null) {
      // "No session" reported as a `200` (see route.ts's doc comment), not
      // a `401` — reconstruct the same outcome `restoreSessionOnce()`'s
      // only caller already handles (`isAuthError` → `clearSession()`) so
      // nothing downstream needs to know this didn't arrive as a real HTTP
      // error this time.
      this.clearSession();
      return [
        new ApiError({
          httpStatus: 401,
          kind: "backend",
          message: "No session to restore",
          reason: "ERROR_INVALID_AUTHORIZATION",
        }),
        null,
      ];
    }

    this.applySession({
      accessToken: result.accessToken,
      expiresAt:
        result.accessTokenExpiresAt ?? decodeJwtExpiryMs(result.accessToken),
    });
    return [null, result.accessToken];
  }

  private callRefreshEndpoint(): Promise<ApiResult<RefreshResponse>> {
    return httpRequest<RefreshResponse>(this.refreshEndpoint, {
      method: "POST",
    });
  }

  private callRestoreEndpoint(): Promise<ApiResult<RestoreResponse>> {
    return httpRequest<RestoreResponse>(this.restoreEndpoint, {
      method: "GET",
    });
  }

  private applySession(session: Session, broadcast = true): void {
    this.session = session;
    this.onAccessTokenChange?.(session.accessToken);
    this.scheduleProactiveRefresh();
    if (broadcast) {
      this.channel.publish({
        accessToken: session.accessToken,
        expiresAt: session.expiresAt,
        type: "refreshed",
      } satisfies BroadcastMessage);
    }
  }

  private clearSession(broadcast = true): void {
    this.session = null;
    this.clearProactiveTimer();
    this.onAccessTokenChange?.(null);
    if (broadcast) {
      this.channel.publish({ type: "logout" } satisfies BroadcastMessage);
    }
  }

  private scheduleProactiveRefresh(): void {
    this.clearProactiveTimer();
    if (!this.session) {
      return;
    }
    const delay = Math.max(
      this.session.expiresAt - Date.now() - PROACTIVE_REFRESH_SAFETY_BUFFER_MS,
      0
    );
    this.proactiveTimer = setTimeout(() => {
      void this.refresh();
    }, delay);
  }

  private clearProactiveTimer(): void {
    if (this.proactiveTimer) {
      clearTimeout(this.proactiveTimer);
      this.proactiveTimer = null;
    }
  }
}

let browserTokenManager: TokenManager | undefined;
let browserGuestTokenManager: TokenManager | undefined;

/** Module-level singleton for the browser — one TokenManager per tab (see §4.2). */
export const getTokenManager = (
  options?: TokenManagerOptions
): TokenManager => {
  if (typeof window === "undefined") {
    throw new TypeError(
      "getTokenManager() must only be called in the browser — use the server/* subpath for Server Components/Actions."
    );
  }
  if (!browserTokenManager) {
    browserTokenManager = new TokenManager(options);
  }
  return browserTokenManager;
};

/**
 * Second, independent singleton for the guest identity — same `TokenManager`
 * class, pointed at the `/api/anon/*` BFF routes instead of `/api/auth/*`
 * (see docs/runbook/api-client.md §4.5). Deliberately a distinct instance
 * from `getTokenManager()`, not a shared one with an `identity` toggle: a
 * guest session and an authenticated session can legitimately coexist for a
 * moment during sign-in (guest cookie still present until the handoff
 * clears it), so each identity needs its own in-memory token, timers, and
 * broadcast coordination.
 */
export const getGuestTokenManager = (
  options?: Omit<TokenManagerOptions, "identity">
): TokenManager => {
  if (typeof window === "undefined") {
    throw new TypeError(
      "getGuestTokenManager() must only be called in the browser — use the server/* subpath for Server Components/Actions."
    );
  }
  if (!browserGuestTokenManager) {
    browserGuestTokenManager = new TokenManager({
      logoutEndpoint: "/api/anon/session/logout",
      refreshEndpoint: "/api/anon/session/refresh",
      restoreEndpoint: "/api/anon/session",
      ...options,
      identity: "guest",
    });
  }
  return browserGuestTokenManager;
};
