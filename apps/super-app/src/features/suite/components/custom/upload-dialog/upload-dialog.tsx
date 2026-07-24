"use client";

import { FileIcon } from "lucide-react";
import Image from "next/image";
import type { KeyboardEvent } from "react";

import ClipartIcon from "@/features/suite/assets/icons/clipart-icon.svg";
import InfoIcon from "@/features/suite/assets/icons/info-icon.svg";
import UploadIcon from "@/features/suite/assets/icons/upload-icon.svg";
import XIcon from "@/features/suite/assets/icons/x-icon.svg";
import type { SuitePromptAttachment } from "@/features/suite/components/ui/ai-elements/prompt-input";
import { Button } from "@/features/suite/components/ui/button";
import type { ImageLoadStatus } from "@/features/suite/hooks/use-image-load";
import { useImageLoad } from "@/features/suite/hooks/use-image-load";
import { useSuiteTracking } from "@/features/suite/hooks/use-suite-tracking";
import { useUploadDialog } from "@/features/suite/hooks/use-upload-dialog";
import { cn } from "@/features/suite/utils/classnames";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";

import { Dialog, DialogTitle, SuiteDialog } from "../dialog";
import { ImageInputError } from "../prompt-input/image-input-error";
import { SuiteImageSkeleton } from "../suite-image-skeleton";

const formatExtension = (filename: string) => {
  const ext = filename.split(".").pop();
  return (ext ?? "file").toUpperCase();
};

interface PromptInputUploadTriggerProps {
  hasRecentFiles: boolean;
  ariaLabel: string;
  disabled?: boolean;
  onClick: () => void;
}

interface PromptInputUploadDialogHeaderProps {
  title: string;
  closeAriaLabel: string;
  onClose: () => void;
}

