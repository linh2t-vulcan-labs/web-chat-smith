"use client";

import { useTranslations } from "next-intl";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FileRejection } from "react-dropzone";
import { toast } from "sonner";

import type { TContextMenuItem } from "@/components/context-menu/types";
import CharacterCount from "@/components/conversation-input/character-count";
import WrapperInputForm from "@/components/input-v2/wrapper-input";
import { ModelCharacterCountCfg } from "@/config/sending-form";
import { WEB_FEATURE_CONFIG_KEYS } from "@/config/web-features";
import { EAIART_STYLE } from "@/core/models/chat-features/image-creation";
import type { TValidationResult } from "@/core/models/conversation";
import { EConversationMode } from "@/core/models/conversation";
import { EAIValueModel } from "@/core/models/model";
import { conversationUC } from "@/core/usecases";
import { useChatSyncFlag } from "@/features/chat-sync/hooks/use-chat-sync-flag";
import { useConversationUrlParams } from "@/hooks/conversations/query-params/conversation-url-params-context";
import { useFeatureSetting } from "@/hooks/feature-setting/use-feature-setting";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import {
  useConversationState,
  useIsDisabledInputBasedOnMessageStatus,
} from "@/store/conversation/hooks";
import type { TFileUploadStatus } from "@/store/conversation/types";
import { useGlobalState } from "@/store/global/hooks";
import { fileValidator } from "@/utils/commons/error";
import { localStorageImpl } from "@/utils/commons/helpers";
import { HAS_SEEN_PRO_PLAN_EXPIRED_MODAL_KEY } from "@/utils/commons/keys";
import { isNotEmptyInput } from "@/utils/commons/string";
import { compositeStyles } from "@/utils/commons/styles";
import { KEY_CODES, KEYBOARD_KEYS } from "@/utils/constants/common";
import {
  AI_ART_MAX_INPUT_LENGTH,
  MESSAGE_THRESHOLD,
} from "@/utils/constants/conversation";
import { extensionToMimeTypeMap } from "@/utils/constants/file";
import { getValueFromRecordFileUploadStatus } from "@/utils/mappers/conversations";

import { FileAttachmentList } from "../file-attachment-list";
import { MentionInput } from "../mention-input";
import type { TMentionInputHandler } from "../mention-input/types";
import ButtonGenerate from "./button-generate";
import ButtonSubmit from "./button-submit";
import FeatureTools from "./features/feature-tools";
import { AIArtPanel } from "./features/image-creation/ai-art-panel";
import { SelectionCustomResponseChip } from "./features/selection-custom-response-chip";
import { SelectionImageModelChip } from "./features/selection-image-model-chip";
import { SelectionModelAIChip } from "./features/selection-model-ai-chip";
import type { TCharacterCountStatus, TConversationInputProps } from "./types";

