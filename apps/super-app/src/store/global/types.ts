import type { ECheckoutStep } from "@/components/account-subscription-modal-v4/types";
import type { TAssistantWriting } from "@/core/models/assistant-writing";
import type { TCitationMessage } from "@/core/models/conversation";
import type {
  AIModel,
  CustomResponseItem,
  EAIValueModel,
} from "@/core/models/model";
import type { TPaymentVendorOfSubscriptionUser } from "@/core/models/payment";
import type { ProductModel } from "@/core/models/product";
import type { SubscriptionModel } from "@/core/models/subscription";
import type { TThread } from "@/core/models/thread";
import type { TChatFreeUsage, TFreeUsageReset } from "@/core/models/usage";
import type {
  TUserOnboarding,
  UploadTermsConsentModel,
  UserInfoModel,
} from "@/core/models/user";
import type { FirebaseUser } from "@/libs/firebase";
import type { TPurchaseSource } from "@/utils/commons/types";

type TRightSidebarContentSetting =
  | { type: "sources"; data: TCitationMessage[]; isShowPosition: boolean }
  | { type: "loading" }
  | { type: "error"; onRetry?: () => void; retryExhausted: boolean }
  | null;

export interface TRightSidebarConfig {
  isOpen: boolean;
  title?: React.ReactNode;
  contentSetting: TRightSidebarContentSetting;
}

type TInitBatchStatesPayload = Pick<
  TGlobalStoreState,
  | "isFinishFetchProfile"
  | "userSubscriptionInfo"
  | "user"
  | "paymentVendorOfSubscriptionUser"
  | "paddleCustomerId"
>;

export interface TGlobalStoreAction {
  toggleWebReminderModal: () => void;

  setProducts: (products: ProductModel[]) => void;
  setModels: (aiModel: AIModel[]) => void;

  // CUSTOM RESPONSES
  setCustomResponses: (customResponseItem: CustomResponseItem[]) => void;
  setSelectedCustomResponse: (tone: string | null) => void;

  // ONBOARDING
  setOnboarding: (onboarding: TUserOnboarding) => void;

  // FIRST TIME FETCHED PROFILE
  setIsFinishFetchProfile: (value: boolean) => void;

  // WARNING MOBILE MODAL
  setIsOpenMobileSubscriptionWarningModal: (value: boolean) => void;

  // PROFILE STORE
  setUser: (user: UserInfoModel) => void;
  setChatFreeUsage: (usage: TChatFreeUsage) => void;
  setFreeUsageResetInfo: (info: TFreeUsageReset) => void;
  setUsageDecrement: (type: keyof TChatFreeUsage) => void;
  updateUserInfo: (
    firebaseUserInfo: FirebaseUser,
    userInfoVulcan: UserInfoModel
  ) => Promise<void>;

  // ITEMS STORE
  setSelectedModel: (model: EAIValueModel) => void;

  // SUBSCRIPTION MODAL
  setIsOpenSubscriptionModal: (
    isOpen: boolean,
    purchaseSource?: TPurchaseSource
  ) => void;
  setIsOpenSubscriptionExpiredModal: (isOpen: boolean) => void;
  registerBlockingOverlay: (overlayId: string) => void;
  unregisterBlockingOverlay: (overlayId: string) => void;

  // CHECKOUT FLOW
  setCheckoutStep: (step: ECheckoutStep) => void;
  setSelectedProductForCheckout: (product: ProductModel | null) => void;
  resetCheckoutFlow: () => void;

  // Note: Remove logic manage subscription flow (According ticket to GU-1123)
  // Manage subscription flow
  setIsOpenManageSubscriptionModal: (isOpen: boolean) => void;

  // CONSENT
  setConfirmConsent: (payload: UploadTermsConsentModel) => void;
  // USER SUBSCRIPTIONS
  setUserSubscriptionInfo: (info: SubscriptionModel) => void;

