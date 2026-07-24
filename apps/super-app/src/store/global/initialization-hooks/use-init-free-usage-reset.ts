import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import type { RefObject } from "react";
import { useEffect, useRef } from "react";

import { showToastSuccess } from "@/components/toaster";
import { RESET_USAGE_TOAST_OPTIONS } from "@/config/options";
import type { SubscriptionModel } from "@/core/models/subscription";
import type { TChatFreeUsage } from "@/core/models/usage";
import type { UserInfoModel } from "@/core/models/user";
import { useFreeUsageResetInfo } from "@/hooks/conversations/use-free-usage-reset-info";
import { useInitializeFreeUsage } from "@/hooks/conversations/use-initialize-free-usage";
import { useResetFreeUsage } from "@/hooks/conversations/use-reset-free-usage";
import useFreeUsageConfig from "@/hooks/remote-config/use-free-usage-config";
import { useAuthState } from "@/store/auth";
import {
  getDelayUntilNextMidnightMs,
  getLastChatAt,
  tryShowInactiveToastOnce,
} from "@/utils/commons/helpers";

import type { TCreateGlobalStore } from "../store";
import { MAX_FREE_USAGE_CHAT } from "./free-usage.constants";

const INACTIVE_SINCE_RESET_CASE = {
  H24: "24h",
  H48: "48h",
  NO_TOAST: "noToast",
} as const;

type TInactiveSinceResetCase =
  | (typeof INACTIVE_SINCE_RESET_CASE)[keyof typeof INACTIVE_SINCE_RESET_CASE]
  | null;

const getInactiveSinceResetCase = (
  lastResetAt: string,
  lastChatAt: string | null
): TInactiveSinceResetCase => {
  if (!lastChatAt) {
    return null;
  }

  const reset = dayjs(lastResetAt);
  const lastChat = dayjs(lastChatAt);
  const now = dayjs();

  // If the last chat is after the last reset, return null
  // because the user has used usage after the last reset
  if (lastChat.isAfter(reset)) {
    return null;
  }

  const hoursSinceReset = now.diff(reset, "hour", true);

  if (hoursSinceReset >= 72) {
    return INACTIVE_SINCE_RESET_CASE.NO_TOAST;
  }
  if (hoursSinceReset >= 48) {
    return INACTIVE_SINCE_RESET_CASE.H48;
  }
  if (hoursSinceReset >= 24) {
    return INACTIVE_SINCE_RESET_CASE.H24;
  }

  return null;
};

/**
 * React hook to initialize and periodically reset a "free usage" quota for a user,
 * such as daily free usage of a feature.
 *
 * Responsibilities:
 *   1. Automatically initialize free usage for new users when remote config allows.
 *   2. At each local midnight, auto-reset "free usage" quota for eligible users,
 *      in accordance with inactivity or usage logic.
 *   3. Present informational toast notifications to the user based on various conditions,
 *      informing them about resets or remaining usage.
 *   4. Avoids duplicate resets and ensures to not reset usage if the quota was already reset for the day.
 *   5. Handles teardown of scheduled midnight resets upon component unmount.
 *
 * @param isAuthenticated - Is the user authenticated
 * @param user - User info (optional)
 * @param subscriptionInfo - Subscription info (optional)
 * @param freeUsage - Free usage (optional)
 * @returns The current free usage reset info (from server)
 *
 * Usage:
 *   Call this hook at the app root, providing isAuthenticated and user,
 *   to transparently manage daily free usage lifecycle and messaging to the user.
 */