const ConversationInput = memo((props: TConversationInputProps) => {
  const {
    userInput,
    isPending,
    enableEnterPress = true,
    isLoading,
    onStopGenerating,
    onSubmit,
    onPaste,
    onOpenImageUploadNotSupportedModel,
  } = props;
  const commonT = useTranslations("common");
  const conversationT = useTranslations("conversationPage");

  const getErrorMessage = (result: TValidationResult): string => {
    if (result.errorKey) {
      return commonT(result.errorKey, result.errorParams);
    }
    return "";
  };

  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const mentionInputRef = useRef<TMentionInputHandler>(null);

  const selectedModel = useConversationState((state) => state.selectedModel);
  const selectedFiles = useConversationState((state) => state.selectedFiles);
  const selectedAIArt = useConversationState((state) => state.selectedAIArt);
  const fileUploadStates = useConversationState(
    (state) => state.fileUploadStates
  );
  const conversationMode = useConversationState((state) => state.mode);
  const useCaseConversation = useConversationState(
    (state) => state.useCaseConversation
  );
  const selectedImageModel = useConversationState(
    (state) => state.selectedImageModel
  );

  const setConversationMode = useConversationState((state) => state.setMode);
  const setUserInput = useConversationState((state) => state.setUserInput);

  // Feature Flags
  const featureCustomResponse = useFeatureSetting(
    WEB_FEATURE_CONFIG_KEYS.CUSTOM_RESPONSE
  );
  const { isBeta: enabledChatSync } = useChatSyncFlag();

  // For Tracking
  const user = useGlobalState((state) => state.user);
  const { sendTrackingEvent } = useSendTrackingEvent();
  const userSubscriptionInfo = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const setIsOpenSubscriptionExpiredModal = useGlobalState(
    (state) => state.setIsOpenSubscriptionExpiredModal
  );
  const { canShowExpiredSubPopup } = userSubscriptionInfo;

  const [countStatus, setCountStatus] =
    useState<TCharacterCountStatus>("success");

  const { handleSelectConversationMode } = useConversationUrlParams();

  const { isShowCharacterCount, totalCharacter } = useMemo(() => {
    if (conversationMode === EConversationMode.AI_ART) {
      const MESSAGE_CHARACTER_LIMIT =
        AI_ART_MAX_INPUT_LENGTH * MESSAGE_THRESHOLD;
      const isShowCharacterCount = userInput.length > MESSAGE_CHARACTER_LIMIT;

      return { isShowCharacterCount, totalCharacter: AI_ART_MAX_INPUT_LENGTH };
    }

    const totalCharacter = ModelCharacterCountCfg[selectedModel.value];
    const MESSAGE_CHARACTER_LIMIT = totalCharacter * MESSAGE_THRESHOLD;
    const isShowCharacterCount = userInput.length > MESSAGE_CHARACTER_LIMIT;

    return { isShowCharacterCount, totalCharacter };
  }, [selectedModel, userInput, conversationMode]);

  const isDisabledOtherFeatures = conversationMode !== EConversationMode.CHAT;
  const isDisabledInputBasedOnMessageStatus =
    useIsDisabledInputBasedOnMessageStatus();
  const isFileUploadDisabled =
    conversationUC.isDisabledFileUpload(conversationMode);

  const validateConversationInput = useCallback(() => {
    const { isModelImageToImage, validateAIArtInput } = conversationUC;

    // AI Art mode with image-to-image models has special validation rules
    if (isModelImageToImage(conversationMode, selectedImageModel.value)) {
      return validateAIArtInput(userInput, selectedFiles, selectedAIArt);
    }

    // For all other modes, just check if input is not empty
    return isNotEmptyInput(userInput);
  }, [
    conversationMode,
    userInput,
    selectedFiles,
    selectedAIArt,
    selectedImageModel.value,
  ]);

  const isSubmitted = useMemo(() => {
    const isInputValid = validateConversationInput();

    if (!isInputValid) {
      return false;
    }

    if (isPending) {
      return false;
    }

    if (!countStatus || countStatus === "error") {
      return false;
    }

    return true;
  }, [validateConversationInput, isPending, countStatus]);

  const fileUploadStatus: TFileUploadStatus = useMemo(
    () => getValueFromRecordFileUploadStatus(fileUploadStates),
    [fileUploadStates]
  );

  const hasUploadFileIssue = ["error", "loading"].includes(fileUploadStatus);

  const isDisabledSubmitButton =
    !isSubmitted || hasUploadFileIssue || isDisabledInputBasedOnMessageStatus;
  const isExistPdfFile = selectedFiles.some(
    (file) => file.mimeType === extensionToMimeTypeMap.pdf
  );

  const ITEMS = useMemo(
    () => [
      {
        description: commonT("imageCreationDescription"),
        icon: "/icons/outlined/ai-art.svg",
        id: EConversationMode.AI_ART,
        title: commonT("imageCreation"),
      },
      {
        description: commonT("deepResearchDescription"),
        icon: "/icons/outlined/deep-research.svg",
        id: EConversationMode.DEEP_RESEARCH,
        title: commonT("deepResearch"),
      },
      {
        description: commonT("webSearchDescription"),
        icon: "/icons/outlined/web-search.svg",
        id: EConversationMode.WEB_SEARCH,
        title: commonT("webSearch"),
      },
    ],
    [commonT]
  );

  const filterMentionOptions = useMemo(() => {
    if (isExistPdfFile) {
      return [];
    }

    if (selectedFiles.length > 0) {
      return ITEMS.slice(0, 1);
    }

    return ITEMS;
  }, [selectedFiles, ITEMS, isExistPdfFile]);

  const isAllowToShowMention =
    conversationMode === EConversationMode.CHAT &&
    !useCaseConversation.isUseCase;

  const isDisabledSelectAIModels =
    isDisabledOtherFeatures || isDisabledInputBasedOnMessageStatus;

  const checkShowSubscriptionExpiredModal = (): boolean => {
    const seenSubscriptionExpired = localStorageImpl.load(
      HAS_SEEN_PRO_PLAN_EXPIRED_MODAL_KEY
    );
    if (!seenSubscriptionExpired && canShowExpiredSubPopup) {
      setIsOpenSubscriptionExpiredModal(true);
      return true;
    }
    return false;
  };

  const handleEnterPress = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    if (!enableEnterPress) {
      return;
    }

    if (ev.keyCode === KEY_CODES.IME_PROCESSING) {
      return;
    }

    if (ev.key === KEYBOARD_KEYS.Enter && !ev.shiftKey) {
      ev.preventDefault();
      const preventChat = checkShowSubscriptionExpiredModal();
      if (preventChat) {
        return;
      }
      submitButtonRef.current?.click();
    }
  };

  const handleChangeStatus = (status: TCharacterCountStatus) => {
    setCountStatus(status);
  };

  const handleClickForm = (e: React.MouseEvent<HTMLDivElement>) => {
    const domNode = mentionInputRef.current?.getDOMNode?.();

    if (!domNode) {
      return;
    }

    const target = e.target as Node;

    if (!domNode.contains(target)) {
      setTimeout(() => {
        mentionInputRef.current?.focus?.();
      }, 0);
    }
  };

  const handleClickButtonGenerate = (
    _e: React.MouseEvent<HTMLButtonElement>
  ) => {
    onStopGenerating?.();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const accepted: File[] = [];
    const rejected: FileRejection[] = [];
    const files = [...(e.clipboardData.files as FileList)];

    if (!files.length) {
      return;
    }
    e.preventDefault();

    for (const file of files) {
      const error = fileValidator(file);
      if (error) {
        rejected.push({ errors: [error], file });
      } else {
        accepted.push(file);
      }
    }

    onPaste(accepted, rejected);
  };

  const handleChangeInput = (text: string) => {
    setUserInput(text);
  };

  const handleSelectMention = (item: TContextMenuItem) => {
    if (item.id === EConversationMode.AI_ART) {
      const validateFilesResult = conversationUC.validateFilesForConversation({
        conversationMode: item.id,
        files: selectedFiles,
        selectedAIArt,
      });

      if (!validateFilesResult.isValid) {
        toast.error(null, {
          description: getErrorMessage(validateFilesResult),
        });
        return;
      }

      // Tracking ChatArtUsage
      const isChatSmithText2Image =
        selectedImageModel.value === EAIValueModel.chatsmith;
      const isText2Image =
        isChatSmithText2Image ||
        (selectedAIArt.value === EAIART_STYLE.NONE &&
          selectedFiles.length === 0);
      sendTrackingEvent({
        name: EventKeys.ChatArtUsage,
        payload: {
          model: isChatSmithText2Image
            ? "text2image"
            : selectedImageModel.value,
          vulcan_type: isText2Image ? "text2image" : "image2image",
          vulcan_user_id: user.id,
        },
      });
    }

    setConversationMode(item.id as EConversationMode);
  };

  const renderPlaceholder = () => {
    if (conversationMode === EConversationMode.AI_ART) {
      if (selectedImageModel.value === EAIValueModel.chatsmith) {
        return conversationT("input.placeholder.textToImage");
      }

      if (selectedAIArt.value === EAIART_STYLE.NONE) {
        return conversationT("input.placeholder.imageToImage.allowText2Image");
      }

      if (selectedAIArt.maxImages > 1) {
        return conversationT("input.placeholder.imageToImage.banana", {
          maxImages: selectedAIArt.maxImages,
        });
      }

      return conversationT("input.placeholder.imageToImage.normal");
    }

    return conversationT("input.placeholder.normalChat");
  };

  const onSubmitChat = () => {
    const preventChat = checkShowSubscriptionExpiredModal();
    if (preventChat) {
      return;
    }
    onSubmit?.();
  };

  useEffect(() => {
    mentionInputRef.current?.focus?.();
  }, []);

  return (
    <WrapperInputForm
      className={compositeStyles(
        "thickness-medium dark:bg-surface-general-soft hover:bg-surface-general-glass dark:hover:bg-surface-general-soft! focus:bg-surface-general-soft! border-v1-neutral-dark-100 flex flex-col overflow-hidden border bg-white/70 p-0! backdrop-blur-[80px] duration-0! dark:border-transparent",
        {
          "opacity-80": isDisabledInputBasedOnMessageStatus,
        }
      )}
    >
      <AIArtPanel />
      <FileAttachmentList />
      <div
        className={compositeStyles(
          "gap-small-1 p-medium-2 flex",
          isDisabledInputBasedOnMessageStatus ? "" : "hover:cursor-text"
        )}
        onClick={handleClickForm}
      >
        <MentionInput
          ref={mentionInputRef}
          mentionOptions={filterMentionOptions}
          value={userInput}
          disabled={isDisabledInputBasedOnMessageStatus}
          onSelectMention={handleSelectMention}
          onInputChange={handleChangeInput}
          onKeyDown={handleEnterPress}
          placeholder={renderPlaceholder()}
          isAllowToShowMention={isAllowToShowMention}
          onPaste={handlePaste}
        />
      </div>

      <div className="px-small-1 pb-small-0.75 pt-small-1 flex items-center justify-between bg-transparent">
        <FeatureTools
          mode={conversationMode}
          isDisabledFileUpload={
            isFileUploadDisabled || isDisabledInputBasedOnMessageStatus
          }
          isDisabledAIArt={useCaseConversation.isUseCase}
          isDisabledDeepSearch={useCaseConversation.isUseCase}
          isDisabledWebSearch={useCaseConversation.isUseCase}
          onSelectFeature={handleSelectConversationMode}
          onOpenConfirmModel={onOpenImageUploadNotSupportedModel}
        />
        <div className="gap-small-0.75 flex items-center">
          {featureCustomResponse.isEnabled && (
            <SelectionCustomResponseChip
              disabled={isDisabledInputBasedOnMessageStatus}
            />
          )}
          {conversationMode === EConversationMode.AI_ART ? (
            <SelectionImageModelChip
              disabled={isDisabledInputBasedOnMessageStatus}
            />
          ) : (
            <SelectionModelAIChip disabled={isDisabledSelectAIModels} />
          )}
          {isShowCharacterCount && (
            <CharacterCount
              total={totalCharacter}
              current={userInput.length}
              onStatus={handleChangeStatus}
            />
          )}
          {isLoading && enabledChatSync ? (
            <ButtonGenerate
              disabled={isDisabledInputBasedOnMessageStatus}
              onClick={handleClickButtonGenerate}
            />
          ) : (
            <ButtonSubmit
              ref={submitButtonRef}
              disabled={isDisabledSubmitButton}
              onClick={onSubmitChat}
            />
          )}
        </div>
      </div>
    </WrapperInputForm>
  );
});
ConversationInput.displayName = "ConversationInput";

export default ConversationInput;