interface PromptInputUploadDropzoneProps {
  title: string;
  description: string;
  isDragging: boolean;
  onChooseFiles: () => void;
  onDragLeave: React.DragEventHandler<HTMLButtonElement>;
  onDragOver: React.DragEventHandler<HTMLButtonElement>;
  onDrop: React.DragEventHandler<HTMLButtonElement>;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

interface PromptInputRecentFilesProps {
  files: SuitePromptAttachment[];
  title: string;
  untitledFileLabel: string;
  getRemoveFileAriaLabel: (filename: string) => string;
  onRemoveFile: (fileId: string) => void;
  onReuseFile: (file: SuitePromptAttachment) => void;
}

interface PromptInputRecentFileProps {
  file: SuitePromptAttachment;
  untitledFileLabel: string;
  getRemoveFileAriaLabel: (filename: string) => string;
  onRemoveFile: (fileId: string) => void;
  onReuseFile: (file: SuitePromptAttachment) => void;
  imageStatus: ImageLoadStatus;
  onImageError: () => void;
  onImageLoad: () => void;
}

export interface PromptInputUploadDialogProps {
  triggerAriaLabel: string;
  title: string;
  closeAriaLabel: string;
  dropzoneTitle: string;
  dropzoneDescription: string;
  recentFilesTitle: string;
  untitledFileLabel: string;
  getRemoveFileAriaLabel: (filename: string) => string;
  disabled?: boolean;
  onTriggerClick?: () => void;
}

export function PromptInputUploadDialog({
  triggerAriaLabel,
  title,
  closeAriaLabel,
  dropzoneTitle,
  dropzoneDescription,
  recentFilesTitle,
  untitledFileLabel,
  getRemoveFileAriaLabel,
  disabled,
  onTriggerClick,
}: PromptInputUploadDialogProps) {
  const {
    handleChooseFiles,
    handleCloseDialog,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleOpenDialog,
    handleRemoveFile,
    handleReuseFile,
    handleUploadKeyDown,
    isDragging,
    open,
    recentFiles,
    setOpen,
  } = useUploadDialog();
  const tracking = useSuiteTracking();

  // Fires on every clip click (guest → login modal, or opens the dialog), then delegates as before.
  const handleTriggerClick = () => {
    tracking.trackChatAttachFile();
    (onTriggerClick ?? handleOpenDialog)();
  };

  return (
    <>
      <PromptInputUploadTrigger
        ariaLabel={triggerAriaLabel}
        hasRecentFiles={recentFiles.length > 0}
        disabled={disabled}
        onClick={handleTriggerClick}
      />

      <Dialog onOpenChange={setOpen} open={open}>
        <SuiteDialog
          aria-describedby={undefined}
          className="gap-v1-structural-component-none text-v1-text-hierarchy-primary w-full max-w-154.75"
          showCloseButton={false}
        >
          <div className="gap-v1-structural-component-micro flex flex-col">
            <PromptInputUploadDialogHeader
              closeAriaLabel={closeAriaLabel}
              title={title}
              onClose={handleCloseDialog}
            />

            <PromptInputUploadDropzone
              description={dropzoneDescription}
              isDragging={isDragging}
              title={dropzoneTitle}
              onChooseFiles={handleChooseFiles}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onKeyDown={handleUploadKeyDown}
            />

            <PromptInputRecentFiles
              files={recentFiles}
              getRemoveFileAriaLabel={getRemoveFileAriaLabel}
              title={recentFilesTitle}
              untitledFileLabel={untitledFileLabel}
              onRemoveFile={handleRemoveFile}
              onReuseFile={handleReuseFile}
            />
          </div>
        </SuiteDialog>
      </Dialog>
    </>
  );
}

function PromptInputUploadTrigger({
  ariaLabel,
  disabled,
  onClick,
}: PromptInputUploadTriggerProps) {
  return (
    <Button
      aria-label={ariaLabel}
      data-testid={DATA_TEST_ID.suite.custom.promptInputUploadDialog}
      className="p-v1-structural-component-micro hover:rounded-v1-circle hover:bg-v1-surface-overlay-interactive-hover disabled:opacity-v1-de-emphasis size-9 overflow-hidden"
      disabled={disabled}
      onClick={onClick}
      size={null}
      type="button"
      variant={null}
    >
      <ClipartIcon className="text-v1-icons-hierarchy-primary size-5" />
    </Button>
  );
}

function PromptInputUploadDialogHeader({
  closeAriaLabel,
  title,
  onClose,
}: PromptInputUploadDialogHeaderProps) {
  return (
    <div className="py-v1-structural-content-tight pe-v1-structural-content-none ps-v1-structural-content-normal flex items-center">
      <DialogTitle className="typo-v1-heading-h4 text-v1-text-hierarchy-primary flex-1 capitalize">
        {title}
      </DialogTitle>
      <div className="**:data-[slot='button']:rounded-v1-pill **:data-[slot='button']:p-v1-structural-content-micro **:data-[slot='button']:size-7">
        <Button
          aria-label={closeAriaLabel}
          onClick={onClose}
          type="button"
          variant="ghost"
          className="hover:bg-v1-surface-overlay-interactive-hover"
        >
          <XIcon className="text-v1-action-icon-secondary size-5" />
        </Button>
      </div>
    </div>
  );
}

function PromptInputUploadDropzone({
  title,
  description,
  isDragging,
  onChooseFiles,
  onDragLeave,
  onDragOver,
  onDrop,
  onKeyDown,
}: PromptInputUploadDropzoneProps) {
  return (
    <Button
      type="button"
      className={cn(
        "gap-v1-structural-content-normal md:gap-v1-structural-content-relaxed rounded-v1-medium! border-v1-border-structural-default px-v1-structural-component-medium py-v1-structural-component-large md:px-v1-structural-section-standard md:py-v1-structural-section-spacious flex w-full min-w-0 cursor-pointer flex-col items-center justify-center border border-dashed bg-transparent whitespace-normal md:h-57",
        isDragging &&
          "bg-v1-surface-overlay-interactive-hover border-v1-border-interactive-hover"
      )}
      onClick={onChooseFiles}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onKeyDown={onKeyDown}
      size={null}
      tabIndex={0}
      variant={null}
    >
      <div className="rounded-v1-medium border-v1-border-structural-default bg-v1-surface-hierarchy-container-low p-v1-optical-strong flex size-11 items-center justify-center border">
        <UploadIcon className="text-v1-icons-hierarchy-primary size-6" />
      </div>

      <div className="gap-v1-structural-content-tight flex max-w-full min-w-0 flex-col items-center">
        <p className="typo-v1-heading-h5 text-v1-text-hierarchy-primary max-w-full text-center whitespace-normal capitalize">
          {title}
        </p>
        <p className="gap-v1-structural-content-micro text-functional-scale-0 text-v1-text-hierarchy-tertiary flex max-w-full items-center justify-center text-center leading-4 whitespace-normal">
          <InfoIcon className="text-v1-icons-hierarchy-tertiary size-3 shrink-0" />
          <span className="typo-v1-support-secondary-normal min-w-0 whitespace-normal">
            {description}
          </span>
        </p>
      </div>
    </Button>
  );
}

function PromptInputRecentFiles({
  files,
  title,
  untitledFileLabel,
  getRemoveFileAriaLabel,
  onRemoveFile,
  onReuseFile,
}: PromptInputRecentFilesProps) {
  const imageKeys = files.map((file) => file.id);
  const { getImageStatus, handleImageError, handleImageLoad } =
    useImageLoad(imageKeys);

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="gap-v1-structural-content-normal px-v1-structural-content-tight py-v1-structural-component-micro flex flex-col">
      <p className="typo-v1-label-compact-allcap text-v1-text-hierarchy-primary uppercase">
        {title}
      </p>

      <div className="gap-v1-optical-normal flex flex-wrap">
        {files.map((file) => (
          <PromptInputRecentFile
            file={file}
            getRemoveFileAriaLabel={getRemoveFileAriaLabel}
            key={file.id}
            untitledFileLabel={untitledFileLabel}
            onRemoveFile={onRemoveFile}
            onReuseFile={onReuseFile}
            imageStatus={getImageStatus(file.id)}
            onImageError={() => handleImageError(file.id)}
            onImageLoad={() => handleImageLoad(file.id)}
          />
        ))}
      </div>
    </div>
  );
}

