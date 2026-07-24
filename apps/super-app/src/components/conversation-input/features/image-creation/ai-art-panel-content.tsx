import { useToggle } from "@uidotdev/usehooks";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import type { Swiper } from "swiper/react";

import { AIArtCardMini } from "@/components/ai-art-card-mini";
import { AIArtSlider } from "@/components/ai-art-slider";
import { Button } from "@/components/button";
import { SVGIcon } from "@/components/svg-icon";
import { IMAGE_MODELS } from "@/config/models";
import { EAIART_STYLE } from "@/core/models/chat-features/image-creation";
import { EAIValueModel } from "@/core/models/model";
import { useAuthConversationUrlParams } from "@/hooks/conversations/query-params/use-auth-conversation-url-params";
import { useAiToolLandingArtStyleHandoff } from "@/hooks/image-creation/use-ai-tool-landing-art-style-handoff";
import useArtStyles from "@/hooks/image-creation/use-art-styles";
import { useSeenAIArtItems } from "@/hooks/image-creation/use-seen-ai-art-items";
import { useMediaQuery } from "@/hooks/use-media-query";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import {
  useConversationState,
  useIsDisabledInputBasedOnMessageStatus,
} from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";
import { compositeStyles } from "@/utils/commons/styles";

const swiperOptions: Omit<React.ComponentProps<typeof Swiper>, "children"> = {
  breakpoints: {
    0: {
      spaceBetween: 6,
    },
    768: {
      spaceBetween: 8,
    },
  },
  spaceBetween: 8,
};

const AIArtModal = dynamic(
  () => import("@/components/ai-art-modal/ai-art-modal")
);

const ConfirmModal = dynamic(
  () => import("@/components/confirm-modal/confirm-modal")
);

const renderChooseStyleSpan = (
  isDisabledInputBasedOnMessageStatus: boolean
) => {
  const ChooseStyleSpan = (chunks: React.ReactNode) => (
    <span
      className={compositeStyles(
        "text-footnoteM-neutral",
        isDisabledInputBasedOnMessageStatus
          ? "text-text-action-tertiary-disabled"
          : "text-text-general-tertiary"
      )}
    >
      {chunks}
    </span>
  );
  ChooseStyleSpan.displayName = "ChooseStyleSpan";
  return ChooseStyleSpan;
};

const renderUploadNotSupportSpan = (chunks: React.ReactNode) => (
  <span className="text-bodyS-neutral text-text-general-secondary">
    {chunks}
  </span>
);

