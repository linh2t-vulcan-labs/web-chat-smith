"use client";

import { useCallback } from "react";
import { FreeMode, Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import { FileDisplay } from "@/components/file-display";
import type { TFileIdProps } from "@/components/file-display/types";
import { addRecentFilesToLocalStorage } from "@/core/instances/file-storage";
import type { TFileMessage, TSelectedFile } from "@/core/models/conversation";
import { fileUC } from "@/core/usecases";
import {
  useConversationState,
  useConversationStore,
} from "@/store/conversation/hooks";
import { compositeStyles } from "@/utils/commons/styles";

interface TFileDisplayZoneProps {
  className?: string;
}

export default function FileDisplayZone({
  className = "",
}: TFileDisplayZoneProps) {
  const conversationStore = useConversationStore();
  const selectedFiles = useConversationState((state) => state.selectedFiles);
  const setIsEditImage = useConversationState((state) => state.setIsEditImage);
  const setSelectedFiles = useConversationState(
    (state) => state.setSelectedFiles
  );

  const updateFileUploadStates = useConversationState(
    (state) => state.updateFileUploadStatesByFileId
  );
  const removeFileUploadState = useConversationState(
    (state) => state.removeFileUploadStateByFileId
  );

  const handleGetFileUrl = useCallback(
    (fileIds: TFileIdProps, fileUrl: string) => {
      const updatedFiles: TSelectedFile[] = fileUC.updateFileUrlByMockId(
        conversationStore.getState().selectedFiles,
        fileIds,
        fileUrl
      );

      if (fileUrl) {
        const updatedFile = updatedFiles.find(
          (file) => file.mockId === fileIds.mockId
        );
        if (updatedFile && updatedFile.fileId && updatedFile.fileUrl) {
          const transformToFileMessage: TFileMessage = {
            downloadUrl: updatedFile.fileUrl,
            fileId: updatedFile.fileId,
            fileMimeType: updatedFile.mimeType,
            fileName: updatedFile.fileName,
            fileSize: updatedFile.fileSize,
          };

          addRecentFilesToLocalStorage([transformToFileMessage]);
        }
      }
      setSelectedFiles(updatedFiles);
    },
    [conversationStore, setSelectedFiles]
  );

  const handleRemoveDisplayFile = useCallback(
    (fileIds: TFileIdProps) => {
      const updatedFiles = fileUC.removeFileByMockId(
        conversationStore.getState().selectedFiles,
        fileIds.mockId
      );
      setSelectedFiles(updatedFiles);

      removeFileUploadState(fileIds.mockId);
      if (conversationStore.getState().isEditImage) {
        setIsEditImage(false);
      }
    },
    [conversationStore, removeFileUploadState, setIsEditImage, setSelectedFiles]
  );

  const handleRemoveFileUpload = useCallback(
    (fileIds: TFileIdProps) => {
      removeFileUploadState(fileIds.mockId);
    },
    [removeFileUploadState]
  );

  const handleTrackingLoadingState = useCallback(
    (fileIds: TFileIdProps, isLoading: boolean) => {
      updateFileUploadStates(fileIds.mockId, { isLoading });
    },
    [updateFileUploadStates]
  );

  const handleTrackingErrorState = useCallback(
    (fileIds: TFileIdProps, isError: boolean) => {
      updateFileUploadStates(fileIds.mockId, { isError });
    },
    [updateFileUploadStates]
  );

  if (!selectedFiles.length) {
    return null;
  }

  return (
    <Swiper
      slidesPerView="auto"
      spaceBetween={6}
      freeMode={{
        enabled: true,
        minimumVelocity: 0.2,
        momentumBounce: true,
        momentumRatio: 0.8,
        sticky: false,
      }}
      mousewheel={{
        forceToAxis: true,
        sensitivity: 1,
      }}
      modules={[FreeMode, Mousewheel]}
      className={compositeStyles("px-medium-2! py-small-1! w-full", className)}
      wrapperClass="items-center"
    >
      {selectedFiles.map((item) => (
        <SwiperSlide key={item.mockId} className="size-fit!">
          <FileDisplay
            displayFile={item}
            allowFetching
            allowPreview
            className="max-w-[256px]"
            imageDisplayMode="card"
            getDownloadUrl={handleGetFileUrl}
            getLoadingState={handleTrackingLoadingState}
            getErrorState={handleTrackingErrorState}
            onClickCancel={handleRemoveDisplayFile}
            onRemoveFileUpload={handleRemoveFileUpload}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
