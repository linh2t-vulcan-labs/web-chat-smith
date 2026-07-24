import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { memo } from "react";
import type { FileRejection } from "react-dropzone";
import { toast } from "sonner";

import { Button } from "@/components/button";
import type { TFileIdProps } from "@/components/file-display/types";
import { Icon } from "@/components/icon";
import { ToolTip } from "@/components/tooltip";
import { GUIDE_TOUR_IDS } from "@/config/guide-tour";
import type {
  TSelectedFile,
  TValidationResult,
} from "@/core/models/conversation";
import { EConversationMode } from "@/core/models/conversation";
import { EAIValueModel } from "@/core/models/model";
import { conversationUC, fileUC } from "@/core/usecases";
import { useConversationFiles } from "@/hooks/conversations/use-conversation-files";
import { useGetRecentFiles } from "@/hooks/file/use-get-recent-files";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import {
  useConversationState,
  useConversationStore,
} from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";

import type { TFileUploadProps } from "./types";

const FileUploadModal = dynamic(
  () => import("@/components/file-upload-modal/file-upload-modal")
);

const FileUpload = (props: TFileUploadProps) => {
  const { disabled, onOpenConfirmModel } = props;
  // Global state
  const user = useGlobalState((state) => state.user);
  const setIsOpenSubscriptionModal = useGlobalState(
    (state) => state.setIsOpenSubscriptionModal
  );
  const dsVersion = useGlobalState((state) => state.dsVersion);

  // Conversation state
  const conversationStore = useConversationStore();
  const useCaseConversation = useConversationState(
    (state) => state.useCaseConversation
  );

  const isOpenUploadFileModal = useConversationState(
    (state) => state.isOpenUploadFileModal
  );
  const selectedModel = useConversationState((state) => state.selectedModel);
  const selectedAIArt = useConversationState((state) => state.selectedAIArt);
  const setSelectedFiles = useConversationState(
    (state) => state.setSelectedFiles
  );
  const setIsOpenUploadFileModal = useConversationState(
    (state) => state.setIsOpenUploadFileModal
  );
  const selectedImageModel = useConversationState(
    (state) => state.selectedImageModel
  );
  const conversationMode = useConversationState((state) => state.mode);

  const conversationT = useTranslations("conversationPage");
  const commonT = useTranslations("common");
  const { sendTrackingEvent } = useSendTrackingEvent();

  const getErrorMessage = (result: TValidationResult): string => {
    if (result.errorKey) {
      return commonT(result.errorKey, result.errorParams);
    }
    return "";
  };
  const {
    isFileBlocked,
    acceptFiles,
    maxFiles,
    maxSizeInMB,
    fileUploadContent,
    onFiles,
  } = useConversationFiles();
  const { displayFiles, removeRecentFile } = useGetRecentFiles();

  // Variables
  const isAIArtMode = conversationMode === EConversationMode.AI_ART;
  const isModelUnsupported = !selectedModel.isAllowChatVision && !isAIArtMode;

  const renderTooltipContent = () => {
    if (useCaseConversation.isUseCase) {
      return conversationT("tooltip.usecase");
    }

    if (isModelUnsupported) {
      return conversationT("tooltip.modelNotSupport");
    }

    if (isFileBlocked) {
      return conversationT("tooltip.limit");
    }

    return conversationT("tooltip.attachFiles");
  };

  const handleOpenFileUploadModal = () => {
    if (isModelUnsupported || useCaseConversation.isUseCase) {
      return;
    }

    if (isFileBlocked) {
      setIsOpenSubscriptionModal(true, "attach_file");
      sendTrackingEvent({
        name: EventKeys.DSAutoOpen,
        payload: {
          ds_version: dsVersion,
          vulcan_source: "attach_file",
          vulcan_user_id: user.id,
        },
      });
      return;
    }

    // Open Image Upload Model Not Supported If the user tried to upload image with selected ChatSmith model
    if (selectedImageModel.value === EAIValueModel.chatsmith && isAIArtMode) {
      onOpenConfirmModel?.();
      return;
    }

    sendTrackingEvent({
      name: EventKeys.ChatAttachFile,
      payload: {
        vulcan_user_id: user.id,
      },
    });
    setIsOpenUploadFileModal(true);
  };

  const handleCloseFileUploadModal = () => {
    setIsOpenUploadFileModal(false);
  };

  const handleCancelFiles = (filesId: TFileIdProps) => {
    removeRecentFile(filesId.fileId ?? filesId.mockId);
  };

  const handleFiles = (
    acceptedFiles: File[],
    fileRejections: FileRejection[]
  ) => {
    onFiles(acceptedFiles, fileRejections);
    setIsOpenUploadFileModal(false);
  };

  const handleSelectRecentFile = (file: TSelectedFile) => {
    const selectedFiles = conversationStore?.getState().selectedFiles ?? [];
    const updateSelectedFile = fileUC.addNewFileWithMockId(selectedFiles, file);

    // Validate files
    const validateFilesResult = conversationUC.validateFilesForConversation({
      conversationMode,
      files: updateSelectedFile,
      maxFiles,
      selectedAIArt,
    });

    if (!validateFilesResult.isValid) {
      toast.error(null, { description: getErrorMessage(validateFilesResult) });
      return;
    }

    setSelectedFiles(updateSelectedFile);
    setIsOpenUploadFileModal(false);
    // Tracking ChatWithImage
    if (file.mimeType.startsWith("image/") && !isAIArtMode) {
      sendTrackingEvent({
        name: EventKeys.ChatWithImage,
        payload: {
          vulcan_user_id: user.id,
        },
      });
    }
  };

  return (
    <>
      <ToolTip
        classNames="max-w-[300px]"
        content={renderTooltipContent()}
        side="bottom"
        align="end"
      >
        <Button
          id={GUIDE_TOUR_IDS.ATTACH_FILE}
          type="button"
          className="p-small-0.5 text-icon-general-tertiary hover:rounded-half hover:bg-surface-general-bright-overlay! hover:text-icon-general-primary inline-flex max-h-[32px] max-w-[32px] disabled:brightness-50"
          color="none"
          size="none"
          disabled={disabled}
          endIcon={<Icon name="attachFile" size={24} />}
          onClick={handleOpenFileUploadModal}
        />
      </ToolTip>
      {isOpenUploadFileModal && (
        <FileUploadModal
          isOpen={isOpenUploadFileModal}
          filePreviews={displayFiles}
          maxFiles={maxFiles}
          acceptFiles={acceptFiles}
          maxSizeInMB={maxSizeInMB}
          fileUploadContent={fileUploadContent}
          onClose={handleCloseFileUploadModal}
          onClick={handleSelectRecentFile}
          onCancelFiles={handleCancelFiles}
          onFiles={handleFiles}
        />
      )}
    </>
  );
};

export default memo(FileUpload);
