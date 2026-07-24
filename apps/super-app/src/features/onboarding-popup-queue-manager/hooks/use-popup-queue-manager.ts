import { useEffect } from "react";

import useHandleDetectBananaUrl from "@/hooks/conversations/use-detect-banana-url";
import { useWhatNewsModalRemoteConfig } from "@/hooks/remote-config/use-what-news-modal";
import { useAuthState } from "@/store/auth";
import { useGlobalState } from "@/store/global/hooks";
import {
  CURRENT_BANANA_TOUR_VERSION,
  CURRENT_INFO_MODEL_VERSION,
  HAS_SEEN_GEMINI_BANANA_TOUR_KEY,
  HAS_SEEN_INFO_MODEL,
} from "@/utils/commons/keys";

import { ONBOARDING_POPUP_QUEUE_DELAYS, POPUP_QUEUE_KEY } from "../constants";
import { useOnboardingPopupQueueManagerStoreState } from "../store";
import type { TPopupItemConfig } from "../store/types";
import {
  EPopupShowType,
  EPopupStatus,
  EPopupTriggerType,
  EPopupType,
} from "../store/types";
import {
  applyRemoteConfigToPopupQueue,
  clearOldPopupVersionKeys,
  createDSSubscriptionCondition,
  createHomeChatAnimationCondition,
  createNotificationPermissionCondition,
  createWhatsNewCondition,
  createWhatsNewTooltipCondition,
} from "../utils";
import { useOnboardingPopupGuideSetting } from "./use-onboarding-popup-guide-setting";

interface TUsePopupQueueManagerProps {
  enabled?: boolean;
}

