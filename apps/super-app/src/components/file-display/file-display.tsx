"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { AspectRatio } from "radix-ui";
import { memo, useEffect, useMemo, useRef, useState } from "react";

import { EditImageCard } from "@/components/edit-image-card";
import { SVGIcon } from "@/components/svg-icon";
import type { TSelectedFile } from "@/core/models/conversation";
import { useHandleFile } from "@/hooks/file/use-handle-file";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";
import { compositeStyles } from "@/utils/commons/styles";
import { LIST_IMAGE_FILE_ENUM } from "@/utils/constants/file";
import { FileManager } from "@/utils/file-manager";

import { variantFileDisplaySize } from "./const";
import type { TFileDisplayProps } from "./types";

const PreviewFile = dynamic(() => import("./preview/preview-file"));

function FileDisplay(props: TFileDisplayProps) {
  const {
    displayFile,
    allowFetching = false,
    size = "medium",
    imageDisplayMode = "inline",
    allowPreview = false,
    isShowCloseIcon = true,
    className,
    onClickCancel,
    onClickFile,
    onRemoveFileUpload,
    getDownloadUrl,
    getLoadingState,
    getErrorState,
  } = props;
  const { sendTrackingEvent } = useSendTrackingEvent();
  const user = useGlobalState((state) => state.user);
  const variantSize = variantFileDisplaySize[size];
  const {
    fileName,
    file,
    fileUrl,
    fileId: externalId = "",
    mockId,
    mimeType,
  } = displayFile;

  const uploadedFileRef = useRef<File | null>(null);

  const [previewFileSetting, setPreviewFileSetting] = useState<{
    file: TSelectedFile | null;
    open: boolean;
  }>({
    file: null,
    open: false,
  });

  const {
    handleUpload,
    fileUrl: gcsFileUrl,
    fileId,
    isPending,
    isLoading,
    error,
    status,
  } = useHandleFile();

  useEffect(() => {
    if (
      file &&
      allowFetching &&
      !isPending &&
      file !== uploadedFileRef.current
    ) {
      uploadedFileRef.current = file;
      handleUpload(file);
    }
  }, [file, allowFetching, isPending, handleUpload]);

  useEffect(() => {
    getLoadingState?.(
      {
        fileId,
        mockId,
      },
      isLoading
    );
  }, [isLoading, fileId, getLoadingState, mockId]);

  useEffect(() => {
    getErrorState?.({ fileId, mockId }, !!error);
  }, [error, getErrorState, mockId, fileId]);

  useEffect(
    () => () => {
      onRemoveFileUpload?.({ fileId, mockId });
    },
    [onRemoveFileUpload, mockId, fileId]
  );

  useEffect(() => {
    if (gcsFileUrl && fileId) {
      getDownloadUrl?.(
        {
          fileId,
          mockId,
        },
        gcsFileUrl
      );
    }
  }, [fileId, gcsFileUrl, getDownloadUrl, mockId]);

  // Tracking ChatAttachFileDetail
  useEffect(() => {
    const fileType = FileManager.detectFileTypeFromMimeType(mimeType);
    if (error) {
      sendTrackingEvent({
        name: EventKeys.ChatAttachFileDetail,
        payload: {
          file_type: fileType,
          vulcan_status: "failed",
          vulcan_user_id: user.id,
        },
      });
    }
    if (status !== "pending") {
      sendTrackingEvent({
        name: EventKeys.ChatAttachFileDetail,
        payload: {
          file_type: fileType,
          vulcan_status: error ? "failed" : "success",
          vulcan_user_id: user.id,
        },
      });
    }
  }, [status, error, sendTrackingEvent, mimeType, user.id]);

  const { displayName, ext, isImageFile, imageUrl } = useMemo(() => {
    const splitName = fileName.split(".");
    const ext = splitName.length > 1 ? (splitName.pop() ?? "") : "";
    const displayName = splitName.join(".");

    const isImageFile = LIST_IMAGE_FILE_ENUM.some((imageFileEnum) =>
      mimeType.includes(imageFileEnum)
    );

    const imageUrl = file ? URL.createObjectURL(file) : (fileUrl ?? "");

    return {
      displayName,
      ext: ext ? `.${ext}` : "",
      imageUrl,
      isImageFile,
    };
  }, [mimeType, fileName, file, fileUrl]);

  const renderIcon = () => {
    if (isLoading) {
      return (
        <div className="animate-spin">
          <Image
            src="/images/generating.png"
            alt="loading..."
            width={16}
            height={16}
          />
        </div>
      );
    }

    if (error) {
      return (
        <SVGIcon
          src="/icons/outlined/error.svg"
          width={16}
          height={16}
          className="text-text-general-secondary"
        />
      );
    }

    if (isImageFile) {
      return (
        <AspectRatio.Root>
          <Image
            src={imageUrl}
            width={variantSize.imageSize}
            height={variantSize.imageSize}
            alt="image"
            className="size-full rounded-soft"
            style={{ objectFit: "cover" }}
          />
        </AspectRatio.Root>
      );
    }

    return (
      <Image src="/icons/outlined/file.svg" width={16} height={16} alt="file" />
    );
  };

  const handleClickCancel = (e?: React.MouseEvent<HTMLOrSVGElement>) => {
    e?.stopPropagation();
    onClickCancel?.({
      fileId: externalId,
      mockId,
    });
  };

  const handleClickPreviewFile = () => {
    if (allowPreview) {
      setPreviewFileSetting({
        file: displayFile,
        open: true,
      });
      return;
    }

    onClickFile?.(displayFile);
  };

  const onClosePreviewFile = () => {
    setPreviewFileSetting({
      file: null,
      open: false,
    });
  };

  const renderContent = () => {
    if (isImageFile && imageDisplayMode === "card") {
      return (
        <EditImageCard
          className={className}
          imageUrl={imageUrl}
          isLoading={isLoading}
          isError={!!error}
          onClick={handleClickPreviewFile}
          onCancel={handleClickCancel}
        />
      );
    }

    return (
      <button
        type="button"
        className={compositeStyles(
          "group inline-flex items-center rounded-rounded bg-surface-general-secondary hover:cursor-pointer hover:bg-surface-input-hover",
          variantSize.padding,
          className
        )}
        onClick={handleClickPreviewFile}
      >
        <div
          className={compositeStyles(
            "relative inline-flex max-w-full items-center justify-center overflow-hidden rounded-soft",
            {
              "bg-[#9C231D]": !!error && !isLoading,
              "bg-surface-input-default": isLoading,
            },
            variantSize.icon
          )}
        >
          {renderIcon()}
        </div>
        {displayName && (
          <div className="inline-flex h-full max-w-[176px] flex-1 items-center overflow-hidden text-bodyS-highlight text-text-general-secondary">
            <span className="min-w-0 truncate">{displayName}</span>
            <span className="shrink-0">{ext}</span>
          </div>
        )}
        {isShowCloseIcon && (
          <SVGIcon
            src="/icons/outlined/closed-v2.svg"
            className="cursor-pointer hover:text-text-general-primary"
            width={16}
            height={16}
            onClick={handleClickCancel}
          />
        )}
      </button>
    );
  };

  return (
    <>
      {previewFileSetting.file && (
        <PreviewFile
          open={previewFileSetting.open}
          displayFile={previewFileSetting.file}
          onClose={onClosePreviewFile}
        />
      )}

      {renderContent()}
    </>
  );
}

export default memo(FileDisplay);
