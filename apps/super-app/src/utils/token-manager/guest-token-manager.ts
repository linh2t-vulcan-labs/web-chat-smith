import type { ITokenHandler } from "@/core/models/token-handler";
import type { GuestSessionModel } from "@/features/guest-mode/models";
import { getGlobalGuestStore } from "@/features/guest-mode/stores/guest-mode/store";

import { isServer, localStorageImpl } from "../commons/helpers";
import { LOCAL_STORAGE_KEY } from "../commons/keys";
import { safeResponseJsonFormat } from "../commons/request";

export class GuestTokenManager implements ITokenHandler {
  private getFullGuestStoreData() {
    if (isServer) {
      return null;
    }
    try {
      // Zustand persist stores data as a flat object: { deviceId, sessionId, anonId, accessToken }
      return localStorageImpl.load<{
        state: {
          accessToken?: string | null;
          deviceId?: string;
          sessionId?: string;
          anonId?: string;
          [key: string]: unknown;
        };
      }>(LOCAL_STORAGE_KEY.GUEST_STORE_DATA);
    } catch (error) {
      console.warn(
        "[GuestTokenManager] Failed to read guest store data:",
        error
      );
      return null;
    }
  }

  private getGuestStoreState() {
    // Zustand stores data directly as the state object, not wrapped in { state, version }
    return this.getFullGuestStoreData();
  }

  getAccessToken() {
    if (isServer) {
      return "";
    }
    const guestStoreState = this.getGuestStoreState();

    const accessToken = guestStoreState?.state?.accessToken || "";
    return accessToken;
  }

  setAccessToken(token: string) {
    if (!isServer && token) {
      try {
        // Try to use Zustand store API first - this ensures Zustand's persist middleware handles the save
        const guestStore = getGlobalGuestStore();
        if (guestStore) {
          const storeState = guestStore.getState();
          if (storeState && typeof storeState.setAccessToken === "function") {
            storeState.setAccessToken(token);
            // Zustand's persist middleware will handle saving to localStorage
            // It will NOT dispatch storage events (storage events only fire for OTHER tabs)
            // So we don't need to worry about conflicts here
            return;
          }
        }

        // Fallback: manually update localStorage if store is not available
        // IMPORTANT: Use localStorage.setItem directly instead of localStorageImpl.save
        // to avoid dispatching storage events that Zustand's persist middleware might react to
        const fullGuestStoreData = this.getFullGuestStoreData();
        if (fullGuestStoreData) {
          fullGuestStoreData.state.accessToken = token;
          // Direct localStorage write without dispatching storage event
          // This prevents Zustand's persist middleware from reacting and overwriting
          localStorage.setItem(
            LOCAL_STORAGE_KEY.GUEST_STORE_DATA,
            JSON.stringify(fullGuestStoreData)
          );
        } else {
          localStorage.setItem(
            LOCAL_STORAGE_KEY.GUEST_STORE_DATA,
            JSON.stringify({ accessToken: token })
          );
        }
      } catch {
        // console.warn("[GuestTokenManager] Failed to update guest store access token:", error);
      }
    }
  }

  async refreshToken() {
    try {
      const response = await fetch("/api/anon/session/refresh", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        // console.error("[GuestTokenManager] Refresh token failed:", response.status);
        // Clear guest store and reload to restart flow
        await this.onExpire();
        return null;
      }

      const refreshSession = await safeResponseJsonFormat<{
        data: Partial<GuestSessionModel>;
      }>(response);
      if (!refreshSession?.data?.accessToken) {
        // console.error("[GuestTokenManager] Invalid refresh response");
        // Clear guest store and reload to restart flow
        await this.onExpire();
        return null;
      }

      const newAccessToken = refreshSession.data.accessToken;
      this.setAccessToken(newAccessToken);

      return {
        accessToken: newAccessToken,
        error: null,
      };
    } catch {
      // console.error("[GuestTokenManager] Refresh token exception:", error);
      // Clear guest store and reload to restart flow
      await this.onExpire();
      return null;
    }
  }

  clearAccessToken() {
    if (!isServer) {
      try {
        // Try to use Zustand store API first
        const guestStore = getGlobalGuestStore();
        if (guestStore) {
          const storeState = guestStore.getState();
          if (storeState && typeof storeState.setAccessToken === "function") {
            storeState.setAccessToken("");
            return;
          }
        }

        // Fallback: manually update localStorage
        const fullGuestStoreData = this.getFullGuestStoreData();
        if (fullGuestStoreData) {
          fullGuestStoreData.state.accessToken = null;
          // Direct localStorage write without dispatching storage event
          localStorage.setItem(
            LOCAL_STORAGE_KEY.GUEST_STORE_DATA,
            JSON.stringify(fullGuestStoreData)
          );
        }
      } catch (error) {
        console.warn(
          "[GuestTokenManager] Failed to clear guest store access token:",
          error
        );
      }
    }
  }

  clearAll() {
    this.clearAccessToken();
  }

  onExpire(): Promise<void> {
    this.clearAll();
    if (!isServer) {
      localStorageImpl.remove(LOCAL_STORAGE_KEY.GUEST_STORE_DATA);

      window.location.reload();

      // Handle token expiration for guest mode
    }
    return Promise.resolve();
  }
  onTokenRefreshed?: (token: string) => void;
}
