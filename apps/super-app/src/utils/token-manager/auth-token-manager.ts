import type { ITokenHandler } from "@/core/models/token-handler";
import { internalLogout } from "@/libs/auth-v2/functions/internal-logout";
import { internalRefreshToken } from "@/libs/auth-v2/functions/internal-refresh-token";

import {
  clearAuthStorage,
  generateRandomUUIDV4,
  isServer,
  localStorageImpl,
} from "../commons/helpers";
import { LOCAL_STORAGE_KEY } from "../commons/keys";
import { handleLogoutRedirect } from "../commons/logout-redirect";
import { navigateOnTokenExpiry } from "./navigation-bridge";

const AUTH_REFRESH_LOCK_TIMEOUT_MS = 15_000;
const AUTH_REFRESH_WAIT_INTERVAL_MS = 250;
const AUTH_REFRESH_WAIT_TIMEOUT_MS = 10_000;

interface TAuthRefreshLock {
  ownerId: string;
  expiresAt: number;
}

export class AuthTokenManager implements ITokenHandler {
  private static refreshPromise: Promise<{
    accessToken: string;
    error: unknown | null;
  }> | null = null;

  private readonly refreshLockOwnerId = isServer
    ? "server"
    : generateRandomUUIDV4();

  private getFullAuthStoreData() {
    if (isServer) {
      return null;
    }
    try {
      return localStorageImpl.load<{
        state: {
          accessToken: string | null;
          [key: string]: unknown;
        };
        version: number;
      }>(LOCAL_STORAGE_KEY.AUTH_STORE_DATA);
    } catch (error) {
      console.warn("[AuthTokenManager] Failed to read auth store data:", error);
      return null;
    }
  }

  private getAuthStoreState() {
    const fullData = this.getFullAuthStoreData();
    return fullData?.state;
  }

  private getRefreshLock(): TAuthRefreshLock | null {
    if (isServer) {
      return null;
    }

    try {
      return localStorageImpl.load<TAuthRefreshLock>(
        LOCAL_STORAGE_KEY.AUTH_REFRESH_LOCK
      );
    } catch (error) {
      console.warn("[AuthTokenManager] Failed to read refresh lock:", error);
      return null;
    }
  }

  private isRefreshLockActive(): boolean {
    const refreshLock = this.getRefreshLock();
    return Boolean(refreshLock && refreshLock.expiresAt > Date.now());
  }

  private tryAcquireRefreshLock(): boolean {
    if (isServer) {
      return true;
    }

    const now = Date.now();
    const currentLock = this.getRefreshLock();

    if (
      currentLock &&
      currentLock.expiresAt > now &&
      currentLock.ownerId !== this.refreshLockOwnerId
    ) {
      return false;
    }

    const nextLock: TAuthRefreshLock = {
      expiresAt: now + AUTH_REFRESH_LOCK_TIMEOUT_MS,
      ownerId: this.refreshLockOwnerId,
    };

    localStorage.setItem(
      LOCAL_STORAGE_KEY.AUTH_REFRESH_LOCK,
      JSON.stringify(nextLock)
    );

    const confirmedLock = this.getRefreshLock();
    return confirmedLock?.ownerId === this.refreshLockOwnerId;
  }

  private releaseRefreshLock(): void {
    if (isServer) {
      return;
    }

    const currentLock = this.getRefreshLock();
    if (currentLock?.ownerId === this.refreshLockOwnerId) {
      localStorage.removeItem(LOCAL_STORAGE_KEY.AUTH_REFRESH_LOCK);
    }
  }

