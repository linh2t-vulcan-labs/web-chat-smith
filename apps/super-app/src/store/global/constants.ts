import { ECheckoutStep } from "@/components/account-subscription-modal-v4/types";
import { DEFAULT_AI_MODEL } from "@/config/default-model";
import { defaultAssistantWriting } from "@/utils/constants/assistant";
import { DEFAULT_CUSTOM_RESPONSE } from "@/utils/constants/common";
import { defaultModels } from "@/utils/constants/conversation";
import { defaultUserSubscriptionInfo } from "@/utils/constants/subscriptions";
import {
  defaultChatFreeUsage,
  defaultFreeUsageResetInfo,
  defaultUser,
  defaultUserOnboarding,
} from "@/utils/constants/user";

import type { TGlobalStoreState } from "./types";

export const defaultGlobalState: TGlobalStoreState = {
  isOpenSidebar: false,
  isOpenWebReminderModal: false,

  models: defaultModels,

  onboarding: defaultUserOnboarding,

  products: [],
  // FIRST TIME FETCHED PROFILE
  isFinishFetchProfile: false,

  // WARNING MOBILE MODAL
  isOpenMobileSubscriptionWarningModal: false,

  // PROFILE STORE
  user: defaultUser,
  chatFreeUsage: defaultChatFreeUsage,
  freeUsageResetInfo: defaultFreeUsageResetInfo,
  initialChatFreeUsage: defaultChatFreeUsage,

  // ITEMS STORE
  threads: [],
  selectedModel: DEFAULT_AI_MODEL,

  // ASSISTANT STORE
  assistants: [],
  selectedAssistant: defaultAssistantWriting,

  // ATTACHMENTS STORE
  chatFiles: [],
  chatImages: [],

  // SUBSCRIPTION MODAL
  isOpenSubscriptionModal: false,
  isOpenSubscriptionExpired: false,
  activeBlockingOverlays: {},
  isAnyBlockingOverlayOpen: false,

  // CHECKOUT FLOW
  checkoutStep: ECheckoutStep.SELECT_PLAN,
  selectedProductForCheckout: null,
  // Note: Remove logic manage subscription flow (According ticket to GU-1123)
  isOpenManageSubscriptionModal: false,

  // USER SUBSCRIPTIONS
  userSubscriptionInfo: defaultUserSubscriptionInfo,
  purchaseSource: "main",
  paymentVendorOfSubscriptionUser: "unspecified",

  // LAYOUT
  rightSidebarConfig: {
    contentSetting: null,
    isOpen: false,
  },

  // CONVERSATION
  hasDismissedFloatingBlock: false,
  hasDismissedFloatingBanner: false,
  visibleFloatingBlock: false,
  visibleFloatingBanner: false,

  customResponses: [],
  selectedCustomResponse: DEFAULT_CUSTOM_RESPONSE,
  // DIRECT STORE
  dsVersion: 3,

  // CONVERSATION DELETION
  deletingConversationIds: {},

  // GUEST
  isOpenPromoteSignIn: true,

  // ORDER
  existTrialUsage: false,
};
