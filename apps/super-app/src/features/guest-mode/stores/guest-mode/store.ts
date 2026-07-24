import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createStore } from "zustand/vanilla";

import { LOCAL_STORAGE_KEY } from "@/utils/commons/keys";

import { defaultGuestStoreState } from "./constants";
import type {
  TGuestStore,
  TGuestStoreCreateOptions,
  TGuestStoreState,
} from "./types";

// Global reference to guest store instance for TokenManager to use
let globalGuestStoreInstance: ReturnType<typeof createGuestStore> | null = null;

export const getGlobalGuestStore = () => globalGuestStoreInstance;

export const createGuestStore = (options: TGuestStoreCreateOptions) => {
  const { isShowCaptchaModal = false } = options;

  const initialValue: TGuestStoreState = {
    ...defaultGuestStoreState,
    isShowCaptchaModal,
  };

  const store = createStore<TGuestStore>()(
    persist(
      immer((set) => ({
        ...initialValue,
        resetStore() {
          set({ ...defaultGuestStoreState });
          // Clear persisted storage
          if (typeof window !== "undefined") {
            localStorage.removeItem(LOCAL_STORAGE_KEY.GUEST_STORE_DATA);
          }
        },
        setAccessToken(accessToken) {
          set({ accessToken });
        },
        setAnonId(anonId) {
          set({ anonId });
        },
        setBootstrapError(bootstrapError) {
          set({ bootstrapError });
        },
        setConversationState(newState) {
          set((state) => {
            state.conversationState = {
              ...state.conversationState,
              ...newState,
            };
          });
        },
        setCsrfToken(csrfToken) {
          set({ csrfToken });
        },
        setDeviceId(deviceId) {
          set({ deviceId });
        },
        setGuestUserInput(guestUserInput) {
          set({ guestUserInput });
        },
        setIsFetching(isFetching) {
          set({ isFetching });
        },
        setIsOpenGuestConfirmModal(isOpen) {
          set({ isOpenGuestConfirmModal: isOpen });
        },
        setIsOpenPromoteSignIn(isOpenPromoteSignIn) {
          set({ isOpenPromoteSignIn });
        },
        setIsShowCaptchaModal(isShowCaptchaModal) {
          set({ isShowCaptchaModal });
        },
        setIsTyping(isTyping) {
          set({ isTyping });
        },
        setIsVerifiedCaptcha(isVerifiedCaptcha) {
          set({ isVerifiedCaptcha });
        },
        setNonce(nonce) {
          set({ nonce });
        },
        setSelectedId(selectedId) {
          set({ selectedId });
        },
        setSelectedModel(selectedModel) {
          set({ selectedModel });
        },
        setSessionId(sessionId) {
          set({ sessionId });
        },
        setVerificationError(verificationError) {
          set({ verificationError });
        },
      })),
      {
        name: LOCAL_STORAGE_KEY.GUEST_STORE_DATA, // unique name for localStorage key
        partialize: (state) => ({
          // Only persist these specific fields
          deviceId: state.deviceId,
          sessionId: state.sessionId,
          anonId: state.anonId,
          accessToken: state.accessToken,
        }),
        storage: createJSONStorage(() => localStorage),
      }
    )
  );

  // Store global reference
  globalGuestStoreInstance = store;

  return store;
};

export type TCreateGuestStore = ReturnType<typeof createGuestStore>;
