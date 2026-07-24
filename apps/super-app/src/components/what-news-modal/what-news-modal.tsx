"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo, useState } from "react";

import { ButtonV2 } from "@/components/button-v2";
import { IntroVideo } from "@/components/intro-video";
import { ModalV2 } from "@/components/modal";
import StatusBadge from "@/components/status-badge";
import { SVGIcon } from "@/components/svg-icon";
import { IMAGE_MODELS } from "@/config/models";
import { MODAL_Z_INDEX } from "@/config/z-index";
import { EConversationMode } from "@/core/models/conversation";
import { EAIValueModel } from "@/core/models/model";
import { useChatSyncFlag } from "@/features/chat-sync/hooks/use-chat-sync-flag";
import { useNotification } from "@/features/notification/provider/notification-provider";
import { useOnboardingPopupGuide } from "@/features/onboarding-popup-queue-manager/hooks";
import { useWhatNewsModalRemoteConfig } from "@/hooks/remote-config/use-what-news-modal";
import { useRouter } from "@/i18n/navigation";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useConversationState } from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";
import { compositeStyles } from "@/utils/commons/styles";
import { CONVERSATION_URL, DESIGN_STUDIO_URL } from "@/utils/constants/url";

import type { TFeaturesData } from "./types";

function buildWhatNewFeaturesForDisplay(
  rawFeatures: TFeaturesData[],
  enabledChatSync: boolean,
  translate: (key: string) => string
): TFeaturesData[] {
  const tr = (key: string, fallback: string) => {
    const value = translate(key);
    return value === key ? fallback : value;
  };
  return rawFeatures
    .filter((f) => (f.type === "chat_sync" ? enabledChatSync : true))
    .map((f) => ({
      ...f,
      description: f.type
        ? tr(`whatsNewFeatures.${f.type}.description`, f.description)
        : f.description,
      title: f.type ? tr(`whatsNewFeatures.${f.type}.title`, f.title) : f.title,
    }));
}