export function AiArtPanelContent() {
  const user = useGlobalState((state) => state.user);
  const selectedAIArt = useConversationState((state) => state.selectedAIArt);
  const selectedFiles = useConversationState((state) => state.selectedFiles);
  const selectedImageModel = useConversationState(
    (state) => state.selectedImageModel
  );
  const isOpenImageUploadNotSupportedValidationModal = useConversationState(
    (state) => state.isOpenImageUploadNotSupportedValidationModal
  );

  const conversationT = useTranslations("conversationPage");
  const ctaT = useTranslations("common.cta");

  const setSelectedAIArt = useConversationState(
    (state) => state.setSelectedAIArt
  );
  const setIsOpenImageLimitAlert = useConversationState(
    (state) => state.setIsOpenImageLimitAlert
  );
  const setIsOpenImageUploadNotSupportedModal = useConversationState(
    (state) => state.setIsOpenImageUploadNotSupportedModal
  );
  const setIsOpenImageUploadNotSupportedValidationModal = useConversationState(
    (state) => state.setIsOpenImageUploadNotSupportedValidationModal
  );
  const setSelectedImageModel = useConversationState(
    (state) => state.setSelectedImageModel
  );
  const setSelectedFiles = useConversationState(
    (state) => state.setSelectedFiles
  );

  const { currentAIArtOptions } = useArtStyles();
  const { modeParams } = useAuthConversationUrlParams();
  const [isOpenAIArtModal, toggleIsOpenAIArtModal] = useToggle(false);
  const isDesktop = useMediaQuery("md");
  const { seenItems, markAsSeen, hasSeen } = useSeenAIArtItems(user.id);

  // For Tracking
  const { sendTrackingEvent } = useSendTrackingEvent();

  const isDisabledInputBasedOnMessageStatus =
    useIsDisabledInputBasedOnMessageStatus();

  const handleSelect = (id: string) => {
    // Match by `id` (unique per card), not `value` — the style catalog is
    // remote-managed and its `value` field isn't guaranteed unique across
    // entries (e.g. duplicated when a card is cloned to create a variant).
    const selectedAIArt = currentAIArtOptions.find((item) => item.id === id);

    if (!selectedAIArt) {
      return;
    }

    // Tracking ChatArtStyleSelect
    sendTrackingEvent({
      name: EventKeys.ChatArtStyleSelect,
      payload: {
        vulcan_style: selectedAIArt.value,
        vulcan_user_id: user.id,
      },
    });

    // Check if the AI art has been seen
    if (!hasSeen(selectedAIArt.value)) {
      markAsSeen(selectedAIArt.value);
    }

    // Open Image Upload Not Supported Modal if the selected image model is chatsmith and there are selected files
    if (
      selectedImageModel.value === EAIValueModel.chatsmith &&
      selectedFiles.length > 0
    ) {
      setIsOpenImageUploadNotSupportedModal(true);
      return;
    }

    setSelectedAIArt(selectedAIArt);

    if (isDesktop && isOpenAIArtModal) {
      toggleIsOpenAIArtModal();
    }
  };

  const handleRemoveAndSwitch = () => {
    const chatsmithModel = IMAGE_MODELS.find(
      (model) => model.value === EAIValueModel.chatsmith
    );

    if (!chatsmithModel) {
      return;
    }

    setSelectedImageModel(chatsmithModel);
    setSelectedFiles([]);
    setIsOpenImageUploadNotSupportedValidationModal(false);
  };

  const handleClose = () => {
    setIsOpenImageUploadNotSupportedValidationModal(false);
  };

  const isInitialImageModelRender = useRef(true);

  useEffect(() => {
    // Skip on mount: at this point any restored style (from the URL or the
    // landing-page handoff) hasn't necessarily been applied yet, and
    // resetting here would race with that restoration and flicker the UI.
    if (isInitialImageModelRender.current) {
      isInitialImageModelRender.current = false;
      return;
    }

    if (currentAIArtOptions.length === 0) {
      return;
    }

    const [firstOption] = currentAIArtOptions;

    if (!firstOption) {
      return;
    }

    // Keep the current style if the new model's catalog still offers it
    // (matched by the stable `value`) — e.g. submitting a generation resets
    // `selectedImageModel` back to the default model, and that shouldn't
    // silently wipe a style the user just picked and already generated with.
    // Only fall back to the catalog's first option when it's genuinely gone.
    const stillAvailable = currentAIArtOptions.find(
      (option) => option.value === selectedAIArt.value
    );

    setSelectedAIArt(stillAvailable ?? firstOption);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImageModel]);

  useAiToolLandingArtStyleHandoff({
    currentAIArtOptions,
    modeParams,
    setSelectedAIArt,
  });

  useEffect(() => {
    // Only show alert if there are files and they exceed the limit
    if (
      selectedFiles.length > 0 &&
      selectedFiles.length > selectedAIArt.maxImages
    ) {
      // Delay opening to avoid event collision with the trigger action
      const timeoutId = setTimeout(() => {
        setIsOpenImageLimitAlert(true);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [selectedAIArt, selectedFiles, setIsOpenImageLimitAlert]);

  return (
    <>
      <div className="gap-small-1 py-small-1 flex flex-col items-start">
        <div className="ps-medium-2 pe-small-1 flex w-full items-center justify-between">
          <p
            className={compositeStyles(
              "py-small-0.75 text-bodyS-highlight",
              isDisabledInputBasedOnMessageStatus
                ? "text-text-action-tertiary-disabled"
                : "text-text-general-primary"
            )}
          >
            {conversationT.rich("createImage.chooseStyle", {
              span: renderChooseStyleSpan(isDisabledInputBasedOnMessageStatus),
            })}
          </p>
          <Button
            className="p-small-1 hover:brightness-90"
            color="none"
            size="none"
            disabled={isDisabledInputBasedOnMessageStatus}
            startIcon={
              <SVGIcon
                src="/icons/filled/more.svg"
                className={
                  isDisabledInputBasedOnMessageStatus
                    ? "text-icon-action-tertiary-disabled"
                    : ""
                }
                width={16}
                height={16}
              />
            }
            onClick={() => toggleIsOpenAIArtModal(true)}
          />
        </div>
        <AIArtSlider
          swiperProps={swiperOptions}
          resetKey={selectedImageModel.value}
          disabled={isDisabledInputBasedOnMessageStatus}
          slides={currentAIArtOptions.map((item) => {
            // "None" ids aren't guaranteed to match across data sources (local
            // default vs. remote-config-fetched catalog carry independent
            // ids for it), so fall back to comparing by the stable `value`
            // enum for that one case; other styles still match by `id` since
            // `value` isn't guaranteed unique across cloned variant cards.
            const isSelected =
              item.id === selectedAIArt.id ||
              (item.value === EAIART_STYLE.NONE &&
                selectedAIArt.value === EAIART_STYLE.NONE);
            const hasSeenValue = hasSeen(item.value);

            if (!item.isEnabled) {
              return null;
            }

            return (
              <AIArtCardMini
                key={item.id}
                title={item.title}
                image={item.image}
                gifImage={item.gifImage}
                isDisabled={isDisabledInputBasedOnMessageStatus}
                isSelected={isSelected}
                isNew={item.isNew && !hasSeenValue}
                onClick={() => handleSelect(item.id)}
              />
            );
          })}
        />
      </div>
      <AIArtModal
        options={currentAIArtOptions}
        seenAIArtItems={seenItems}
        open={isOpenAIArtModal}
        selectedAIArt={selectedAIArt}
        onClickAIArt={handleSelect}
        onClose={toggleIsOpenAIArtModal}
      />
      <ConfirmModal
        className="w-full md:w-[384px]"
        title={conversationT("modal.uploadNotSupport.title")}
        description={conversationT.rich(
          "modal.uploadNotSupport.descWithAction",
          {
            span: renderUploadNotSupportSpan,
          }
        )}
        proceedText={conversationT("modal.uploadNotSupport.proceedText")}
        closeText={ctaT("stay")}
        open={isOpenImageUploadNotSupportedValidationModal}
        onClose={handleClose}
        onProceed={handleRemoveAndSwitch}
      />
    </>
  );
}
