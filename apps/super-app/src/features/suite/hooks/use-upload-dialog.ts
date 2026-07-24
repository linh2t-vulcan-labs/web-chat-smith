import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent, KeyboardEvent } from "react";

import type { SuitePromptAttachment } from "@/features/suite/components/ui/ai-elements/prompt-input";
import {
  usePromptInputAttachments,
  usePromptInputController,
} from "@/features/suite/components/ui/ai-elements/prompt-input";
import { useListUploads } from "@/features/suite/hooks/api";

export const useUploadDialog = () => {
  const attachments = usePromptInputAttachments();
  // Provider attachments expose addReferences (re-use without re-upload) — same path the canvas
  // "add to chat" flow uses. The local PromptInput context does not.
  const controller = usePromptInputController();
  const [open, setOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Recent uploads come from the server (re-usable reference images), fetched fresh each time the
  // dialog opens (the hook is no-cache). They are not removable here — clicking re-uses them.
  const { data: recentUploadsData } = useListUploads({ enabled: open });
  const recentFiles = useMemo<SuitePromptAttachment[]>(
    () =>
      (recentUploadsData?.uploads ?? []).map((upload) => ({
        filename: upload.filename,
        id: upload.id,
        mediaType: upload.contentType,
        removable: false,
        source: "upload",
        type: "file",
        uploadId: upload.id,
        uploadStatus: "completed",
        url: upload.downloadUrl,
      })),
    [recentUploadsData]
  );

  // Re-use a previously uploaded reference image without re-uploading (id + url already known).
  // `removable: false` is only for the picker display — the embedded attachment must be removable.
  const handleReuseFile = (file: SuitePromptAttachment) => {
    const added =
      controller.attachments.addReferences?.([{ ...file, removable: true }]) ??
      false;
    if (added) {
      setOpen(false);
    }
  };

  const pendingFileDialog = useRef(false);
  const prevFilesLength = useRef(attachments.files.length);

  useEffect(() => {
    const prev = prevFilesLength.current;
    prevFilesLength.current = attachments.files.length;

    if (pendingFileDialog.current && attachments.files.length > prev) {
      pendingFileDialog.current = false;
      setOpen(false);
    }
  }, [attachments.files.length]);

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleChooseFiles = () => {
    pendingFileDialog.current = true;
    attachments.openFileDialog();
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDragOver = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;

    if (droppedFiles.length > 0) {
      const didAddFiles = attachments.add(droppedFiles, "drop");
      if (didAddFiles) {
        setOpen(false);
      }
    }

    setIsDragging(false);
  };

  const handleUploadKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleChooseFiles();
    }
  };

  const handleRemoveFile = (fileId: string) => {
    attachments.remove(fileId);
  };

  return {
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
  };
};
