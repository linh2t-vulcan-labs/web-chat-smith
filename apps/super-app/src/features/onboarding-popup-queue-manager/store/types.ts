import type { POPUP_QUEUE_KEY } from "../constants";

export enum EPopupType {
  // DS Modal - show immediately
  DS_SUBSCRIPTION = "DS_SUBSCRIPTION",
  // Home chat animation - show after DS closed
  HOME_CHAT_ANIMATION = "HOME_CHAT_ANIMATION",
  // Onboarding guide - show when home chat animation loads
  ONBOARDING_GUIDE = "ONBOARDING_GUIDE",
  // Notification permission - show 1 minutes after onboarding ends
  NOTIFICATION_PERMISSION = "NOTIFICATION_PERMISSION",
  // What's new popup - show 3 minutes after onboarding ends
  WHATS_NEW_POPUP = "WHATS_NEW_POPUP",
  // What's new tooltips - show 3 minutes after onboarding ends
  WHATS_NEW_TOOLTIP = "WHATS_NEW_TOOLTIP",
  // Subscription expired - show after first chat since expiration
  SUBSCRIPTION_EXPIRED = "SUBSCRIPTION_EXPIRED",
}

export enum EPopupStatus {
  PENDING = "PENDING",
  SHOWING = "SHOWING",
  COMPLETED = "COMPLETED",
  SKIPPED = "SKIPPED",
}

export enum EPopupTriggerType {
  // Show immediately
  IMMEDIATE = "IMMEDIATE",
  // Show after previous popup is closed
  AFTER_PREVIOUS = "AFTER_PREVIOUS",
  // Show after a specific delay (in milliseconds)
  DELAYED = "DELAYED",
  // Show based on custom condition
  CONDITIONAL = "CONDITIONAL",
}

export enum EPopupShowType {
  ONCE = "ONCE",
  ALWAYS = "ALWAYS",
}

export interface TPopupCondition {
  // Function that returns true when popup should be shown
  check: () => boolean | Promise<boolean>;

  // Function that is called when the condition is met
  onConditionMeet?: () => void;
}

export interface TPopupItemConfig {
  id: string;
  type: EPopupType;
  priority: number; // Lower number = higher priority
  status: EPopupStatus;
  triggerType: EPopupTriggerType;
  showType: EPopupShowType;
  delay?: number; // Delay in milliseconds
  condition?: TPopupCondition;
  includePrefixInStorageKey?: boolean;
  version?: string; // Optional version string for popups that support versioning (e.g., What's New)
  userId?: string; // User ID for per-user popup tracking in storage
  // Dependencies - popup IDs that must complete before this one can show
  dependencies?:
    | (typeof POPUP_QUEUE_KEY)[keyof typeof POPUP_QUEUE_KEY][]
    | string[];
  // If true, apply delay only when dependency was COMPLETED. If dependency was SKIPPED, show immediately
  delayOnlyIfDependencyCompleted?: boolean;
  onComplete?: () => void;
}

export interface TPopupHistoryItem {
  id: (typeof POPUP_QUEUE_KEY)[keyof typeof POPUP_QUEUE_KEY];
  type: EPopupType;
  status: EPopupStatus;
  timestamp: number;
}

export interface TQueueStoreState {
  queue: TPopupItemConfig[];
  currentPopups: TPopupItemConfig[];
  history: TPopupHistoryItem[];
  // Track when delays started for DELAYED trigger type popups
  delayTimers: Record<string, number>; // popupId -> timestamp when delay started
  // Track active scheduled timers (NodeJS.Timeout IDs)
  scheduledTimers: Record<string, NodeJS.Timeout>; // popupId -> timeout handle
  // Global overlay state used to pause queue while blocking overlays are active
  isBlockedByOverlay: boolean;
}

export interface TQueueStoreActions {
  addPopup: (popup: TPopupItemConfig) => void;
  removePopup: (popupId: string) => void;
  showNextPopup: () => void;
  completeCurrentPopup: (popupId: string) => void;
  skipCurrentPopup: (popupId: string) => void;
  updatePopupStatus: (popupId: string, status: EPopupStatus) => void;
  getNextPopup: () => TPopupItemConfig | null;
  canShowPopup: (popupId: string) => boolean;
  markPopupAsSkipped: (popupId: string) => void;
  scheduleDelayedPopup: (popupId: string, delay: number) => void;
  cancelScheduledPopup: (popupId: string) => void;
  setOverlayBlockingState: (isBlocked: boolean) => void;
  resetStore: () => void;
}

export type TOnboardingPopupQueueStore = TQueueStoreState & TQueueStoreActions;
