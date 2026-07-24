import { immer } from "zustand/middleware/immer";
import { createStore } from "zustand/vanilla";
import type { StoreApi } from "zustand/vanilla";

import { paddleManager } from "@/libs/paddle-js";
import { isServer, localStorageImpl } from "@/utils/commons/helpers";
import { USER_ID_KEY } from "@/utils/commons/keys";

import { defaultGlobalState } from "./constants";
import type {
  TCreateGlobalStoreProps,
  TGlobalStore,
  TGlobalStoreState,
} from "./types";

export const createGlobalStore = (
  props: TCreateGlobalStoreProps
): StoreApi<TGlobalStore> => {
  const { updateUserInfo: updateUserInfoProps } = props;

  const initialValue: TGlobalStoreState = {
    ...defaultGlobalState,
  };

  return createStore<TGlobalStore>()(
    immer((set, get) => ({
      ...initialValue,
      resetStore: () => {
        const {
          isOpenWebReminderModal: _isOpenWebReminderModal,
          ...restDefaultGlobalState
        } = defaultGlobalState;
        set({ ...restDefaultGlobalState });
      },
      setProducts: (products) => {
        set({ products });
      },
      setModels: (models) => {
        set({ models });
      },
      setCustomResponses: (customResponses) => {
        set({ customResponses });
      },
      setSelectedCustomResponse: (tone) => {
        set({ selectedCustomResponse: tone });
      },
      toggleSidebar: (open) => {
        const { isOpenSidebar } = get();
        set({
          isOpenSidebar: typeof open === "boolean" ? open : !isOpenSidebar,
        });
      },
      toggleWebReminderModal: () => {
        const { isOpenWebReminderModal } = get();
        set({ isOpenWebReminderModal: !isOpenWebReminderModal });
      },
      setOnboarding(onboarding) {
        set({ onboarding });
      },
      setChatFreeUsage(chatFreeUsage) {
        set({ chatFreeUsage });
        const { initialChatFreeUsage } = get();
        const hasNotSetInitialUsage =
          initialChatFreeUsage &&
          Object.values(initialChatFreeUsage).every((value) => value === 0);
        if (hasNotSetInitialUsage) {
          set({ initialChatFreeUsage: chatFreeUsage });
        }
      },
      setFreeUsageResetInfo(freeUsageResetInfo) {
        set({ freeUsageResetInfo });
      },
      setUsageDecrement: (type) => {
        const freeUsage = get().chatFreeUsage;
        set({
          chatFreeUsage: {
            ...freeUsage,
            [type]: Math.max(0, freeUsage[type] - 1),
          },
        });
      },
      setIsFinishFetchProfile(isFinishFetchProfile) {
        set({ isFinishFetchProfile });
      },
      setIsOpenMobileSubscriptionWarningModal(
        isOpenMobileSubscriptionWarningModal
      ) {
        set({ isOpenMobileSubscriptionWarningModal });
      },
      setIsOpenSubscriptionModal(
        isOpenSubscriptionModal,
        purchaseSource = "main"
      ) {
        set({ isOpenSubscriptionModal, purchaseSource });
        // Reset checkout flow when closing modal
        if (!isOpenSubscriptionModal) {
          set({
            checkoutStep: defaultGlobalState.checkoutStep,
            selectedProductForCheckout: null,
          });
        }
      },
      // NOTE - Deprecated manage subscription flow (According ticket to GU-1123)
      setIsOpenManageSubscriptionModal(isOpenManageSubscriptionModal) {
        set({ isOpenManageSubscriptionModal });
      },
      setCheckoutStep(checkoutStep) {
        set({ checkoutStep });
      },
      setSelectedProductForCheckout(selectedProductForCheckout) {
        set({ selectedProductForCheckout });
      },
      resetCheckoutFlow() {
        // Close Paddle checkout using the manager
        paddleManager.closeCheckout();

        set({
          checkoutStep: defaultGlobalState.checkoutStep,
          selectedProductForCheckout: null,
        });
      },
      setIsOpenSubscriptionExpiredModal(isOpenSubscriptionExpired) {
        set({ isOpenSubscriptionExpired });
      },
      registerBlockingOverlay(overlayId) {
        const { activeBlockingOverlays } = get();
        if (activeBlockingOverlays[overlayId]) {
          return;
        }

        set({
          activeBlockingOverlays: {
            ...activeBlockingOverlays,
            [overlayId]: true,
          },
          isAnyBlockingOverlayOpen: true,
        });
      },
      unregisterBlockingOverlay(overlayId) {
        const { activeBlockingOverlays } = get();
        if (!activeBlockingOverlays[overlayId]) {
          return;
        }

        const { [overlayId]: _removedOverlay, ...remainingOverlays } =
          activeBlockingOverlays;
        set({
          activeBlockingOverlays: remainingOverlays,
          isAnyBlockingOverlayOpen: Object.keys(remainingOverlays).length > 0,
        });
      },
      setSelectedModel(selectedModel) {
        set({ selectedModel });
      },
      setUser(user) {
        const userId = user.id;
        localStorageImpl.save(USER_ID_KEY, userId);

        set({ user });
      },
      setConfirmConsent(payload) {
        const currentUser = get().user;
        const userWithConsent = {
          ...currentUser,
          avatarColor: currentUser.avatarColor,
          consents: {
            uploadTermsConsent: payload,
          },
        };
        set({ user: userWithConsent });
      },
      setUserSubscriptionInfo(userSubscriptionInfo) {
        set({ userSubscriptionInfo });
      },
      updateUserInfo: async (firebaseUserInfo, userInfoVulcan) => {
        if (!isServer) {
          const userUpdated = await updateUserInfoProps?.(
            userInfoVulcan,
            firebaseUserInfo
          );

          if (userInfoVulcan.id) {
            localStorageImpl.save(USER_ID_KEY, userInfoVulcan.id);
          }

          set({
            user: userUpdated ?? userInfoVulcan,
          });
        }
      },
      setRightSidebarConfig: (config) => {
        const currentRightSidebarConfig = get().rightSidebarConfig;

        set({
          rightSidebarConfig: {
            ...currentRightSidebarConfig,
            ...config,
          },
        });
      },
      initStates: (payload) => {
        set({ ...payload });
      },
      toggleRightSidebar: () => {
        const current = get().rightSidebarConfig;
        set({
          rightSidebarConfig: {
            ...current,
            isOpen: !current.isOpen,
          },
        });
      },
      setDismissedFloatingBlock: () => {
        set({
          hasDismissedFloatingBlock: true,
        });
      },
      setDismissedFloatingBanner: () => {
        set({
          hasDismissedFloatingBanner: true,
        });
      },
      setDsVersion: (version) => {
        set({
          dsVersion: version,
        });
      },
      setPaymentVendorOfSubscriptionUser: (paymentVendorOfSubscriptionUser) => {
        set({ paymentVendorOfSubscriptionUser });
      },
      toggleFloatingBlock: (visibility) => {
        set({
          visibleFloatingBlock: visibility,
        });
      },
      toggleFloatingBanner: (visibility) => {
        set({
          visibleFloatingBanner: visibility,
        });
      },
      addDeletingConversationId: (id) =>
        set((state) => ({
          deletingConversationIds: {
            ...state.deletingConversationIds,
            [id]: true,
          },
        })),

      removeDeletingConversationId: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.deletingConversationIds;
          return { deletingConversationIds: rest };
        }),

      isDeletingConversation: (id) =>
        Boolean(get().deletingConversationIds[id]),

      setExistTrialUsage: (existTrialUsage) => {
        set({ existTrialUsage });
      },
    }))
  ) as StoreApi<TGlobalStore>;
};

export type TCreateGlobalStore = ReturnType<typeof createGlobalStore>;