  private async waitForRefreshToFinish(previousAccessToken: string) {
    if (isServer) {
      return null;
    }

    const startTime = Date.now();

    while (Date.now() - startTime < AUTH_REFRESH_WAIT_TIMEOUT_MS) {
      const latestAccessToken = this.getAccessToken();

      if (latestAccessToken && latestAccessToken !== previousAccessToken) {
        return {
          accessToken: latestAccessToken,
          error: null,
        };
      }

      if (!this.isRefreshLockActive()) {
        break;
      }

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, AUTH_REFRESH_WAIT_INTERVAL_MS);
      });
    }

    return null;
  }

  getAccessToken() {
    if (isServer) {
      return "";
    }
    const authStoreState = this.getAuthStoreState();
    return authStoreState?.accessToken || "";
  }

  setAccessToken(token: string) {
    if (!isServer && token) {
      try {
        const fullAuthStoreData = this.getFullAuthStoreData() ?? {
          state: {
            accessToken: null,
          },
          version: 0,
        };

        fullAuthStoreData.state.accessToken = token;
        fullAuthStoreData.state.isAuthenticated = true;
        localStorageImpl.save(
          LOCAL_STORAGE_KEY.AUTH_STORE_DATA,
          fullAuthStoreData
        );
      } catch (error) {
        console.warn(
          "[AuthTokenManager] Failed to update auth store access token:",
          error
        );
      }
    }
  }

  async refreshToken() {
    if (AuthTokenManager.refreshPromise) {
      return AuthTokenManager.refreshPromise;
    }

    const currentAccessToken = this.getAccessToken();

    if (!this.tryAcquireRefreshLock()) {
      const sharedRefreshResult =
        await this.waitForRefreshToFinish(currentAccessToken);

      if (sharedRefreshResult?.accessToken) {
        return sharedRefreshResult;
      }

      console.warn(
        "[AuthTokenManager] Refresh lock timed out, retrying refresh locally."
      );

      if (!this.tryAcquireRefreshLock()) {
        return {
          accessToken: "",
          error: new Error("Timed out waiting for refresh token rotation"),
        };
      }
    }

    const runRefresh = async () => {
      try {
        const [error, result] = await internalRefreshToken();

        if (error || !result?.accessToken) {
          this.clearAccessToken();
          return {
            accessToken: "",
            error: error ?? new Error("Failed to refresh access token"),
          };
        }

        this.setAccessToken(result.accessToken);

        return {
          accessToken: result.accessToken,
          error: null,
        };
      } finally {
        this.releaseRefreshLock();
        AuthTokenManager.refreshPromise = null;
      }
    };

    AuthTokenManager.refreshPromise = runRefresh();

    return AuthTokenManager.refreshPromise;
  }

  clearAccessToken() {
    if (!isServer) {
      try {
        const fullAuthStoreData = this.getFullAuthStoreData();

        if (fullAuthStoreData) {
          fullAuthStoreData.state.accessToken = null;
          fullAuthStoreData.state.isAuthenticated = false;
          localStorageImpl.save(
            LOCAL_STORAGE_KEY.AUTH_STORE_DATA,
            fullAuthStoreData
          );
        }
      } catch (error) {
        console.warn(
          "[AuthTokenManager] Failed to clear auth store access token:",
          error
        );
      }
    }
  }

  clearAll() {
    this.clearAccessToken();
    clearAuthStorage();
  }

  async onExpire() {
    this.clearAll();
    await internalLogout();

    // Get current pathname for callback URL
    const currentPathname = window.location.pathname;
    // const creativeStudioFallbackPath = this.getCreativeStudioFallbackPath(currentPathname);
    // if (creativeStudioFallbackPath) {
    //   if (creativeStudioFallbackPath !== currentPathname) {
    //     window.location.href = creativeStudioFallbackPath;
    //   }

    //   return;
    // }

    // Get current query parameters to preserve them
    const currentQueryParams = new URLSearchParams(window.location.search);

    // Redirect to guest mode with callback URL and preserved query params
    const redirectUrl = handleLogoutRedirect(
      currentPathname,
      true,
      currentQueryParams
    );
    // Client-side transition instead of a hard reload: avoids remounting the
    // whole app shell (and its bootstrap loading overlay) a second time.
    navigateOnTokenExpiry(redirectUrl.replace(window.location.origin, ""));
  }
}