  // LAYOUT
  toggleSidebar: (open?: boolean) => void;
  setRightSidebarConfig: (config: Partial<TRightSidebarConfig>) => void;
  toggleRightSidebar: () => void;

  // set initialize in context
  initStates: (payload: TInitBatchStatesPayload) => void;
  // FLOATING UPGRADE
  setDismissedFloatingBlock: () => void;
  setDismissedFloatingBanner: () => void;
  toggleFloatingBlock: (visibility: boolean) => void;
  toggleFloatingBanner: (visibility: boolean) => void;

  // DIRECT STORE
  setDsVersion: (version: number) => void;

  // PAYMENTS
  setPaymentVendorOfSubscriptionUser: (
    vendor: TPaymentVendorOfSubscriptionUser
  ) => void;

  // RESET
  resetStore: () => void;

  // CONVERSATION
  addDeletingConversationId: (id: string) => void;
  removeDeletingConversationId: (id: string) => void;
  isDeletingConversation: (id: string) => boolean;

  // ORDER
  setExistTrialUsage: (existTrialUsage: boolean) => void;
}

export interface TGlobalStoreState {
  isOpenSidebar: boolean;
  isOpenWebReminderModal: boolean;

  purchaseSource: TPurchaseSource;
  paymentVendorOfSubscriptionUser: TPaymentVendorOfSubscriptionUser;

  models: AIModel[];

  // CUSTOM RESPONSES
  customResponses: CustomResponseItem[];
  selectedCustomResponse: string | null;

  products: ProductModel[];

  // ONBOARDING
  onboarding: TUserOnboarding;

  // FIRST TIME FETCHED PROFILE
  isFinishFetchProfile: boolean;

  // WARNING MOBILE MODAL
  isOpenMobileSubscriptionWarningModal: boolean;

  // PROFILE STORE
  user: UserInfoModel;
  chatFreeUsage: TChatFreeUsage;
  freeUsageResetInfo: TFreeUsageReset;
  initialChatFreeUsage: TChatFreeUsage;

  // ITEMS STORE
  threads: TThread[];
  selectedModel: EAIValueModel;

  // ASSISTANT STORE
  assistants: TAssistantWriting[];
  selectedAssistant: TAssistantWriting;

  // ATTACHMENTS STORE
  chatFiles: unknown[];
  chatImages: unknown[];

  // SUBSCRIPTION MODAL
  isOpenSubscriptionModal: boolean;
  isOpenSubscriptionExpired: boolean;
  activeBlockingOverlays: Record<string, true>;
  isAnyBlockingOverlayOpen: boolean;

  // CHECKOUT FLOW
  checkoutStep: ECheckoutStep;
  selectedProductForCheckout: ProductModel | null;
  // GU-1250: Use paddle customer id for Retain flow
  paddleCustomerId?: string;
  // Note: Remove logic manage subscription flow (According ticket to GU-1123)
  isOpenManageSubscriptionModal: boolean;

  // USER SUBSCRIPTIONS
  userSubscriptionInfo: SubscriptionModel;
  // LAYOUT
  rightSidebarConfig: TRightSidebarConfig;

  // FLOATING UPGRADE
  hasDismissedFloatingBlock: boolean;
  hasDismissedFloatingBanner: boolean;
  visibleFloatingBlock: boolean;
  visibleFloatingBanner: boolean;

  // DIRECT STORE
  dsVersion: number;

  // CONVERSATION DELETION
  deletingConversationIds: Record<string, true>;

  isOpenPromoteSignIn: boolean;

  // Order
  existTrialUsage: boolean;
}

export interface TCreateGlobalStoreProps {
  updateUserInfo?: (
    userInfo: UserInfoModel,
    firebaseUserInfo?: FirebaseUser
  ) => Promise<UserInfoModel>;
}

export type TGlobalStore = TGlobalStoreAction & TGlobalStoreState;