function PromptInputRecentFile({
  file,
  untitledFileLabel,
  getRemoveFileAriaLabel,
  onRemoveFile,
  onReuseFile,
  imageStatus,
  onImageError,
  onImageLoad,
}: PromptInputRecentFileProps) {
  const filename = file.filename ?? untitledFileLabel;
  const isImage = file.mediaType?.startsWith("image/");
  // Server recent uploads aren't removable; clicking them re-uses the file instead.
  const isRemovable = file.removable !== false;

  if (isImage && file.url) {
    return (
      <div className={cn("relative", imageStatus !== "error" && "group")}>
        <button
          className={cn(
            "rounded-v1-300 relative block size-13 cursor-pointer overflow-hidden",
            imageStatus === "error" && "pointer-events-none"
          )}
          onClick={() => onReuseFile(file)}
          type="button"
        >
          {imageStatus === "loading" && (
            <SuiteImageSkeleton className="absolute inset-0" />
          )}
          {imageStatus === "error" && (
            <ImageInputError className="absolute inset-0" />
          )}
          {imageStatus !== "error" && (
            <Image
              alt={filename}
              className={cn(
                "size-13 object-cover transition-opacity duration-300",
                imageStatus === "loaded" ? "opacity-100" : "opacity-0"
              )}
              height={52}
              src={file.url}
              unoptimized
              width={52}
              onError={onImageError}
              onLoad={onImageLoad}
            />
          )}
          {/* Hover scrim overlay */}
          <span className="bg-v1-surface-overlay-scrim-light pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
        {isRemovable && (
          <button
            aria-label={getRemoveFileAriaLabel(filename)}
            className="rounded-v1-pill bg-v1-surface-hierarchy-raised absolute -inset-e-1.5 -top-1.5 flex size-4 items-center justify-center opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
            onClick={() => onRemoveFile(file.id)}
            type="button"
          >
            <XIcon className="text-v1-action-icon-tertiary size-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      className="gap-v1-optical-normal rounded-v1-300 border-v1-border-structural-default bg-v1-surface-hierarchy-raised p-v1-structural-content-micro hover:bg-v1-surface-overlay-interactive-hover flex h-13 w-48 cursor-pointer items-center border text-start"
      onClick={() => onReuseFile(file)}
      type="button"
    >
      <div className="rounded-v1-200 border-v1-border-structural-default bg-v1-surface-hierarchy-raised flex size-11 shrink-0 items-center justify-center border">
        <FileIcon className="text-v1-text-hierarchy-primary size-6" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-functional-scale-n1 text-v1-text-hierarchy-emphasis truncate leading-3">
          {filename}
        </p>
        <p className="mt-v1-optical-hairline rounded-v1-small border-v1-border-structural-default px-v1-structural-content-micro py-v1-optical-hairline text-functional-scale-n2 text-v1-text-hierarchy-tertiary inline-flex border leading-3 font-medium uppercase">
          {formatExtension(filename)}
        </p>
      </div>

      {isRemovable && (
        <Button
          aria-label={getRemoveFileAriaLabel(filename)}
          className="rounded-v1-pill flex size-5 shrink-0 items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            onRemoveFile(file.id);
          }}
          type="button"
        >
          <XIcon className="text-v1-action-icon-tertiary size-4" />
        </Button>
      )}
    </button>
  );
}
