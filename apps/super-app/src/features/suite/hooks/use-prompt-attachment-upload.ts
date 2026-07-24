"use client";

import type { FileUIPart } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";

import { uploadSuiteCreativeFile } from "@/features/suite/hooks/api/use-upload";
import { generateRandomUUIDV4 } from "@/utils/commons/helpers";

type SuitePromptAttachmentSource =
  | "upload"
  | "drop"
  | "paste"
  | "canvas"
  | "template";

interface SuiteImageSelectionBounds {
  height: number;
  imageHeight: number;
  imageWidth: number;
  unit: "px";
  width: number;
  x: number;
  y: number;
}

type SuiteCanvasAttachmentMeta =
  | {
      type: "full-image";
      cardId: string;
      targetImageId?: string;
    }
  | {
      type: "annotation";
      annotationId: string;
      bounds: SuiteImageSelectionBounds;
      cardId: string;
      targetImageId?: string;
    };

type SuitePromptAttachment = FileUIPart & {
  canvasMeta?: SuiteCanvasAttachmentMeta;
  id: string;
  removable?: boolean;
  source: SuitePromptAttachmentSource;
  uploadError?: unknown;
  uploadId?: string;
  uploadStatus?: "uploading" | "completed" | "failed";
};

type SuitePromptInitialAttachment = Pick<
  SuitePromptAttachment,
  "filename" | "mediaType" | "removable" | "source" | "type" | "url"
> &
  Partial<
    Pick<
      SuitePromptAttachment,
      "canvasMeta" | "id" | "uploadId" | "uploadStatus"
    >
  >;

type SuitePromptAttachmentRemoveListener = (
  attachment: SuitePromptAttachment
) => void;

interface UsePromptAttachmentUploadOptions {
  getUploadProjectId?: () => string | undefined;
  initialAttachments?: SuitePromptInitialAttachment[];
  maxFiles?: number;
  onError?: (err: {
    code: "max_files" | "max_file_size" | "accept";
    message: string;
  }) => void;
}

type PromptAttachmentUploadResult = Awaited<
  ReturnType<typeof uploadSuiteCreativeFile>
>;

function revokeBlobUrl(url: string | undefined) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

const markUploadCompleted = (
  attachment: SuitePromptAttachment,
  result: PromptAttachmentUploadResult
): SuitePromptAttachment => ({
  ...attachment,
  uploadId: result.uploadId,
  uploadStatus: "completed",
  url: result.downloadUrl,
});

const markUploadFailed = (
  attachment: SuitePromptAttachment,
  error: unknown
): SuitePromptAttachment => ({
  ...attachment,
  uploadError: error,
  uploadStatus: "failed",
});

const getInitialAttachmentFiles = (
  initialAttachments: SuitePromptInitialAttachment[] | undefined
): SuitePromptAttachment[] =>
  initialAttachments?.map((attachment) => ({
    ...attachment,
    id: attachment.id ?? generateRandomUUIDV4(),
    uploadStatus: attachment.uploadStatus ?? "completed",
  })) ?? [];

