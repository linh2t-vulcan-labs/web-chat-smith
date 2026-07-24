import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

import { userClientService } from "@/core/repositories";
import { broadcastLogout } from "@/hooks/auth/broadcast-auth-events";
import { internalLogout } from "@/libs/auth-v2/functions/internal-logout";
import { getFirebaseAuth, signOut as firebaseSignOut } from "@/libs/firebase";
import { clearAuthStorage, localStorageImpl } from "@/utils/commons/helpers";
import { LOCAL_STORAGE_KEY, USER_ID_KEY } from "@/utils/commons/keys";
import { LOGIN_PAGE_URL } from "@/utils/constants/url";
import { defaultUser } from "@/utils/constants/user";

import { defaultAuthStoreState } from "./constant";
import type { TAuthStore, TCreateAuthStoreProps } from "./types";

interface PersistedAuthData {
  state: {
    accessToken: string | null;
    [key: string]: unknown;
  };
  version: number;
}

/**
 * Extracts and saves user ID from JWT access token
 */
const saveUserIdFromToken = (accessToken: string): void => {
  try {
    const decodedJwt = jwtDecode(accessToken);
    if (decodedJwt.sub) {
      localStorageImpl.save(USER_ID_KEY, decodedJwt.sub);
    }
  } catch (error) {
    console.error("Failed to decode JWT token:", error);
  }
};

/**
 * Parses persisted auth data from localStorage
 */
const parsePersistedAuthData = (
  dataString: string | null
): PersistedAuthData | null => {
  if (!dataString) {
    return null;
  }

  try {
    return JSON.parse(dataString) as PersistedAuthData;
  } catch (error) {
    console.error("Failed to parse persisted auth data:", error);
    return null;
  }
};

/**
 * Initializes localStorage with default auth state
 */
const initializeAuthStorage = (
  state: TAuthStore,
  oldAccessToken: string | null
): void => {
  const accessToken = state.accessToken || oldAccessToken || "";

  const initialData = {
    accessToken,
    isAuthenticated: !!accessToken,
    isNewUser: state.isNewUser || false,
    justSignedIn: state.justSignedIn || false,
    provider: state.provider || "",
    source: state.source || "",
  };

  localStorage.setItem(
    LOCAL_STORAGE_KEY.AUTH_STORE_DATA,
    JSON.stringify({ state: initialData, version: 0 })
  );
};

export const createAuthStore = (props: TCreateAuthStoreProps) => {
  const { handleTransitionSignInWithProvider } = props;

  return createStore<TAuthStore>()(
    persist(
      (set, _get) => ({
        ...defaultAuthStoreState,
        clearPersistState: () => {
          set({ isNewUser: false, justSignedIn: false });
        },
        setAuthProvider: (provider) => {
          set({ provider });
        },
        setAuthSource: (source) => {
          set({ source });
        },
        setIsNewUser: (isNewUser) => {
          set({ isNewUser });
        },
        setIsOpenLoginModal: (isOpen, guestSignInSource) => {
          set({ guestSignInSource, isOpenLoginModal: isOpen });
        },
        setJustSignedIn: (justSignedIn) => {
          set({ justSignedIn });
        },
        signInWithProvider: async (
          provider,
          firebaseCredentials,
          signInSource
        ) => {
          await handleTransitionSignInWithProvider(
            provider,
            firebaseCredentials,
            signInSource
          );
        },
        signOut: async () => {
          clearAuthStorage();
          const firebaseAuth = getFirebaseAuth();
          if (firebaseAuth.currentUser) {
            await firebaseSignOut(firebaseAuth);
          }
          const [error, _] = await internalLogout();

          if (error) {
            toast.error(null, {
              description:
                "Something went wrong while processing your request. Please try again later!",
            });
          }

          set({ ...defaultAuthStoreState });
          broadcastLogout();

          // Redirect to login page without query parameters. Local session
          // state is already torn down above, so a failed cookie-clear call
          // must not strand the user on a page that still thinks they're
          // authenticated.
          globalThis.window.location.href = LOGIN_PAGE_URL;
        },
        updateUserInfo: async (userInfoVulcan, firebaseUserInfo) => {
          if (!firebaseUserInfo) {
            return userInfoVulcan;
          }

          const [, result] = await userClientService.updateUserInfo(
            userInfoVulcan,
            firebaseUserInfo
          );

          return result || defaultUser;
        },
      }),

      {
        merge: (persistedState, currentState) => {
          const merged = {
            ...currentState,
            ...(persistedState as Partial<TAuthStore>),
          } as TAuthStore;

          merged.isAuthenticated = Boolean(merged.accessToken);

          return merged;
        },
        name: LOCAL_STORAGE_KEY.AUTH_STORE_DATA,
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            console.error("Failed to rehydrate auth store:", error);
            return;
          }

          if (globalThis.window === undefined || !state) {
            return;
          }

          const existingData = localStorage.getItem(
            LOCAL_STORAGE_KEY.AUTH_STORE_DATA
          );
          const persistedData = parsePersistedAuthData(existingData);

          // Extract and save user ID from existing access token
          if (persistedData?.state.accessToken) {
            saveUserIdFromToken(persistedData.state.accessToken);
          }

          // Initialize storage if it doesn't exist (migration from old format)
          if (!existingData) {
            const oldAccessToken = localStorage.getItem(
              LOCAL_STORAGE_KEY.ACCESS_TOKEN_KEY
            );
            initializeAuthStorage(state, oldAccessToken);
          }
        },
        partialize: (state) => ({
          // Persist these values to survive navigation after login
          provider: state.provider,
          source: state.source,
          accessToken: state.accessToken,
          justSignedIn: state.justSignedIn,
          isNewUser: state.isNewUser,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  );
};

export type TCreateAuthStore = ReturnType<typeof createAuthStore>;
