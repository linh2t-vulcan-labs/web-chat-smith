"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect } from "react";

import { ButtonV2 } from "@/components/button-v2";
import { ModalV2 } from "@/components/modal";
import { useNotification } from "@/features/notification/provider/notification-provider";
import { POPUP_QUEUE_KEY } from "@/features/onboarding-popup-queue-manager/constants";
import { useOnboardingPopupGuide } from "@/features/onboarding-popup-queue-manager/hooks";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";

function EnableNotificationModal() {
  const commonT = useTranslations("common");
  const userId = useGlobalState((state) => state.user.id);
  const { sendTrackingEvent } = useSendTrackingEvent();
  const {
    canRequestPermission,
    requestPermissionAndGetToken,
    setHasClosedPopup,
    isBrowserSupported,
    initNotificationLocalStore,
  } = useNotification();
  const canProcessPermissionState =
    canRequestPermission && isBrowserSupported();
  const { isOpen: isOpenNotificationPermPopup, handleClose } =
    useOnboardingPopupGuide({
      popupId: POPUP_QUEUE_KEY.NOTIFICATION_PERMISSION,
    });

  const onPopupClosed = () => {
    handleClose();
    setHasClosedPopup(true);
  };

  useEffect(() => {
    if (isOpenNotificationPermPopup && canProcessPermissionState) {
      initNotificationLocalStore();
    }
  }, [
    isOpenNotificationPermPopup,
    canProcessPermissionState,
    initNotificationLocalStore,
  ]);

  const handleSkip = () => {
    sendTrackingEvent({
      name: EventKeys.MainNotificationSkipPermission,
      payload: {
        trigger: "onboarding",
        vulcan_user_id: userId,
      },
    });
    onPopupClosed();
  };

  const handleEnableNotification = () => {
    sendTrackingEvent({
      name: EventKeys.MainNotificationEnablePermission,
      payload: {
        trigger: "onboarding",
        vulcan_user_id: userId,
      },
    });
    requestPermissionAndGetToken({
      fromOnboarding: true,
    });
    onPopupClosed();
  };

  return (
    <ModalV2
      zIndex={90}
      containerClassName="md:max-w-[600px] w-full"
      className="rounded-default overflow-hidden p-0!"
      open={isOpenNotificationPermPopup && canProcessPermissionState}
      onClose={handleClose}
      isPreventClickOutside
    >
      <div className="onboarding-image relative">
        <div className="relative aspect-[343/228] w-full md:aspect-[600/324]">
          <Image
            alt="Welcome Pro"
            className="object-cover"
            src="/images/notification-popup-banner.png"
            fill
          />
        </div>
      </div>
      <div className="gap-medium-1.5 bg-neutral-150! px-medium-3 py-medium-1.5 flex flex-col">
        <h4 className="text-app-Title1 dark:text-text-general-inverse md:text-app-title-0 line-clamp-2">
          {commonT("notification.popup.title")}
        </h4>
        <div className="text-bodyS-neutral dark:text-text-general-inverse line-clamp-3">
          {commonT("notification.popup.description")}!
        </div>
        <div className="gap-small-1 py-small-1 flex w-full justify-end md:w-auto">
          <ButtonV2
            className="text-text-general-quaternary focus:outline-none"
            color="text"
            size="xxs"
            onClick={handleSkip}
          >
            {commonT("notification.later")}
          </ButtonV2>
          <ButtonV2
            size="xxs"
            className="px-medium-1.5! w-max whitespace-nowrap"
            onClick={handleEnableNotification}
          >
            {commonT("notification.popup.enable")}
          </ButtonV2>
        </div>
      </div>
    </ModalV2>
  );
}

export default EnableNotificationModal;
