import type { TQueueStoreState } from "./types";

const initialOnboardingPopupQueueStoreState: TQueueStoreState = {
  currentPopups: [],
  delayTimers: {},
  history: [],
  isBlockedByOverlay: false,
  queue: [],
  scheduledTimers: {},
};

export { initialOnboardingPopupQueueStoreState };
