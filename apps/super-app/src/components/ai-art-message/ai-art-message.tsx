import { useToggle } from "@uidotdev/usehooks";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { memo, useEffect, useRef } from "react";
import { toast } from "sonner";

import type { TAIArtMessageProps } from "@/components/ai-art-message/types";
import MessageActions from "@/components/message-bubble/message-actions";
import { MessageMarkdown } from "@/components/message-markdown";
import { MessageUpgradePremium } from "@/components/message-upgrade-premium";
import { EConversationMode } from "@/core/models/conversation";
import { fileUC } from "@/core/usecases";
import { useChatSyncFlag } from "@/features/chat-sync/hooks/use-chat-sync-flag";
import { useCreateFilesByUrl } from "@/hooks/file/use-create-files-by-url";
import useLocalStorage from "@/hooks/use-local-storage";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { defaultConversationStoreState } from "@/store/conversation/constants";
import { useConversationState } from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";
import {
  CURRENT_AI_STYLE_VERSION,
  HAS_CLICKED_BANANA_CREATE_IMAGE,
} from "@/utils/commons/keys";
import { Logger } from "@/utils/commons/logger";
import { scrollToQuestion } from "@/utils/commons/scroll";
import { EFileExtension } from "@/utils/constants/file";

const AIArtLoading = dynamic(
  () => import("@/components/ai-art-loading/ai-art-loading")
);
const PreviewImage = dynamic(
  () => import("@/components/preview-image/preview-image")
);
const EditImageModal = dynamic(
  () => import("@/components/edit-image-modal/edit-image-modal")
);

const MessageReachLimit = dynamic(
  () => import("@/components/message-reach-limit/message-reach-limit")
);
const AIArtComingSoonMessage = dynamic(
  () => import("./ai-art-message-coming-soon")
);