export const usePopupQueueManager = (props: TUsePopupQueueManagerProps) => {
  const { enabled = true } = props;

  // Auth State
  const justSignedIn = useAuthState((state) => state.justSignedIn);

  const setJustSignedIn = useAuthState((state) => state.setJustSignedIn);

  // Global State
  const isFinishFetchProfile = useGlobalState(
    (state) => state.isFinishFetchProfile
  );
  const user = useGlobalState((state) => state.user);
  const userId = user?.id;
  const userSubscriptionInfo = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const { isValidPremiumUser } = userSubscriptionInfo;

  const onboardingPopupGuideSetting = useOnboardingPopupGuideSetting();

  // Remote Config for What's New version
  const {
    isReady: isReadyRemoteConfig,
    whatNewsVersion,
    whatNewsId,
  } = useWhatNewsModalRemoteConfig();

  // Popup Queue State
  const queue = useOnboardingPopupQueueManagerStoreState(
    (state) => state.queue
  );
  const history = useOnboardingPopupQueueManagerStoreState(
    (state) => state.history
  );
  const currentPopups = useOnboardingPopupQueueManagerStoreState(
    (state) => state.currentPopups
  );

  const addPopup = useOnboardingPopupQueueManagerStoreState(
    (state) => state.addPopup
  );
  const showNextPopup = useOnboardingPopupQueueManagerStoreState(
    (state) => state.showNextPopup
  );
  const resetStore = useOnboardingPopupQueueManagerStoreState(
    (state) => state.resetStore
  );

  const isBananaRoute = useHandleDetectBananaUrl();

  // Clear old version keys when tooltip version changes
  useEffect(() => {
    if (!userId || !isReadyRemoteConfig) {
      return;
    }

    // Both whatNewsId and HAS_SEEN_INFO_MODEL use includePrefixInStorageKey: false
    clearOldPopupVersionKeys(whatNewsId, whatNewsVersion, userId, false);
    clearOldPopupVersionKeys(
      HAS_SEEN_INFO_MODEL,
      CURRENT_INFO_MODEL_VERSION,
      userId,
      false
    );
    clearOldPopupVersionKeys(
      HAS_SEEN_GEMINI_BANANA_TOUR_KEY,
      CURRENT_BANANA_TOUR_VERSION,
      userId,
      false
    );
  }, [userId, whatNewsVersion, whatNewsId, isReadyRemoteConfig]);

  const initializeQueue = () => {
    if (!enabled) {
      return;
    }

    const defaultPopupQueueConfigs: TPopupItemConfig[] = [
      // 1. DS Modal - Show immediately (only once after login for non-premium users)
      {
        condition: {
          check: createDSSubscriptionCondition(
            isValidPremiumUser,
            isFinishFetchProfile,
            isBananaRoute,
            justSignedIn
          ),
          onConditionMeet: () => {
            setJustSignedIn(false);
          },
        },
        id: POPUP_QUEUE_KEY.DS_SUBSCRIPTION,
        priority: 1,
        showType: EPopupShowType.ALWAYS,
        status: EPopupStatus.PENDING,
        triggerType: EPopupTriggerType.CONDITIONAL,
        type: EPopupType.DS_SUBSCRIPTION,
        userId,
      },
      // 2. Home Chat Animation - Show after DS is closed
      // If DS was completed → wait  before showing
      // If DS was skipped → show immediately
      {
        condition: {
          check: createHomeChatAnimationCondition(
            userId,
            isValidPremiumUser,
            isFinishFetchProfile
          ),
        },
        delay: ONBOARDING_POPUP_QUEUE_DELAYS.AFTER_DS_CLOSE,
        delayOnlyIfDependencyCompleted: true,
        dependencies: [POPUP_QUEUE_KEY.DS_SUBSCRIPTION],
        id: POPUP_QUEUE_KEY.HOME_CHAT_ANIMATION,
        priority: 2,
        showType: EPopupShowType.ALWAYS,
        status: EPopupStatus.PENDING,
        triggerType: EPopupTriggerType.AFTER_PREVIOUS,
        type: EPopupType.HOME_CHAT_ANIMATION,
        userId,
      },

      // 3. Notification permission popup
      {
        condition: {
          check: createNotificationPermissionCondition(
            POPUP_QUEUE_KEY.NOTIFICATION_PERMISSION,
            isFinishFetchProfile,
            {
              includePrefix: false,
            }
          ),
        },
        delay: ONBOARDING_POPUP_QUEUE_DELAYS.AFTER_ONBOARDING,
        delayOnlyIfDependencyCompleted: true,
        dependencies: [POPUP_QUEUE_KEY.HOME_CHAT_ANIMATION],
        id: POPUP_QUEUE_KEY.NOTIFICATION_PERMISSION,
        includePrefixInStorageKey: false,
        priority: 3,
        showType: EPopupShowType.ONCE,
        status: EPopupStatus.PENDING,
        triggerType: EPopupTriggerType.AFTER_PREVIOUS,
        type: EPopupType.NOTIFICATION_PERMISSION,
      },
      {
        condition: {
          check: createWhatsNewCondition(
            whatNewsId,
            isFinishFetchProfile,
            isBananaRoute,
            {
              includePrefix: false,
              userId,
              version: whatNewsVersion,
            }
          ),
        },
        delay: ONBOARDING_POPUP_QUEUE_DELAYS.AFTER_ONBOARDING,
        delayOnlyIfDependencyCompleted: true,
        dependencies: [POPUP_QUEUE_KEY.HOME_CHAT_ANIMATION],
        id: whatNewsId,
        includePrefixInStorageKey: false,
        priority: 4,
        showType: EPopupShowType.ONCE,
        status: EPopupStatus.PENDING,
        triggerType: EPopupTriggerType.DELAYED,
        type: EPopupType.WHATS_NEW_POPUP,
        userId,
        version: whatNewsVersion,
      },
      // 5. What's New Tooltips - Show 3 minutes after onboarding ends (only once per version)
      {
        condition: {
          check: createWhatsNewTooltipCondition(
            HAS_SEEN_INFO_MODEL,
            isFinishFetchProfile,
            {
              includePrefix: false,
              userId,
              version: CURRENT_INFO_MODEL_VERSION,
            }
          ),
        },
        delay: ONBOARDING_POPUP_QUEUE_DELAYS.AFTER_ONBOARDING,
        delayOnlyIfDependencyCompleted: true,
        dependencies: [whatNewsId],
        id: HAS_SEEN_INFO_MODEL,
        includePrefixInStorageKey: false,
        priority: 5,
        showType: EPopupShowType.ALWAYS,
        status: EPopupStatus.PENDING,
        triggerType: EPopupTriggerType.DELAYED,
        type: EPopupType.WHATS_NEW_TOOLTIP,
        userId,
        version: CURRENT_INFO_MODEL_VERSION,
      },
      {
        condition: {
          check: createWhatsNewTooltipCondition(
            HAS_SEEN_GEMINI_BANANA_TOUR_KEY,
            isFinishFetchProfile,
            {
              includePrefix: false,
              userId,
              version: CURRENT_BANANA_TOUR_VERSION,
            }
          ),
        },
        delay: ONBOARDING_POPUP_QUEUE_DELAYS.AFTER_ONBOARDING,
        delayOnlyIfDependencyCompleted: true,
        dependencies: [whatNewsId],
        id: HAS_SEEN_GEMINI_BANANA_TOUR_KEY,
        includePrefixInStorageKey: false,
        priority: 6,
        showType: EPopupShowType.ALWAYS,
        status: EPopupStatus.PENDING,
        triggerType: EPopupTriggerType.DELAYED,
        type: EPopupType.WHATS_NEW_TOOLTIP,
        userId,
        version: CURRENT_BANANA_TOUR_VERSION,
      },
    ];

    // Apply remote config settings to default configs (merges and sorts by priority)
    const configsWithRemoteConfig = applyRemoteConfigToPopupQueue(
      defaultPopupQueueConfigs,
      onboardingPopupGuideSetting
    );
    // Add valid popups to queue
    for (const config of configsWithRemoteConfig) {
      addPopup(config);
    }
  };

  return {
    currentPopups,
    history,
    initializeQueue,
    isReadyRemoteConfig,
    queue,
    resetStore,
    showNextPopup,
  };
};
