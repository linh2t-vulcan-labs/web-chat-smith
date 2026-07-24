// src/hooks/popup-queue/use-ds-subscription-popup.ts
"use client";

import { useEffect, useRef, useState } from "react";

import { useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";

import { POPUP_QUEUE_KEY } from "../constants";
import { useOnboardingPopupQueueManagerStoreState } from "../store";
import { EPopupStatus } from "../store/types";
import { findPopupInQueue } from "../utils/store";

export function useOnboardingDS() {
  const isInitialized = useRef(false);
  const [isOpenDSModal, setIsOpenDSModal] = useState(false);
  const { sendTrackingEvent } = useSendTrackingEvent();

  // Global state
  const setIsOpenSubscriptionModal = useGlobalState(
    (state) => state.setIsOpenSubscriptionModal
  );
  const isOpenSubscriptionModal = useGlobalState(
    (state) => state.isOpenSubscriptionModal
  );
  const userId = useGlobalState((state) => state.user?.id);
  const dsVersion = useGlobalState((state) => state.dsVersion);

  // Popup queue state
  const currentPopups = useOnboardingPopupQueueManagerStoreState(
    (state) => state.currentPopups
  );
  const completeCurrentPopup = useOnboardingPopupQueueManagerStoreState(
    (state) => state.completeCurrentPopup
  );
  const updatePopupStatus = useOnboardingPopupQueueManagerStoreState(
    (state) => state.updatePopupStatus
  );

  /**
   * Show DS modal when popup becomes active in queue
   */
  useEffect(() => {
    if (
      isOpenSubscriptionModal ||
      isInitialized.current ||
      currentPopups.length === 0
    ) {
      return;
    }

    const dsModal = findPopupInQueue(
      POPUP_QUEUE_KEY.DS_SUBSCRIPTION,
      currentPopups,
      {
        status: EPopupStatus.PENDING,
      }
    );

    if (!dsModal) {
      return;
    }

    isInitialized.current = true;

    // Note: Restore logic auto show DS when free user login (According ticket to GU-1123)
    // // Open the modal
    // setIsOpenSubscriptionModal(true, "first_login");
    // setIsOpenDSModal(true);
    // Update queue status
    updatePopupStatus(dsModal.id, EPopupStatus.SHOWING);

    // Track event
    // Note: Restore logic auto show DS when free user login (According ticket to GU-1123)
    // sendTrackingEvent({
    //   name: EventKeys.DSAutoOpen,
    //   payload: {
    //     vulcan_user_id: userId,
    //     vulcan_source: "first_login",
    //     ds_version: dsVersion,
    //   },
    // });
  }, [
    isOpenSubscriptionModal,
    currentPopups,
    setIsOpenSubscriptionModal,
    updatePopupStatus,
    sendTrackingEvent,
    userId,
    dsVersion,
  ]);

  /**
   * Complete popup when modal is closed
   */
  useEffect(() => {
    if (!isInitialized.current || isOpenSubscriptionModal) {
      return;
    }

    const dsModal = findPopupInQueue(
      POPUP_QUEUE_KEY.DS_SUBSCRIPTION,
      currentPopups,
      {
        status: EPopupStatus.SHOWING,
      }
    );

    if (!dsModal) {
      return;
    }

    // oxlint-disable-next-line react/react-compiler -- closes the DS modal when the subscription modal takes over the popup queue slot; synchronizing with the shared popup queue's external state, not a render derivation
    setIsOpenDSModal(false);

    setTimeout(() => {
      completeCurrentPopup(dsModal.id);
    }, 200);
  }, [isOpenSubscriptionModal, currentPopups, completeCurrentPopup]);

  return {
    isOpenDSModal,
  };
}
