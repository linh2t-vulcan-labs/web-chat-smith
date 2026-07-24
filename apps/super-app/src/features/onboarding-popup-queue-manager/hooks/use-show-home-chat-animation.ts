import { useEffect, useRef } from "react";

import useLocalStorage from "@/hooks/use-local-storage";

import { POPUP_QUEUE_KEY } from "../constants";
import { useOnboardingPopupQueueManagerStoreState } from "../store";
import { EPopupStatus } from "../store/types";
import { findPopupInQueue } from "../utils/store";

export function useShowHomeChatAnimation() {
  const isInitialized = useRef(false);

  const [isOpen, setIsOpen] = useLocalStorage(
    POPUP_QUEUE_KEY.HOME_CHAT_ANIMATION,
    false
  );

  const currentPopups = useOnboardingPopupQueueManagerStoreState(
    (state) => state.currentPopups
  );
  const completeCurrentPopup = useOnboardingPopupQueueManagerStoreState(
    (state) => state.completeCurrentPopup
  );

  useEffect(() => {
    if (isInitialized.current || currentPopups.length === 0) {
      return;
    }

    const isHomeChatAnimationPending = findPopupInQueue(
      POPUP_QUEUE_KEY.HOME_CHAT_ANIMATION,
      currentPopups,
      {
        status: EPopupStatus.PENDING,
      }
    );

    if (!isHomeChatAnimationPending) {
      return;
    }

    isInitialized.current = true;
    setIsOpen(true);
    completeCurrentPopup(isHomeChatAnimationPending.id);
  }, [completeCurrentPopup, currentPopups, setIsOpen]);

  return {
    isOpen,
  };
}