export const useInitFreeUsageReset = (
  store: RefObject<TCreateGlobalStore | null>,
  isAuthenticated: boolean,
  user?: UserInfoModel | null,
  subscriptionInfo?: SubscriptionModel | null,
  freeUsage?: TChatFreeUsage | null
) => {
  const isNewUser = useAuthState((state) => state.isNewUser);
  const hasInitializedFreeUsageRef = useRef(false);
  const midnightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasNewUserRef = useRef(isNewUser);
  const hasTriggeredResetThisRunRef = useRef(false);
  // Remote Config
  const { enabled: isFreeUserUsageEnabled } = useFreeUsageConfig();

  // Mutations/hooks for usage (reset and initialize)
  const { mutate: resetFreeUsageMutation } = useResetFreeUsage(store);
  const { mutate: initializeFreeUsageMutation } = useInitializeFreeUsage();
  const { data: freeUsageResetInfo } = useFreeUsageResetInfo(isAuthenticated);
  const conversationPageT = useTranslations("conversationPage");

  // Capture the value of isNewUser when it becomes true
  useEffect(() => {
    if (isNewUser && !wasNewUserRef.current) {
      wasNewUserRef.current = true;
    }
  }, [isNewUser]);

  // Initialize free usage if it is a new user and free user usage is enabled
  useEffect(() => {
    if (hasInitializedFreeUsageRef.current) {
      return;
    }

    if (wasNewUserRef.current && isFreeUserUsageEnabled) {
      initializeFreeUsageMutation();
      hasInitializedFreeUsageRef.current = true;
    }

    // oxlint-disable-next-line react/react-compiler -- deliberately reads wasNewUserRef.current as a dependency to re-check the ref's latest value without making it reactive state; a larger refactor to avoid ref-in-deps is out of scope here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFreeUserUsageEnabled]);

  /**
   * Schedules an automatic reset every local midnight, displaying toasts as appropriate.
   * Will:
   *   - Skip reset if not authenticated, not eligible, not premium user, or if reset already today.
   *   - Skip reset if free usage chat is already at the max limit.
   *   - Show toast instead of resetting if user has not used usage for 24/48h (per rules).
   *   - Actually reset if last reset wasn't today and user was active within period.
   */
  useEffect(() => {
    if (
      !isAuthenticated ||
      !user ||
      subscriptionInfo?.isValidPremiumUser ||
      !freeUsage
    ) {
      return;
    }
    if (!isFreeUserUsageEnabled) {
      return;
    }

    const lastResetAt = freeUsageResetInfo?.chat?.lastResetAt;
    if (!lastResetAt) {
      return;
    }

    const isWithinPeriod = freeUsageResetInfo?.chat?.isWithinPeriod;
    if (!isWithinPeriod) {
      return;
    }

    const runAutoReset = () => {
      const lastChatAt = getLastChatAt(user.id);
      // Skip reset—user never chatted, avoid unnecessary API call
      if (lastChatAt === null) {
        return;
      }

      const caseType = getInactiveSinceResetCase(lastResetAt, lastChatAt);

      // If user hasn't used usage since last reset—show toast at most once per (user, cycle, milestone).
      if (
        caseType === INACTIVE_SINCE_RESET_CASE.H24 ||
        caseType === INACTIVE_SINCE_RESET_CASE.H48
      ) {
        const config = RESET_USAGE_TOAST_OPTIONS[caseType];
        tryShowInactiveToastOnce(user.id, lastResetAt, caseType, () =>
          showToastSuccess(conversationPageT(config.descKey), {
            title: conversationPageT(config.titleKey),
          })
        );
        return;
      }

      // If they've been inactive for longer/no toast case, do nothing.
      if (caseType === INACTIVE_SINCE_RESET_CASE.NO_TOAST) {
        return;
      }

      const lastResetDate = dayjs(lastResetAt);
      if (!lastResetDate.isValid()) {
        return;
      }

      // Skip reset if free usage chat is already at the max limit.
      if (Number(freeUsage.chat) === MAX_FREE_USAGE_CHAT) {
        return;
      }

      // If reset has already happened today, do not double-reset.
      const hasResetToday = lastResetDate.isSame(dayjs(), "day");
      if (hasResetToday) {
        return;
      }

      // User has used usage after 24h: reset as normal and show "already reset" toast in onSuccess
      if (!hasTriggeredResetThisRunRef.current) {
        hasTriggeredResetThisRunRef.current = true;
        resetFreeUsageMutation();
      }
    };

    const scheduleNextMidnight = () => {
      if (midnightTimerRef.current) {
        clearTimeout(midnightTimerRef.current);
      }

      midnightTimerRef.current = setTimeout(() => {
        runAutoReset();
        scheduleNextMidnight();
      }, getDelayUntilNextMidnightMs());
    };

    runAutoReset();

    const isLastDayOfPeriod =
      freeUsageResetInfo?.chat?.isLastDayOfPeriod ?? false;
    if (!isLastDayOfPeriod) {
      scheduleNextMidnight();
    }

    return () => {
      if (midnightTimerRef.current) {
        clearTimeout(midnightTimerRef.current);
        midnightTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    freeUsageResetInfo?.chat?.lastResetAt,
    isAuthenticated,
    isFreeUserUsageEnabled,
    user?.id,
    freeUsage?.chat,
    subscriptionInfo?.isValidPremiumUser,
  ]);

  return freeUsageResetInfo;
};