export const usePromptAttachmentUpload = ({
  getUploadProjectId,
  initialAttachments,
  maxFiles,
  onError,
}: UsePromptAttachmentUploadOptions) => {
  const [attachmentFiles, setAttachmentFiles] = useState<
    SuitePromptAttachment[]
  >(() => getInitialAttachmentFiles(initialAttachments));
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const openRef = useRef<() => void>(() => {
    // Intentional no-op default until the file input's open handler is wired up below.
  });
  const attachmentsRef = useRef(attachmentFiles);
  const attachmentFilesLengthRef = useRef(attachmentFiles.length);
  const removeListenersRef = useRef(
    new Set<SuitePromptAttachmentRemoveListener>()
  );
  const uploadPromisesRef = useRef(
    new Map<string, ReturnType<typeof uploadSuiteCreativeFile>>()
  );
  const protectedUrlsRef = useRef(new Set<string>());
  const restoreSnapshotRef = useRef<SuitePromptAttachment[] | null>(null);

  useEffect(() => {
    attachmentsRef.current = attachmentFiles;
    attachmentFilesLengthRef.current = attachmentFiles.length;
  }, [attachmentFiles]);

  // Cleanup blob URLs on unmount to prevent memory leaks.
  useEffect(
    () => () => {
      for (const file of attachmentsRef.current) {
        revokeBlobUrl(file.url);
      }
    },
    []
  );

  const notifyAttachmentRemoved = useCallback(
    (attachment: SuitePromptAttachment) => {
      for (const listener of removeListenersRef.current) {
        listener(attachment);
      }
    },
    []
  );

  const subscribeToRemove = useCallback(
    (listener: SuitePromptAttachmentRemoveListener) => {
      removeListenersRef.current.add(listener);
      return () => {
        removeListenersRef.current.delete(listener);
      };
    },
    []
  );

  const runUpload = useCallback(
    async (attachmentId: string, file: File, displayOnly?: boolean) => {
      try {
        const projectId = getUploadProjectId?.();
        const result = await uploadSuiteCreativeFile({
          displayOnly,
          file,
          projectId,
        });

        setAttachmentFiles((prev) =>
          prev.map((attachment) =>
            attachment.id === attachmentId
              ? markUploadCompleted(attachment, result)
              : attachment
          )
        );

        return result;
      } catch (error) {
        setAttachmentFiles((prev) =>
          prev.map((attachment) =>
            attachment.id === attachmentId
              ? markUploadFailed(attachment, error)
              : attachment
          )
        );
        throw error;
      }
    },
    [getUploadProjectId]
  );

  const startUpload = useCallback(
    (attachmentId: string, file: File, displayOnly?: boolean) => {
      const uploadPromise = (async () => {
        try {
          return await runUpload(attachmentId, file, displayOnly);
        } finally {
          uploadPromisesRef.current.delete(attachmentId);
        }
      })();
      uploadPromise.catch(() => {
        // Intentional no-op: runUpload already records the failure on attachment state
        // (markUploadFailed); this only prevents an unhandled promise rejection warning
        // for callers that don't await startUpload.
      });
      uploadPromisesRef.current.set(attachmentId, uploadPromise);
    },
    // oxlint-disable-next-line react/react-compiler -- deps intentionally scoped to runUpload only; uploadPromisesRef is a stable ref and doesn't need to be a dependency, verifying broader dep changes here is out of scope
    [runUpload]
  );

  const add = useCallback(
    (
      files: File[] | FileList,
      source: SuitePromptAttachmentSource = "upload",
      canvasMeta?: SuiteCanvasAttachmentMeta | SuiteCanvasAttachmentMeta[]
    ): boolean => {
      const incoming = [...files];
      if (incoming.length === 0) {
        return false;
      }

      if (
        typeof maxFiles === "number" &&
        incoming.length + attachmentFilesLengthRef.current > maxFiles
      ) {
        onError?.({
          code: "max_files",
          message: `You can upload up to ${maxFiles} files.`,
        });
        return false;
      }

      const nextAttachments = incoming.map((file, index) => ({
        canvasMeta: Array.isArray(canvasMeta) ? canvasMeta[index] : canvasMeta,
        filename: file.name,
        id: generateRandomUUIDV4(),
        mediaType: file.type,
        source,
        type: "file" as const,
        uploadStatus: "uploading" as const,
        url: "",
      }));

      setAttachmentFiles((prev) => [...prev, ...nextAttachments]);
      attachmentFilesLengthRef.current += incoming.length;

      for (const [index, attachment] of nextAttachments.entries()) {
        const file = incoming[index];
        if (file) {
          // Canvas annotation crops are FE-only preview images — create them as display_only so they
          // are excluded from the recent-uploads list (ListUserUploads). Real uploads stay listable.
          const displayOnly =
            attachment.canvasMeta?.type === "annotation" ? true : undefined;
          startUpload(attachment.id, file, displayOnly);
        }
      }

      return true;
    },
    [maxFiles, onError, startUpload]
  );

  // Appends already-built canvas reference attachments (e.g. add-to-chat full images that
  // carry a ready url, not a File to upload). Enforces the same maxFiles cap + onError toast
  // as `add` so canvas references and uploads share one quota, unlike the cap-less restoreFiles.
  const addReferences = useCallback(
    (references: SuitePromptAttachment[]): boolean => {
      if (references.length === 0) {
        return false;
      }

      if (
        typeof maxFiles === "number" &&
        references.length + attachmentFilesLengthRef.current > maxFiles
      ) {
        onError?.({
          code: "max_files",
          message: `You can upload up to ${maxFiles} files.`,
        });
        return false;
      }

      setAttachmentFiles((prev) => [...prev, ...references]);
      attachmentFilesLengthRef.current += references.length;
      return true;
    },
    [maxFiles, onError]
  );

  const remove = useCallback(
    (id: string) => {
      uploadPromisesRef.current.delete(id);
      setAttachmentFiles((prev) => {
        const found = prev.find((file) => file.id === id);
        if (found?.removable === false) {
          return prev;
        }
        revokeBlobUrl(found?.url);
        if (found) {
          notifyAttachmentRemoved(found);
        }
        return prev.filter((file) => file.id !== id);
      });
    },
    [notifyAttachmentRemoved]
  );

  const clear = useCallback(() => {
    uploadPromisesRef.current.clear();
    setAttachmentFiles((prev) => {
      for (const file of prev) {
        if (!protectedUrlsRef.current.has(file.url ?? "")) {
          revokeBlobUrl(file.url);
        }
      }
      return [];
    });
  }, []);

  const captureForRestore = useCallback((): SuitePromptAttachment[] => {
    const snapshot = attachmentsRef.current;
    restoreSnapshotRef.current = snapshot;
    for (const file of snapshot) {
      if (file.url) {
        protectedUrlsRef.current.add(file.url);
      }
    }
    return snapshot;
  }, []);

  const restoreFiles = useCallback((files: SuitePromptAttachment[]) => {
    protectedUrlsRef.current.clear();
    restoreSnapshotRef.current = null;
    setAttachmentFiles(files);
    attachmentFilesLengthRef.current = files.length;
  }, []);

  const releaseRestore = useCallback(() => {
    const snapshot = restoreSnapshotRef.current;
    restoreSnapshotRef.current = null;
    protectedUrlsRef.current.clear();
    if (snapshot) {
      for (const file of snapshot) {
        revokeBlobUrl(file.url);
      }
    }
  }, []);

  const openFileDialog = useCallback(() => {
    openRef.current?.();
  }, []);

  const waitForUploads = useCallback(async () => {
    const pendingUploads = [...uploadPromisesRef.current.entries()];
    const uploadResults =
      pendingUploads.length > 0
        ? await Promise.all(
            pendingUploads.map(async ([attachmentId, uploadPromise]) => {
              const result = await uploadPromise;
              return [attachmentId, result] as const;
            })
          )
        : [];

    const resultByAttachmentId = new Map(uploadResults);
    if (resultByAttachmentId.size > 0) {
      return attachmentsRef.current.map((attachment) => {
        const result = resultByAttachmentId.get(attachment.id);
        if (!result) {
          return attachment;
        }

        return markUploadCompleted(attachment, result);
      });
    }

    const failedUpload = attachmentsRef.current.find(
      (attachment) => attachment.uploadStatus === "failed"
    );
    if (failedUpload) {
      throw failedUpload.uploadError ?? new Error("Attachment upload failed");
    }

    return attachmentsRef.current;
  }, []);

  const registerFileInput = useCallback(
    (ref: RefObject<HTMLInputElement | null>, open: () => void) => {
      fileInputRef.current = ref.current;
      openRef.current = open;
    },
    []
  );

  const attachments = useMemo(
    () => ({
      add,
      addReferences,
      captureForRestore,
      clear,
      fileInputRef,
      files: attachmentFiles,
      openFileDialog,
      releaseRestore,
      remove,
      restoreFiles,
      subscribeToRemove,
      waitForUploads,
    }),
    [
      attachmentFiles,
      add,
      addReferences,
      remove,
      clear,
      openFileDialog,
      subscribeToRemove,
      waitForUploads,
      captureForRestore,
      restoreFiles,
      releaseRestore,
    ]
  );

  return useMemo(
    () => ({
      attachments,
      registerFileInput,
    }),
    [attachments, registerFileInput]
  );
};
