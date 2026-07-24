import { decodeJwtExpiryMs } from "@cs/core/jwt";

import type { ApiResult } from "../errors/api-error";
import type { IdentityMode } from "../types";
import { httpRequest } from "./http-client";
import { sleep } from "./retry";

const LOCK_NAME = "cs-vulcan-token-refresh";
const BROADCAST_CHANNEL_NAME = "cs-vulcan-token-sync";
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

type BroadcastMessage =
  | { type: "refreshed"; accessToken: string; expiresAt: number }
  | { type: "logout" };

interface Session {
  accessToken: string;
  expiresAt: number;
}

export interface TokenManagerOptions {
  identity?: IdentityMode;
  /** Same-origin Route Handler — reads the httpOnly refresh_token cookie server-side (see §4.1/§4.3). */
  refreshEndpoint?: string;
  logoutEndpoint?: string;
  onAccessTokenChange?: (accessToken: string | null) => void;
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
  private readonly identity: IdentityMode;
  private readonly refreshEndpoint: string;
  private readonly logoutEndpoint: string;
  private readonly onAccessTokenChange?: (token: string | null) => void;
  private inFlightRefresh: Promise<ApiResult<string>> | null = null;
  private proactiveTimer: ReturnType<typeof setTimeout> | null = null;
  private channel: BroadcastChannel | null = null;

  constructor(options: TokenManagerOptions = {}) {
    this.identity = options.identity ?? "authenticated";
    this.refreshEndpoint = options.refreshEndpoint ?? "/api/auth/refresh";
    this.logoutEndpoint = options.logoutEndpoint ?? "/api/auth/logout";
    this.onAccessTokenChange = options.onAccessTokenChange;

    if (typeof BroadcastChannel !== "undefined") {
      this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      this.channel.addEventListener("message", this.handleBroadcast);
    }
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

  /** Explicit refresh entry point — used both by the proactive timer and by reactive 401 handling. */
  async refresh(): Promise<ApiResult<string>> {
    if (this.inFlightRefresh) {
      return this.inFlightRefresh;
    }
    const run = this.runRefreshWithLock();
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
    this.channel?.removeEventListener("message", this.handleBroadcast);
    this.channel?.close();
  }

  private readonly handleBroadcast = (
    event: MessageEvent<BroadcastMessage>
  ) => {
    const message = event.data;
    if (message.type === "refreshed") {
      this.applySession(
        { accessToken: message.accessToken, expiresAt: message.expiresAt },
        false
      );
    } else if (message.type === "logout") {
      this.clearSession(false);
    }
  };

  private runRefreshWithLock(): Promise<ApiResult<string>> {
    if (typeof navigator !== "undefined" && navigator.locks) {
      return navigator.locks.request(LOCK_NAME, () => this.performRefresh());
    }
    // Web Locks unsupported (very old browser) — same-tab single-flight above still applies.
    return this.performRefresh();
  }

  private async performRefresh(): Promise<ApiResult<string>> {
    // Lock acquired: a sibling tab may have already refreshed and broadcast
    // a fresh token while we were waiting — reuse it instead of refreshing again.
    if (this.session && !this.isExpired()) {
      return [null, this.session.accessToken];
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

  private callRefreshEndpoint(): Promise<ApiResult<RefreshResponse>> {
    return httpRequest<RefreshResponse>(this.refreshEndpoint, {
      method: "POST",
    });
  }

  private applySession(session: Session, broadcast = true): void {
    this.session = session;
    this.onAccessTokenChange?.(session.accessToken);
    this.scheduleProactiveRefresh();
    if (broadcast) {
      this.channel?.postMessage({
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
      this.channel?.postMessage({ type: "logout" } satisfies BroadcastMessage);
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
