import { useTranslations } from "next-intl";
import type { FileRejection } from "react-dropzone";
import { toast } from "sonner";

import {
  ACCEPT_FILES_AI_ART,
  ACCEPT_FILES_COMMON,
} from "@/components/file-upload-area/consts";
import type { TValidationResult } from "@/core/models/conversation";
import { EConversationMode } from "@/core/models/conversation";
import { conversationUC, fileUC } from "@/core/usecases";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useConversationState } from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";
import { handleUploadErrors } from "@/utils/commons/error";
import {
  FREE_QUANTITY_UPLOAD,
  MAX_SIZE_IN_MB,
  PREMIUM_QUANTITY_UPLOAD,
} from "@/utils/constants/conversation";
import { FileManager } from "@/utils/file-manager";
import { mappingFromFileToFileMessage } from "@/utils/mappers/conversations";

export function useConversationFiles() {
  // Global state
  const { isValidPremiumUser } = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const chatFreeUsage = useGlobalState((state) => state.chatFreeUsage);
  const setChatFreeUsage = useGlobalState((state) => state.setChatFreeUsage);

  //For Tracking
  const { sendTrackingEvent } = useSendTrackingEvent();
  const user = useGlobalState((state) => state.user);

  // Conversation state
  const useCaseConversation = useConversationState(
    (state) => state.useCaseConversation
  );
  const selectedModel = useConversationState((state) => state.selectedModel);
  const selectedFiles = useConversationState((state) => state.selectedFiles);
  const selectedAIArt = useConversationState((state) => state.selectedAIArt);
  const conversationMode = useConversationState((state) => state.mode);
  const setSelectedFiles = useConversationState(
    (state) => state.setSelectedFiles
  );

  const conversationT = useTranslations("conversationPage");
  const commonT = useTranslations("common");

  const getErrorMessage = (result: TValidationResult): string => {
    if (result.errorKey) {
      return commonT(result.errorKey, result.errorParams);
    }
    return "";
  };

  // Values
  const isModelUnsupported = !selectedModel.isAllowChatVision;
  const isFileBlocked = !isValidPremiumUser && chatFreeUsage.file <= 0;
  const acceptFiles =
    conversationMode === EConversationMode.AI_ART
      ? ACCEPT_FILES_AI_ART
      : ACCEPT_FILES_COMMON;

  const getMaxFiles = () => {
    if (!isValidPremiumUser) {
      return FREE_QUANTITY_UPLOAD;
    }
    if (conversationMode === EConversationMode.AI_ART) {
      return selectedAIArt.maxImages;
    }
    return PREMIUM_QUANTITY_UPLOAD;
  };

  const maxFiles = getMaxFiles();

  const fileUploadContent = fileUC.getFileUploadContent({
    acceptFiles,
    conversationMode,
    maxFiles,
    maxSizeInMB: MAX_SIZE_IN_MB,
    t: conversationT,
  });

  /**
   * Handles tracking events based on the presence of PDF or image file types in an attachment.
   *
   * Sends a tracking event for an image file if `hasImg` is true.
   *
   * @param hasPdf - Indicates whether the attachment contains a PDF file.
   * @param hasImg - Indicates whether the attachment contains an image file.
   */
  const handleAttachmentHasFileType = (hasPdf: boolean, hasImg: boolean) => {
    if (hasImg && conversationMode !== EConversationMode.AI_ART) {
      sendTrackingEvent({
        name: EventKeys.ChatWithImage,
        payload: {
          vulcan_user_id: user.id,
        },
      });
    }
  };

  const validateUploadConditions = () => {
    if (useCaseConversation.isUseCase) {
      toast.error(null, { description: conversationT("tooltip.usecase") });
      return false;
    }

    if (isModelUnsupported) {
      toast.error(null, {
        description: conversationT("tooltip.modelNotSupport"),
      });
      return false;
    }

    if (isFileBlocked) {
      toast.error(null, { description: conversationT("tooltip.limit") });
      return false;
    }

    return true;
  };

  const onFiles = (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    // Validate pre-conditions
    if (!validateUploadConditions()) {
      return;
    }

    // Handle file rejections
    if (fileRejections.length > 0) {
      const [firstError] = fileRejections;
      if (firstError) {
        handleUploadErrors(firstError, maxFiles);
      }
      return;
    }

    // Transform & merge files
    const transformAcceptedFiles = mappingFromFileToFileMessage(acceptedFiles);
    const mergedFiles = [...selectedFiles, ...transformAcceptedFiles];

    // Validate file contents (after processing)
    const validateFilesResult = conversationUC.validateFilesForConversation({
      conversationMode,
      files: mergedFiles,
      maxFiles,
      selectedAIArt,
    });

    if (!validateFilesResult.isValid) {
      toast.error(null, { description: getErrorMessage(validateFilesResult) });
      return;
    }

    // Update chat free usage
    if (!isValidPremiumUser) {
      const calcFileUsage = Math.max(
        0,
        chatFreeUsage.file - transformAcceptedFiles.length
      );
      setChatFreeUsage({ ...chatFreeUsage, file: calcFileUsage });
    }

    // Tracking Event
    FileManager.handleDetectFileTypes(mergedFiles, handleAttachmentHasFileType);
    setSelectedFiles(mergedFiles);
  };

  return {
    acceptFiles,
    fileUploadContent,
    isFileBlocked,
    maxFiles,
    maxSizeInMB: MAX_SIZE_IN_MB,
    onFiles,
    selectedFiles,
  };
}
