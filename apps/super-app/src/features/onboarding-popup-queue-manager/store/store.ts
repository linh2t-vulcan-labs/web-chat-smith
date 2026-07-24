import { immer } from "zustand/middleware/immer";
import { createStore } from "zustand/vanilla";

import { markPopupAsShown } from "../utils";
import {
  canShowBasedOnTriggerType,
  createHistoryItem,
  findPopupInQueue,
  isConditionMeet,
  isDependencyMeet,
  isPopupInHistory,
  isPopupPending,
  needsDelayScheduling,
  shouldApplyDelay,
} from "../utils/store";
import { initialOnboardingPopupQueueStoreState } from "./constants";
import type { TOnboardingPopupQueueStore, TPopupItemConfig } from "./types";
import { EPopupShowType, EPopupStatus, EPopupTriggerType } from "./types";

export const createOnboardingPopupQueueStore = () =>
  createStore<TOnboardingPopupQueueStore>()(
    immer((set, get) => ({
      ...initialOnboardingPopupQueueStoreState,
      addPopup: (popup) =>
        set((state) => {
          // Don't add if already exists
          if (findPopupInQueue(popup.id, state.queue)) {
            return state;
          }

          // Add and sort by priority (lower = higher priority)
          const queue = [...state.queue, popup].toSorted(
            (a, b) => a.priority - b.priority
          );
          return { queue };
        }),
      canShowPopup: (popupId) => {
        const {
          queue,
          history,
          currentPopups,
          delayTimers,
          scheduledTimers,
          scheduleDelayedPopup,
          cancelScheduledPopup,
        } = get();
        const popup = findPopupInQueue(popupId, queue);

        // 1. Basic validation - check if popup exists and is pending
        if (!popup || !isPopupPending(popup)) {
          return false;
        }

        // 2. Check dependencies - wait for dependencies to exist in history
        if (!isDependencyMeet(popup, history)) {
          return false;
        }

        // 3. Check custom conditions (without side effects)
        if (!isConditionMeet(popup)) {
          return false;
        }

        // 4. Handle delay scheduling (side effect) - must happen before trigger type check
        // If delay shouldn't be applied (e.g., dependencies skipped), cancel any existing timer
        if (popup.delay && popup.delay > 0) {
          const applyDelay = shouldApplyDelay(popup, history);

          // If delay shouldn't be applied (e.g., all dependencies skipped), cancel any existing timer
          if (!applyDelay && scheduledTimers[popup.id]) {
            cancelScheduledPopup(popup.id);
          }

          // Check if delay needs to be scheduled
          if (
            applyDelay &&
            needsDelayScheduling(popup, history, scheduledTimers, delayTimers)
          ) {
            scheduleDelayedPopup(popup.id, popup.delay);
            return false;
          }
        }

        // 5. Handle trigger type specific conditions
        return canShowBasedOnTriggerType(
          popup,
          currentPopups.length,
          history,
          delayTimers,
          scheduledTimers
        );
      },
      cancelScheduledPopup: (popupId) => {
        const { scheduledTimers } = get();
        const timer = scheduledTimers[popupId];

        if (!timer) {
          return;
        }

        clearTimeout(timer);

        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [popupId]: _timer, ...remainingTimers } =
            state.scheduledTimers;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [popupId]: _delay, ...remainingDelays } = state.delayTimers;

          return {
            delayTimers: remainingDelays,
            scheduledTimers: remainingTimers,
          };
        });
      },
      completeCurrentPopup: (popupId) => {
        const { currentPopups, history, cancelScheduledPopup, showNextPopup } =
          get();
        const currentPopup = currentPopups.find(
          (popup) => popup.id === popupId
        );

        if (!currentPopup) {
          return;
        }

        // Check for duplicate in history
        if (isPopupInHistory(popupId, history)) {
          // Clean up state without adding to history
          set((state) => ({
            currentPopups: state.currentPopups.filter((p) => p.id !== popupId),
            queue: state.queue.map((q) => {
              if (q.id === popupId) {
                return { ...q, status: EPopupStatus.COMPLETED };
              }
              return q;
            }),
          }));

          setTimeout(showNextPopup, 200);
          return;
        }

        // Cancel scheduled timer and update state
        cancelScheduledPopup(popupId);

        set((state) => ({
          currentPopups: state.currentPopups.filter((p) => p.id !== popupId),
          history: [
            ...state.history,
            createHistoryItem(currentPopup, EPopupStatus.COMPLETED),
          ],
          queue: state.queue.map((q) => {
            if (q.id === popupId) {
              return { ...q, status: EPopupStatus.COMPLETED };
            }
            return q;
          }),
        }));

        setTimeout(showNextPopup, 200);
      },
      getNextPopup: () => {
        const { queue, canShowPopup, markPopupAsSkipped } = get();

        // Iterate through queue to find next showable popup
        for (const popup of queue) {
          // Check custom conditions with side effect (marks as skipped if condition fails)
          // This must be done before canShowPopup to handle the skipping side effect
          if (!isConditionMeet(popup, markPopupAsSkipped)) {
            continue;
          }

          // Use centralized validation logic (includes delay scheduling side effect)
          if (canShowPopup(popup.id)) {
            return popup;
          }
        }

        return null;
      },
      markPopupAsSkipped: (popupId) => {
        const { queue, history, cancelScheduledPopup } = get();
        const popup = findPopupInQueue(popupId, queue);

        if (!popup) {
          return;
        }

        // Check for duplicate in history
        if (isPopupInHistory(popupId, history)) {
          return;
        }

        // Cancel scheduled timer and update state
        cancelScheduledPopup(popupId);

        set((state) => ({
          history: [
            ...state.history,
            createHistoryItem(popup, EPopupStatus.SKIPPED),
          ],
          queue: state.queue.map((q) =>
            q.id === popupId ? { ...q, status: EPopupStatus.SKIPPED } : q
          ),
        }));
      },
      removePopup: (popupId) =>
        set((state) => ({
          queue: state.queue.filter((popup) => popup.id !== popupId),
        })),
      resetStore: () => {
        // Clear all scheduled timers before reset
        for (const timerId of Object.values(get().scheduledTimers)) {
          clearTimeout(timerId);
        }

        set(initialOnboardingPopupQueueStoreState);
      },
      scheduleDelayedPopup: (popupId, delay) => {
        const { scheduledTimers, showNextPopup } = get();

        // Cancel existing timer if any
        if (scheduledTimers[popupId]) {
          clearTimeout(scheduledTimers[popupId]);
        }

        // Schedule the popup to show after delay
        const timerId = setTimeout(() => {
          // Remove timer handle, keep delayTimer for elapsed time calculation
          set((state) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [popupId]: _, ...remainingTimers } = state.scheduledTimers;
            return { scheduledTimers: remainingTimers };
          });

          showNextPopup();
        }, delay);

        // Store timer handle and start time
        set((state) => ({
          delayTimers: { ...state.delayTimers, [popupId]: Date.now() },
          scheduledTimers: { ...state.scheduledTimers, [popupId]: timerId },
        }));
      },
      setOverlayBlockingState: (isBlocked) => {
        set({
          isBlockedByOverlay: isBlocked,
        });
      },
      showNextPopup: () => {
        const {
          queue,
          canShowPopup,
          markPopupAsSkipped,
          isBlockedByOverlay,
          currentPopups,
        } = get();
        if (isBlockedByOverlay) {
          return;
        }
        if (currentPopups.length > 0) {
          return;
        }

        const eligiblePopups: TPopupItemConfig[] = [];

        // Collect all popups that can be shown simultaneously
        // (DELAYED, IMMEDIATE, CONDITIONAL can show together; AFTER_PREVIOUS cannot)
        for (const popup of queue) {
          // Check custom conditions with side effect (marks as skipped if condition fails)
          if (!isConditionMeet(popup, markPopupAsSkipped)) {
            continue;
          }

          // Check if popup can be shown
          if (!canShowPopup(popup.id)) {
            continue;
          }

          // For AFTER_PREVIOUS type, only allow one popup at a time
          // If we encounter an AFTER_PREVIOUS popup that can be shown, add it and stop
          // (since it can only show when no current popups exist, and only one should show at a time)
          if (popup.triggerType === EPopupTriggerType.AFTER_PREVIOUS) {
            eligiblePopups.push(popup);
            break;
          }

          // For other types (DELAYED, IMMEDIATE, CONDITIONAL), multiple can show simultaneously
          eligiblePopups.push(popup);
        }

        if (eligiblePopups.length === 0) {
          return;
        }

        // Mark popups as shown and add to currentPopups
        for (const popup of eligiblePopups) {
          if (popup.showType === EPopupShowType.ONCE) {
            markPopupAsShown(popup.id, {
              includePrefix: popup.includePrefixInStorageKey,
              userId: popup.userId,
              version: popup.version,
            });
          }
        }

        set((state) => ({
          currentPopups: [...state.currentPopups, ...eligiblePopups],
          queue: state.queue.map((q) => {
            const eligiblePopup = eligiblePopups.find((ep) => ep.id === q.id);
            if (eligiblePopup) {
              return { ...q, status: EPopupStatus.SHOWING };
            }
            return q;
          }),
        }));
      },
      skipCurrentPopup: (popupId) => {
        const { currentPopups, history, cancelScheduledPopup } = get();
        const currentPopup = currentPopups.find(
          (popup) => popup.id === popupId
        );

        if (!currentPopup) {
          return;
        }

        // Check for duplicate in history
        if (isPopupInHistory(popupId, history)) {
          // Clean up state without adding to history
          set((state) => ({
            currentPopups: state.currentPopups.filter((p) => p.id !== popupId),
            queue: state.queue.map((q) =>
              q.id === popupId ? { ...q, status: EPopupStatus.SKIPPED } : q
            ),
          }));
          return;
        }

        // Cancel scheduled timer and update state
        cancelScheduledPopup(popupId);

        set((state) => ({
          currentPopups: state.currentPopups.filter((p) => p.id !== popupId),
          history: [
            ...state.history,
            createHistoryItem(currentPopup, EPopupStatus.SKIPPED),
          ],
          queue: state.queue.map((q) =>
            q.id === popupId ? { ...q, status: EPopupStatus.SKIPPED } : q
          ),
        }));
      },
      updatePopupStatus: (popupId, status) => {
        set((state) => {
          const updatedQueue = state.queue.map((popup) =>
            popup.id === popupId ? { ...popup, status } : popup
          );

          const updatedCurrentPopups = state.currentPopups.map((popup) =>
            popup.id === popupId ? { ...popup, status } : popup
          );

          return { currentPopups: updatedCurrentPopups, queue: updatedQueue };
        });
      },
    }))
  );

export type TCreateOnboardingPopupQueueStore = ReturnType<
  typeof createOnboardingPopupQueueStore
>;