function WhatNewsModal() {
  const commonT = useTranslations("common");
  const conversationT = useTranslations("conversationPage");
  const remoteConfigT = useTranslations("remoteConfig");
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  const {
    canRequestPermission,
    isBrowserSupported,
    requestPermissionAndGetToken,
  } = useNotification();
  const { sendTrackingEvent } = useSendTrackingEvent();
  const userId = useGlobalState((state) => state.user.id);
  const chatModels = useGlobalState((state) => state.models);
  const setSelectedModel = useConversationState(
    (state) => state.setSelectedModel
  );
  const setSelectedImageModel = useConversationState(
    (state) => state.setSelectedImageModel
  );
  const setConversationMode = useConversationState((state) => state.setMode);
  const {
    featuresData: rawFeaturesData,
    whatNewsId,
    isEnabledWhatNews,
  } = useWhatNewsModalRemoteConfig();
  const { isBeta: enabledChatSync } = useChatSyncFlag();

  const featuresData = useMemo(
    () =>
      buildWhatNewFeaturesForDisplay(
        rawFeaturesData,
        enabledChatSync,
        remoteConfigT
      ),
    [enabledChatSync, rawFeaturesData, remoteConfigT]
  );

  const currentStep = featuresData[currentIndex];
  const isBeta = currentStep?.isBeta;
  const isFirstStep = currentIndex === 0;
  const isStepDone = currentIndex === featuresData.length - 1;
  const isMultipleStep = featuresData.length > 1;

  const { isOpen, handleClose } = useOnboardingPopupGuide({
    popupId: whatNewsId,
  });

  const handlePreviousStep = () => {
    setCurrentIndex(currentIndex - 1);
  };

  const navigateToDesignStudio = () => {
    router.push(DESIGN_STUDIO_URL);
  };

  const navigateToModel = (
    modelValue: EAIValueModel,
    mode?: EConversationMode
  ) => {
    if (mode === EConversationMode.AI_ART) {
      const imageModel = IMAGE_MODELS.find((m) => m.value === modelValue);
      if (imageModel) {
        setConversationMode(mode);
        setSelectedImageModel(imageModel);
      }
    } else {
      const model = chatModels
        .flatMap((m) => m.models)
        .find((m) => m.value === modelValue);
      if (model) {
        setSelectedModel(model);
      }
    }

    const params = new URLSearchParams();
    if (mode) {
      params.set("mode", mode);
    }
    params.set("model", modelValue);
    router.push(`${CONVERSATION_URL}?${params.toString()}`);
  };

  const STEP_NAV_CONFIG: Partial<Record<string, () => void>> = {
    claude: () => navigateToModel(EAIValueModel.Claude),
    designLogo: () => navigateToDesignStudio(),
    gemini: () => navigateToModel(EAIValueModel.Gemini_Flash_3_1_Flash_Lite),
    gptImage: () =>
      navigateToModel(EAIValueModel.GPT_Image_2, EConversationMode.AI_ART),
    textToImage: () =>
      navigateToModel(EAIValueModel.GPT_Image_2, EConversationMode.AI_ART),
  };

  const handleNextStep = () => {
    if (isStepDone) {
      STEP_NAV_CONFIG[currentStep?.type ?? ""]?.();
      handleClose();
      return;
    }

    setCurrentIndex(currentIndex + 1);
  };

  if (!isEnabledWhatNews || featuresData.length === 0 || !currentStep) {
    return null;
  }

  return (
    <ModalV2
      zIndex={MODAL_Z_INDEX.BASE}
      containerClassName="md:max-w-[488px] bg-neutral-150! w-full"
      className="p-0!"
      isPreventClickOutside
      open={isOpen}
      onClose={handleClose}
    >
      <div className="px-medium-3 py-medium-1.5 flex items-center justify-between">
        <div className="text-bodyS-highlight dark:text-text-general-inverse">
          <div className="gap-small-1 text-bodyS-highlight dark:text-text-general-inverse flex items-center">
            <span className="bg-surface-action-inverse-default flex size-[28px] items-center justify-center rounded-[50%]">
              <SVGIcon
                src="/icons/outlined/news.svg"
                className="text-icon-general-inverse"
                width={16}
                height={16}
              />
            </span>
            {commonT("whatsNew")}
            {!isBeta && (
              <StatusBadge status="available">
                {commonT("availableNow")}
              </StatusBadge>
            )}
          </div>
        </div>
        <SVGIcon
          src="/icons/close.svg"
          className="dark:text-icon-general-inverse hover:cursor-pointer hover:brightness-90"
          width={16}
          height={16}
          onClick={handleClose}
        />
      </div>
      {currentStep.video && (
        <IntroVideo
          className="thickness-none rounded-none!"
          src={currentStep.video}
          ratio={3 / 2}
        />
      )}
      {currentStep.image && (
        <div className="relative aspect-3/2">
          <Image
            alt="What news image"
            className="object-cover"
            src={currentStep.image}
            fill
          />
        </div>
      )}
      <div className="gap-medium-1.5 px-medium-3 py-medium-1.5 flex flex-col">
        {/* GU-1573 */}
        <h4
          className={compositeStyles(
            "text-app-Title1 dark:text-text-general-inverse md:text-app-title-0 line-clamp-2",
            isBeta && "gap-small-1 flex items-center"
          )}
        >
          {currentStep.title}{" "}
          {isBeta && (
            <span className="top-small-0.25 rounded-half bg-text-light-lavender px-small-0.75 py-small-0.25 text-footnoteS-neutral text-text-general-inverse relative inline-block font-medium uppercase">
              {commonT("cta.beta")}
            </span>
          )}
        </h4>
        {/* GU-1573 */}
        <p className="text-bodyS-neutral dark:text-text-general-inverse line-clamp-3">
          {currentStep.description}
        </p>
        {/* GU-1573 */}
        {isMultipleStep ? (
          <div className="gap-small-1 py-small-1 flex items-center justify-between">
            <span className="text-footnoteM-highlight text-text-general-tertiary">
              {currentIndex + 1} {conversationT("guideTour.others.of")}{" "}
              {featuresData.length}
            </span>
            <div className="gap-small-1 flex min-w-[200px]">
              <ButtonV2
                className="dark:text-text-general-inverse"
                color="outline"
                size="xxs"
                fullWidth
                disabled={isFirstStep}
                onClick={handlePreviousStep}
              >
                {commonT("cta.back")}
              </ButtonV2>
              <ButtonV2 size="xxs" fullWidth onClick={handleNextStep}>
                {isStepDone ? commonT("cta.gotIt") : commonT("cta.next")}
              </ButtonV2>
            </div>
          </div>
        ) : (
          <div className="py-small-1 flex">
            <ButtonV2 fullWidth onClick={handleNextStep}>
              {commonT("cta.tryNow")}
            </ButtonV2>
          </div>
        )}
        {/* Enable Notification */}
        {canRequestPermission && isBrowserSupported() && (
          <ButtonV2
            color="text"
            type="button"
            className="py-small-0.5! text-footnoteM-neutral! text-text-general-quaternary font-normal underline"
            onClick={() => {
              sendTrackingEvent({
                name: EventKeys.MainNotificationEnablePermission,
                payload: {
                  trigger: "whats_new",
                  vulcan_user_id: userId,
                },
              });
              requestPermissionAndGetToken({ fromWhatsNew: true });
            }}
          >
            {commonT("notification.stayUpdate")}
          </ButtonV2>
        )}
      </div>
    </ModalV2>
  );
}

export default WhatNewsModal;