const AIArtMessage: React.FC<TAIArtMessageProps> = (props) => {
  const {
    message,
    isShowRegenerateButton,
    isGenerating,
    isNewMessage,
    onCopyMessage,
    onRegenerateMessage,
  } = props;
  const { status, files, content } = message;
  const { isBeta: enabledChatSync } = useChatSyncFlag();
  const { mutateAsync: createFilesByUrlAsync } = useCreateFilesByUrl();
  const conversationId = useConversationState((state) => state.selectedId);
  const setSelectedFiles = useConversationState(
    (state) => state.setSelectedFiles
  );
  const setSelectedAIArt = useConversationState(
    (state) => state.setSelectedAIArt
  );
  const setIsOpenSliderAIArt = useConversationState(
    (state) => state.setIsOpenSliderAIArt
  );
  const setIsEditImage = useConversationState((state) => state.setIsEditImage);
  const setMode = useConversationState((state) => state.setMode);
  const [hasClickedCreateImage, setHasClickedCreateImage] = useLocalStorage(
    `${HAS_CLICKED_BANANA_CREATE_IMAGE}-${CURRENT_AI_STYLE_VERSION}`,
    false
  );
  const selectedFile = fileUC.convertFileMessageToSelectedFile(files);
  const [isOpenPreviewImg, toggleIsOpenPreviewImg] = useToggle(false);
  const conversationT = useTranslations("conversationPage");
  const isReachedLimit = status === "reachedLimit";
  const isLoading = status === "pending";
  const isPremiumOnly = status === "premiumOnly";
  const isComingSoon = status === "comingSoon";
  const imageUrl = selectedFile[0]?.fileUrl || "";
  const isExistImage = imageUrl.length > 0;

  const showActions =
    !isGenerating && message.role === "assistant" && !isLoading;
  const AiArtRef = useRef<HTMLDivElement>(null);

  // For Tracking
  const user = useGlobalState((state) => state.user);

  const { sendTrackingEvent } = useSendTrackingEvent();

  const handleDownloadImage = async () => {
    try {
      const { FileManager } = await import("@/utils/file-manager");
      const fileName = `ChatSmith Image ${new Date().toISOString()}`;
      await FileManager.clientExportFile(
        fileName,
        EFileExtension.JPEG,
        imageUrl
      );
    } catch (error) {
      const logger = new Logger("AIArtMessage");
      logger.sendError(error);
      toast.error("", {
        description: "Failed to export file. Please try again.",
      });
    }

    // Tracking ChatArtDownload
    sendTrackingEvent({
      name: EventKeys.ChatArtDownload,
      payload: {
        vulcan_user_id: user.id,
      },
    });
  };

  const handleClickImage = () => {
    toggleIsOpenPreviewImg(true);
  };

  const syncSelectedFilesIfNeeded = async () => {
    if (!enabledChatSync) {
      setSelectedFiles(selectedFile);
      return;
    }

    if (selectedFile.length === 0) {
      return;
    }

    const uploadedFiles = await createFilesByUrlAsync({
      fileUrl: selectedFile.map((file) => file.fileUrl ?? ""),
    });

    if (uploadedFiles.length === 0) {
      return;
    }

    const [firstFile] = selectedFile;
    const [uploadedFile] = uploadedFiles;

    if (!(firstFile && uploadedFile)) {
      return;
    }

    setSelectedFiles([
      {
        ...firstFile,
        fileId: uploadedFile.fileId,
      },
    ]);
  };

  const handleEditImage = async () => {
    sendTrackingEvent({
      name: EventKeys.ChatArtEditClick,
      payload: {
        vulcan_user_id: user.id,
      },
    });
    setMode(EConversationMode.AI_ART);
    setSelectedAIArt(defaultConversationStoreState.selectedAIArt);
    setIsOpenSliderAIArt(true);
    setIsEditImage(true);

    await syncSelectedFilesIfNeeded();

    if (!hasClickedCreateImage) {
      setHasClickedCreateImage(true);
    }
  };

  useEffect(() => {
    if (!isNewMessage) {
      return;
    } // Only trigger when it's a new message

    if (!AiArtRef.current) {
      return;
    }

    // Delay to ensure DOM has finished rendering and has enough height
    const timeoutId = setTimeout(() => scrollToQuestion(AiArtRef), 150);

    return () => clearTimeout(timeoutId);
  }, [content, isNewMessage]); // Trigger when content changes (streaming)

  if (isLoading) {
    return <AIArtLoading className="max-w-[538px]" />;
  }

  if (isComingSoon) {
    return <AIArtComingSoonMessage />;
  }

  if (isPremiumOnly) {
    return (
      <MessageUpgradePremium
        title={conversationT("createImage.free.title")}
        description={conversationT("createImage.free.desc")}
        purchaseSource="ai_art"
      />
    );
  }

  if (isReachedLimit) {
    return (
      <MessageReachLimit
        title={conversationT("createImage.reachLimit.title")}
        description={conversationT("createImage.reachLimit.desc")}
        purchaseSource="ai_art"
      />
    );
  }

  return (
    <div className="flex flex-col gap-small-1" ref={AiArtRef}>
      {isExistImage && (
        <PreviewImage
          imageUrl={imageUrl}
          onClick={handleClickImage}
          onEdit={handleEditImage}
          onDownload={handleDownloadImage}
        />
      )}
      <MessageMarkdown
        conversationId={conversationId}
        messageId={message.id}
        content={content ?? ""}
      />
      {showActions && (
        <MessageActions
          conversationId={conversationId}
          message={message}
          isShowRegenerateBtn={isShowRegenerateButton}
          onCopyMessage={onCopyMessage}
          onRegenerateMessage={onRegenerateMessage}
        />
      )}
      {isOpenPreviewImg && selectedFile[0] && (
        <EditImageModal
          open={isOpenPreviewImg}
          selectedFile={selectedFile[0]}
          onClose={toggleIsOpenPreviewImg}
        />
      )}
    </div>
  );
};

export default memo(AIArtMessage);
