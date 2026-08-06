"use client";

import type { ChatStatus, FileUIPart, SourceDocumentUIPart } from "ai";
import {
  CornerDownLeftIcon,
  ImageIcon,
  Monitor,
  PlusIcon,
  SquareIcon,
  XIcon,
} from "lucide-react";
import { nanoid } from "nanoid";
import type {
  ChangeEvent,
  ChangeEventHandler,
  ClipboardEventHandler,
  ComponentProps,
  FormEvent,
  FormEventHandler,
  HTMLAttributes,
  KeyboardEvent,
  KeyboardEventHandler,
  PropsWithChildren,
  ReactNode,
  RefObject,
} from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "#components/shadcn/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#components/shadcn/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "#components/shadcn/hover-card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "#components/shadcn/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#components/shadcn/select";
import { Spinner } from "#components/shadcn/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "#components/shadcn/tooltip";
import { cn } from "#lib/utils";

// ============================================================================
// Helpers
// ============================================================================

const convertBlobUrlToDataUrl = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    // FileReader uses callback-based API, wrapping in Promise is necessary
    // oxlint-disable-next-line promise/avoid-new
    return new Promise((resolve) => {
      const reader = new FileReader();
      // oxlint-disable-next-line unicorn/prefer-add-event-listener
      reader.onloadend = () => resolve(reader.result as string);
      // oxlint-disable-next-line unicorn/prefer-add-event-listener
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

const waitForVideoReady = (video: HTMLVideoElement): Promise<void> =>
  // Video element uses callback-based API, wrapping in Promise is necessary
  // oxlint-disable-next-line promise/avoid-new
  new Promise((resolve, reject) => {
    // oxlint-disable-next-line unicorn/prefer-add-event-listener
    video.onloadedmetadata = () => resolve();
    // oxlint-disable-next-line unicorn/prefer-add-event-listener
    video.onerror = () => reject(new Error("Failed to load screen stream"));
  });

const drawVideoFrameToBlob = (
  video: HTMLVideoElement
): Promise<Blob | null> => {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) {
    return Promise.resolve(null);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    return Promise.resolve(null);
  }

  context.drawImage(video, 0, 0, width, height);
  // canvas.toBlob uses callback-based API, wrapping in Promise is necessary
  // oxlint-disable-next-line promise/avoid-new
  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
};

// Shared by PromptInputProvider's add() and the local attachments state in
// useAttachmentsManager: both turn a raw File into the attachment shape
// the UI renders.
const toAttachmentPart = (file: File): FileUIPart & { id: string } => ({
  filename: file.name,
  id: nanoid(),
  mediaType: file.type,
  type: "file",
  url: URL.createObjectURL(file),
});

const buildScreenshotFile = (blob: Blob): File => {
  const timestamp = new Date()
    .toISOString()
    .replaceAll(/[:.]/gu, "-")
    .replace("T", "_")
    .replace("Z", "");

  return new File([blob], `screenshot-${timestamp}.png`, {
    lastModified: Date.now(),
    type: "image/png",
  });
};

const stopScreenCapture = (
  stream: MediaStream | null,
  video: HTMLVideoElement
) => {
  if (stream) {
    for (const track of stream.getTracks()) {
      track.stop();
    }
  }
  video.pause();
  video.srcObject = null;
};

const isScreenCaptureUnsupported = (): boolean =>
  typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia;

const captureScreenshot = async (): Promise<File | null> => {
  if (isScreenCaptureUnsupported()) {
    return null;
  }

  let stream: MediaStream | null = null;
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;

  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      audio: false,
      video: true,
    });

    video.srcObject = stream;
    await waitForVideoReady(video);
    await video.play();

    const blob = await drawVideoFrameToBlob(video);
    return blob ? buildScreenshotFile(blob) : null;
  } finally {
    stopScreenCapture(stream, video);
  }
};

// ============================================================================
// Provider Context & Types
// ============================================================================

export interface AttachmentsContext {
  files: (FileUIPart & { id: string })[];
  add: (files: File[] | FileList) => void;
  remove: (id: string) => void;
  clear: () => void;
  openFileDialog: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
}

export interface TextInputContext {
  value: string;
  setInput: (v: string) => void;
  clear: () => void;
}

export interface PromptInputControllerProps {
  textInput: TextInputContext;
  attachments: AttachmentsContext;
  /** INTERNAL: Allows PromptInput to register its file textInput + "open" callback */
  __registerFileInput: (
    ref: RefObject<HTMLInputElement | null>,
    open: () => void
  ) => void;
}

const PromptInputController = createContext<PromptInputControllerProps | null>(
  null
);
const ProviderAttachmentsContext = createContext<AttachmentsContext | null>(
  null
);

export const usePromptInputController = () => {
  const ctx = useContext(PromptInputController);
  if (!ctx) {
    throw new Error(
      "Wrap your component inside <PromptInputProvider> to use usePromptInputController()."
    );
  }
  return ctx;
};

// Optional variants (do NOT throw). Useful for dual-mode components.
const useOptionalPromptInputController = () =>
  useContext(PromptInputController);

export const useProviderAttachments = () => {
  const ctx = useContext(ProviderAttachmentsContext);
  if (!ctx) {
    throw new Error(
      "Wrap your component inside <PromptInputProvider> to use useProviderAttachments()."
    );
  }
  return ctx;
};

const useOptionalProviderAttachments = () =>
  useContext(ProviderAttachmentsContext);

export type PromptInputProviderProps = PropsWithChildren<{
  initialInput?: string;
}>;

/**
 * Optional global provider that lifts PromptInput state outside of PromptInput.
 * If you don't use it, PromptInput stays fully self-managed.
 */
export const PromptInputProvider = ({
  initialInput: initialTextInput = "",
  children,
}: PromptInputProviderProps) => {
  // ----- textInput state
  const [textInput, setTextInput] = useState(initialTextInput);
  const clearInput = () => setTextInput("");

  // ----- attachments state (global when wrapped)
  const [attachmentFiles, setAttachmentFiles] = useState<
    (FileUIPart & { id: string })[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // No-op default until __registerFileInput supplies the real opener
  // oxlint-disable-next-line no-empty-function
  const openRef = useRef<() => void>(() => {});

  const add = (files: File[] | FileList) => {
    const incoming = [...files];
    if (incoming.length === 0) {
      return;
    }

    setAttachmentFiles((prev) => [...prev, ...incoming.map(toAttachmentPart)]);
  };

  const remove = (id: string) => {
    setAttachmentFiles((prev) => {
      const found = prev.find((f) => f.id === id);
      if (found?.url) {
        URL.revokeObjectURL(found.url);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const clear = () => {
    setAttachmentFiles((prev) => {
      for (const f of prev) {
        if (f.url) {
          URL.revokeObjectURL(f.url);
        }
      }
      return [];
    });
  };

  // Keep a ref to attachments for cleanup on unmount (avoids stale closure)
  const attachmentsRef = useRef(attachmentFiles);

  useEffect(() => {
    attachmentsRef.current = attachmentFiles;
  }, [attachmentFiles]);

  // Cleanup blob URLs on unmount to prevent memory leaks
  useEffect(
    () => () => {
      for (const f of attachmentsRef.current) {
        if (f.url) {
          URL.revokeObjectURL(f.url);
        }
      }
    },
    []
  );

  const openFileDialog = () => {
    openRef.current?.();
  };

  const attachments: AttachmentsContext = {
    add,
    clear,
    fileInputRef,
    files: attachmentFiles,
    openFileDialog,
    remove,
  };

  const __registerFileInput = (
    ref: RefObject<HTMLInputElement | null>,
    open: () => void
  ) => {
    fileInputRef.current = ref.current;
    openRef.current = open;
  };

  const controller: PromptInputControllerProps = {
    __registerFileInput,
    attachments,
    textInput: {
      clear: clearInput,
      setInput: setTextInput,
      value: textInput,
    },
  };

  return (
    // oxlint-disable-next-line react/jsx-no-constructed-context-values -- handled by React Compiler
    <PromptInputController.Provider value={controller}>
      {/* oxlint-disable-next-line react/jsx-no-constructed-context-values -- handled by React Compiler */}
      <ProviderAttachmentsContext.Provider value={attachments}>
        {children}
      </ProviderAttachmentsContext.Provider>
    </PromptInputController.Provider>
  );
};

// ============================================================================
// Component Context & Hooks
// ============================================================================

const LocalAttachmentsContext = createContext<AttachmentsContext | null>(null);

export const usePromptInputAttachments = () => {
  // Prefer local context (inside PromptInput) as it has validation, fall back to provider
  const provider = useOptionalProviderAttachments();
  const local = useContext(LocalAttachmentsContext);
  const context = local ?? provider;
  if (!context) {
    throw new Error(
      "usePromptInputAttachments must be used within a PromptInput or PromptInputProvider"
    );
  }
  return context;
};

// ============================================================================
// Referenced Sources (Local to PromptInput)
// ============================================================================

export interface ReferencedSourcesContext {
  sources: (SourceDocumentUIPart & { id: string })[];
  add: (sources: SourceDocumentUIPart[] | SourceDocumentUIPart) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const LocalReferencedSourcesContext =
  createContext<ReferencedSourcesContext | null>(null);

export const usePromptInputReferencedSources = () => {
  const ctx = useContext(LocalReferencedSourcesContext);
  if (!ctx) {
    throw new Error(
      "usePromptInputReferencedSources must be used within a LocalReferencedSourcesContext.Provider"
    );
  }
  return ctx;
};

export type PromptInputActionAddAttachmentsProps = ComponentProps<
  typeof DropdownMenuItem
> & {
  label?: string;
};

export const PromptInputActionAddAttachments = ({
  label = "Add photos or files",
  ...props
}: PromptInputActionAddAttachmentsProps) => {
  const attachments = usePromptInputAttachments();

  const handleSelect = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    attachments.openFileDialog();
  };

  return (
    <DropdownMenuItem {...props} onSelect={handleSelect}>
      <ImageIcon className="mr-2 size-4" /> {label}
    </DropdownMenuItem>
  );
};

export type PromptInputActionAddScreenshotProps = ComponentProps<
  typeof DropdownMenuItem
> & {
  label?: string;
};

// The user dismissing the screen-share picker surfaces as one of these
// DOMExceptions; treat it as a silent no-op instead of an error.
const isUserCancelledScreenshotError = (error: unknown): boolean =>
  error instanceof DOMException &&
  (error.name === "NotAllowedError" || error.name === "AbortError");

// Extracted so handleSelect's own branching stays limited to the
// onSelect/defaultPrevented guard.
const attemptScreenshotCapture = async (
  attachments: AttachmentsContext
): Promise<void> => {
  try {
    const screenshot = await captureScreenshot();
    if (screenshot) {
      attachments.add([screenshot]);
    }
  } catch (error) {
    if (isUserCancelledScreenshotError(error)) {
      return;
    }
    throw error;
  }
};

export const PromptInputActionAddScreenshot = ({
  label = "Take screenshot",
  onSelect,
  ...props
}: PromptInputActionAddScreenshotProps) => {
  const attachments = usePromptInputAttachments();

  const handleSelect = async (event: { defaultPrevented: boolean }) => {
    onSelect?.(event as never);
    if (event.defaultPrevented) {
      return;
    }

    await attemptScreenshotCapture(attachments);
  };

  return (
    <DropdownMenuItem {...props} onSelect={handleSelect}>
      <Monitor className="mr-2 size-4" />
      {label}
    </DropdownMenuItem>
  );
};

export interface PromptInputMessage {
  text: string;
  files: FileUIPart[];
}

export type PromptInputProps = Omit<
  HTMLAttributes<HTMLFormElement>,
  "onSubmit" | "onError"
> & {
  // e.g., "image/*" or leave undefined for any
  accept?: string;
  multiple?: boolean;
  // When true, accepts drops anywhere on document. Default false (opt-in).
  globalDrop?: boolean;
  // Render a hidden input with given name and keep it in sync for native form posts. Default false.
  syncHiddenInput?: boolean;
  // Minimal constraints
  maxFiles?: number;
  // bytes
  maxFileSize?: number;
  onError?: (err: {
    code: "max_files" | "max_file_size" | "accept";
    message: string;
  }) => void;
  onSubmit: (
    message: PromptInputMessage,
    event: FormEvent<HTMLFormElement>
  ) => void | Promise<void>;
};

type UseAttachmentsManagerOptions = Pick<
  PromptInputProps,
  "accept" | "maxFiles" | "maxFileSize" | "onError" | "syncHiddenInput"
>;

type AttachmentOnError = UseAttachmentsManagerOptions["onError"];

// Shared by filterByAccept/filterBySize: reports onError once when a
// non-empty input list ends up with nothing surviving the filter.
const reportIfAllFilesRejected = (
  before: File[],
  after: File[],
  onError: AttachmentOnError,
  code: "accept" | "max_file_size",
  message: string
): boolean => {
  if (before.length === 0 || after.length > 0) {
    return false;
  }
  onError?.({ code, message });
  return true;
};

const filterByAccept = (
  incoming: File[],
  matchesAccept: (file: File) => boolean,
  onError: AttachmentOnError
): File[] | null => {
  const accepted = incoming.filter((file) => matchesAccept(file));
  const rejected = reportIfAllFilesRejected(
    incoming,
    accepted,
    onError,
    "accept",
    "No files match the accepted types."
  );
  return rejected ? null : accepted;
};

const filterBySize = (
  accepted: File[],
  maxFileSize: number | undefined,
  onError: AttachmentOnError
): File[] | null => {
  const limit = maxFileSize ?? Number.POSITIVE_INFINITY;
  const sized = accepted.filter((file) => file.size <= limit);
  const rejected = reportIfAllFilesRejected(
    accepted,
    sized,
    onError,
    "max_file_size",
    "All files exceed the maximum size."
  );
  return rejected ? null : sized;
};

// Filters files by accepted mime-type and max size, reporting the first
// violation via onError. Returns null when nothing survives filtering so
// callers can bail out early. Shared by the local and provider add paths.
const filterFilesByAcceptAndSize = (
  incoming: File[],
  matchesAccept: (file: File) => boolean,
  maxFileSize: number | undefined,
  onError: AttachmentOnError
): File[] | null => {
  const accepted = filterByAccept(incoming, matchesAccept, onError);
  if (!accepted) {
    return null;
  }
  return filterBySize(accepted, maxFileSize, onError);
};

const computeCapacity = (
  maxFiles: number | undefined,
  currentCount: number
): number | undefined =>
  typeof maxFiles === "number"
    ? Math.max(0, maxFiles - currentCount)
    : undefined;

// Caps an already-filtered file list to the remaining capacity, reporting
// via onError when some files had to be dropped. Shared by the local and
// provider add paths.
const capFilesToLimit = (
  sized: File[],
  currentCount: number,
  maxFiles: number | undefined,
  onError: AttachmentOnError
): File[] => {
  const capacity = computeCapacity(maxFiles, currentCount);
  if (typeof capacity !== "number") {
    return sized;
  }

  const capped = sized.slice(0, capacity);
  if (sized.length > capacity) {
    onError?.({
      code: "max_files",
      message: "Too many files. Some were not added.",
    });
  }

  return capped;
};

const matchesAcceptPattern = (file: File, pattern: string): boolean => {
  if (pattern.endsWith("/*")) {
    // e.g: image/* -> image/
    const prefix = pattern.slice(0, -1);
    return file.type.startsWith(prefix);
  }
  return file.type === pattern;
};

const fileMatchesAccept = (file: File, accept: string | undefined): boolean => {
  if (!accept || accept.trim() === "") {
    return true;
  }

  const patterns = accept
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return patterns.some((pattern) => matchesAcceptPattern(file, pattern));
};

// Shared by the local and provider add paths: applies the `accept` and
// `maxFileSize` filters to an incoming file list before it's capped to
// the remaining capacity.
const validateIncomingFiles = (
  fileList: File[] | FileList,
  {
    accept,
    maxFileSize,
    onError,
  }: Omit<UseAttachmentsManagerOptions, "maxFiles">
): File[] | null => {
  const incoming = [...fileList];
  const matchesAccept = (file: File) => fileMatchesAccept(file, accept);
  return filterFilesByAcceptAndSize(
    incoming,
    matchesAccept,
    maxFileSize,
    onError
  );
};

// Manages the local (non-provider) attachments list: item state, the hidden
// file input ref, and the local add/remove/clear paths. Always called (even
// when a provider is present) so hook order stays stable across renders;
// useAttachmentsManager decides which path's output to expose.
const useLocalAttachmentsState = ({
  accept,
  maxFiles,
  maxFileSize,
  onError,
}: UseAttachmentsManagerOptions) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<(FileUIPart & { id: string })[]>([]);

  const add = (fileList: File[] | FileList) => {
    const sized = validateIncomingFiles(fileList, {
      accept,
      maxFileSize,
      onError,
    });
    if (!sized) {
      return;
    }

    setItems((prev) => {
      const capped = capFilesToLimit(sized, prev.length, maxFiles, onError);
      return [...prev, ...capped.map(toAttachmentPart)];
    });
  };

  const remove = (id: string) =>
    setItems((prev) => {
      const found = prev.find((file) => file.id === id);
      if (found?.url) {
        URL.revokeObjectURL(found.url);
      }
      return prev.filter((file) => file.id !== id);
    });

  const clear = () =>
    setItems((prev) => {
      for (const file of prev) {
        if (file.url) {
          URL.revokeObjectURL(file.url);
        }
      }
      return [];
    });

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  return { add, clear, inputRef, items, openFileDialog, remove };
};

// Wraps the provider's add() with the same validation the local path uses,
// and registers the hidden file input with the provider so external menus
// can trigger it. Always called, mirroring useLocalAttachmentsState.
const useProviderAttachmentsBridge = (
  controller: PromptInputControllerProps | null,
  inputRef: RefObject<HTMLInputElement | null>,
  { accept, maxFiles, maxFileSize, onError }: UseAttachmentsManagerOptions
) => {
  const usingProvider = !!controller;

  const add = (fileList: File[] | FileList) => {
    const sized = validateIncomingFiles(fileList, {
      accept,
      maxFileSize,
      onError,
    });
    if (!(sized && controller)) {
      return;
    }

    const capped = capFilesToLimit(
      sized,
      controller.attachments.files.length,
      maxFiles,
      onError
    );
    if (capped.length > 0) {
      controller.attachments.add(capped);
    }
  };

  // Let provider know about our hidden file input so external menus can call openFileDialog()
  useEffect(() => {
    if (!(usingProvider && controller)) {
      return;
    }
    controller.__registerFileInput(inputRef, () => inputRef.current?.click());
  }, [usingProvider, controller, inputRef]);

  return add;
};

// Note: File input cannot be programmatically set for security reasons;
// this only clears the native input's stale value once files.length hits 0.
const useSyncHiddenInputReset = (
  inputRef: RefObject<HTMLInputElement | null>,
  files: (FileUIPart & { id: string })[],
  syncHiddenInput: boolean | undefined
) => {
  useEffect(() => {
    if (syncHiddenInput && inputRef.current && files.length === 0) {
      inputRef.current.value = "";
    }
  }, [files, syncHiddenInput, inputRef]);
};

// Revokes any local blob URLs on unmount. A no-op when a provider owns the
// files, since the provider is responsible for its own cleanup.
const useRevokeLocalFilesOnUnmount = (
  usingProvider: boolean,
  files: (FileUIPart & { id: string })[]
) => {
  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(
    () => () => {
      if (usingProvider) {
        return;
      }
      for (const f of filesRef.current) {
        if (f.url) {
          URL.revokeObjectURL(f.url);
        }
      }
    },
    [usingProvider]
  );
};

// Picks the provider-backed or local implementation for every attachments
// operation in one place, so useAttachmentsManager itself doesn't need a
// separate ternary per operation.
const resolveAttachmentsApi = (
  controller: PromptInputControllerProps | null,
  local: ReturnType<typeof useLocalAttachmentsState>,
  addWithProviderValidation: (fileList: File[] | FileList) => void
) => {
  if (controller) {
    return {
      add: addWithProviderValidation,
      clearAttachments: () => controller.attachments.clear(),
      files: controller.attachments.files,
      openFileDialog: controller.attachments.openFileDialog,
      remove: controller.attachments.remove,
    };
  }

  return {
    add: local.add,
    clearAttachments: local.clear,
    files: local.items,
    openFileDialog: local.openFileDialog,
    remove: local.remove,
  };
};

// Encapsulates file-attachment state, validation, and provider/local
// resolution shared by PromptInput. Extracted purely to keep PromptInput
// itself readable; behavior is unchanged.
const useAttachmentsManager = (options: UseAttachmentsManagerOptions) => {
  // Try to use a provider controller if present
  const controller = useOptionalPromptInputController();
  const usingProvider = !!controller;

  const local = useLocalAttachmentsState(options);
  const addWithProviderValidation = useProviderAttachmentsBridge(
    controller,
    local.inputRef,
    options
  );

  const { add, clearAttachments, files, openFileDialog, remove } =
    resolveAttachmentsApi(controller, local, addWithProviderValidation);

  useRevokeLocalFilesOnUnmount(usingProvider, files);
  useSyncHiddenInputReset(local.inputRef, files, options.syncHiddenInput);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (event.currentTarget.files) {
      add(event.currentTarget.files);
    }
    // Reset input value to allow selecting files that were previously removed
    event.currentTarget.value = "";
  };

  return {
    add,
    clearAttachments,
    controller,
    files,
    handleChange,
    inputRef: local.inputRef,
    openFileDialog,
    remove,
    usingProvider,
  };
};

const onFileDragOver = (e: DragEvent) => {
  if (e.dataTransfer?.types?.includes("Files")) {
    e.preventDefault();
  }
};

const hasDroppedFiles = (e: DragEvent): boolean =>
  !!e.dataTransfer?.files && e.dataTransfer.files.length > 0;

// Builds the dragover/drop handler pair shared by both the form-scoped and
// document-scoped listeners below — same behavior, different target element.
const createFileDropHandlers = (add: (fileList: File[] | FileList) => void) => {
  const onDrop = (e: DragEvent) => {
    onFileDragOver(e);
    if (hasDroppedFiles(e)) {
      add((e.dataTransfer as DataTransfer).files);
    }
  };
  return { onDragOver: onFileDragOver, onDrop };
};

// Attach drop handlers on the nearest form and/or the document (opt-in via
// globalDrop). Extracted purely to keep PromptInput readable.
const useDragAndDropFiles = ({
  formRef,
  globalDrop,
  add,
}: {
  formRef: RefObject<HTMLFormElement | null>;
  globalDrop?: boolean;
  add: (fileList: File[] | FileList) => void;
}) => {
  useEffect(() => {
    const form = formRef.current;
    if (!form) {
      return;
    }
    if (globalDrop) {
      // when global drop is on, let the document-level handler own drops
      return;
    }

    const { onDragOver, onDrop } = createFileDropHandlers(add);
    form.addEventListener("dragover", onDragOver);
    form.addEventListener("drop", onDrop);
    return () => {
      form.removeEventListener("dragover", onDragOver);
      form.removeEventListener("drop", onDrop);
    };
  }, [add, globalDrop, formRef]);

  useEffect(() => {
    if (!globalDrop) {
      return;
    }

    const { onDragOver, onDrop } = createFileDropHandlers(add);
    document.addEventListener("dragover", onDragOver);
    document.addEventListener("drop", onDrop);
    return () => {
      document.removeEventListener("dragover", onDragOver);
      document.removeEventListener("drop", onDrop);
    };
  }, [add, globalDrop]);
};

// Reads the submitted text from the lifted controller when present, or
// falls back to the native form's FormData. Extracted so handleSubmit's
// own branching stays limited to the async result handling below.
const getSubmittedText = (
  form: HTMLFormElement,
  controller: PromptInputControllerProps | null
): string => {
  if (controller) {
    return controller.textInput.value;
  }
  const formData = new FormData(form);
  return (formData.get("message") as string) || "";
};

// Converts a single attachment's blob: URL to a data: URL, keeping the
// original URL if conversion fails. Extracted out of the files.map callback
// in handleSubmit.
const convertAttachmentToDataUrl = async (
  item: FileUIPart
): Promise<FileUIPart> => {
  if (!item.url?.startsWith("blob:")) {
    return item;
  }
  const dataUrl = await convertBlobUrlToDataUrl(item.url);
  return { ...item, url: dataUrl ?? item.url };
};

// Clears both the attachments/sources and (when lifted) the controller's
// text input. Shared by submitConvertedMessage's sync and async completion
// paths.
const finalizeSubmission = (
  controller: PromptInputControllerProps | null,
  clear: () => void
) => {
  clear();
  controller?.textInput.clear();
};

// Calls onSubmit with the already-converted message and finalizes the form
// once it settles, whether it returns synchronously or a Promise. Extracted
// out of handleSubmit so its own try/catch stays limited to file conversion.
const submitConvertedMessage = async (
  onSubmit: PromptInputProps["onSubmit"],
  message: PromptInputMessage,
  event: FormEvent<HTMLFormElement>,
  controller: PromptInputControllerProps | null,
  clear: () => void
): Promise<void> => {
  const result = onSubmit(message, event);

  if (!(result instanceof Promise)) {
    finalizeSubmission(controller, clear);
    return;
  }

  try {
    await result;
    finalizeSubmission(controller, clear);
  } catch {
    // Don't clear on error - user may want to retry
  }
};

export const PromptInput = ({
  className,
  accept,
  multiple,
  globalDrop,
  syncHiddenInput,
  maxFiles,
  maxFileSize,
  onError,
  onSubmit,
  children,
  ...props
}: PromptInputProps) => {
  const formRef = useRef<HTMLFormElement | null>(null);

  // ----- Local referenced sources (always local to PromptInput)
  const [referencedSources, setReferencedSources] = useState<
    (SourceDocumentUIPart & { id: string })[]
  >([]);

  const {
    add,
    clearAttachments,
    controller,
    files,
    handleChange,
    inputRef,
    openFileDialog,
    remove,
    usingProvider,
  } = useAttachmentsManager({
    accept,
    maxFiles,
    maxFileSize,
    onError,
    syncHiddenInput,
  });

  useDragAndDropFiles({ add, formRef, globalDrop });

  const clearReferencedSources = () => setReferencedSources([]);

  const clear = () => {
    clearAttachments();
    clearReferencedSources();
  };

  const attachmentsCtx: AttachmentsContext = {
    add,
    clear: clearAttachments,
    fileInputRef: inputRef,
    files: files.map((item) => ({ ...item, id: item.id })),
    openFileDialog,
    remove,
  };

  const refsCtx: ReferencedSourcesContext = {
    add: (incoming: SourceDocumentUIPart[] | SourceDocumentUIPart) => {
      const array = Array.isArray(incoming) ? incoming : [incoming];
      setReferencedSources((prev) => [
        ...prev,
        ...array.map((s) => ({ ...s, id: nanoid() })),
      ]);
    },
    clear: clearReferencedSources,
    remove: (id: string) => {
      setReferencedSources((prev) => prev.filter((s) => s.id !== id));
    },
    sources: referencedSources,
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const text = getSubmittedText(form, controller);

    // Reset form immediately after capturing text to avoid race condition
    // where user input during async blob conversion would be lost
    if (!usingProvider) {
      form.reset();
    }

    try {
      // Convert blob URLs to data URLs asynchronously
      const convertedFiles: FileUIPart[] = await Promise.all(
        files.map(({ id: _id, ...item }) => convertAttachmentToDataUrl(item))
      );

      await submitConvertedMessage(
        onSubmit,
        { files: convertedFiles, text },
        event,
        controller,
        clear
      );
    } catch {
      // Don't clear on error - user may want to retry
    }
  };

  // Render with or without local provider
  const inner = (
    <>
      <input
        accept={accept}
        aria-label="Upload files"
        className="hidden"
        multiple={multiple}
        onChange={handleChange}
        ref={inputRef}
        title="Upload files"
        type="file"
      />
      <form
        className={cn("w-full", className)}
        onSubmit={handleSubmit}
        ref={formRef}
        {...props}
      >
        <InputGroup className="overflow-hidden">{children}</InputGroup>
      </form>
    </>
  );

  const withReferencedSources = (
    // oxlint-disable-next-line react/jsx-no-constructed-context-values -- handled by React Compiler
    <LocalReferencedSourcesContext.Provider value={refsCtx}>
      {inner}
    </LocalReferencedSourcesContext.Provider>
  );

  // Always provide LocalAttachmentsContext so children get validated add function
  return (
    // oxlint-disable-next-line react/jsx-no-constructed-context-values -- handled by React Compiler
    <LocalAttachmentsContext.Provider value={attachmentsCtx}>
      {withReferencedSources}
    </LocalAttachmentsContext.Provider>
  );
};

export type PromptInputBodyProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputBody = ({
  className,
  ...props
}: PromptInputBodyProps) => (
  <div className={cn("contents", className)} {...props} />
);

const shouldIgnoreEnterKey = (
  e: KeyboardEvent<HTMLTextAreaElement>,
  isComposingRef: RefObject<boolean>
): boolean =>
  e.key !== "Enter" ||
  isComposingRef.current ||
  e.nativeEvent.isComposing ||
  e.shiftKey;

const isSubmitButtonDisabled = (form: HTMLFormElement | null): boolean => {
  const submitButton = form?.querySelector(
    'button[type="submit"]'
  ) as HTMLButtonElement | null;
  return submitButton?.disabled ?? false;
};

const submitOnEnter = (
  e: KeyboardEvent<HTMLTextAreaElement>,
  isComposingRef: RefObject<boolean>
) => {
  if (shouldIgnoreEnterKey(e, isComposingRef)) {
    return;
  }

  e.preventDefault();

  // Check if the submit button is disabled before submitting
  const { form } = e.currentTarget;
  if (isSubmitButtonDisabled(form)) {
    return;
  }

  form?.requestSubmit();
};

const shouldSkipBackspaceRemoval = (
  e: KeyboardEvent<HTMLTextAreaElement>,
  attachments: AttachmentsContext
): boolean =>
  e.key !== "Backspace" ||
  e.currentTarget.value !== "" ||
  attachments.files.length === 0;

const removeLastAttachmentOnBackspace = (
  e: KeyboardEvent<HTMLTextAreaElement>,
  attachments: AttachmentsContext
) => {
  if (shouldSkipBackspaceRemoval(e, attachments)) {
    return;
  }

  e.preventDefault();
  const lastAttachment = attachments.files.at(-1);
  if (lastAttachment) {
    attachments.remove(lastAttachment.id);
  }
};

// Extracted so handlePaste's own branching stays limited to the
// items-present/files-present guards.
const extractFilesFromClipboard = (items: DataTransferItemList): File[] => {
  const files: File[] = [];

  for (const item of items) {
    if (item.kind !== "file") {
      continue;
    }
    const file = item.getAsFile();
    if (file) {
      files.push(file);
    }
  }

  return files;
};

export type PromptInputTextareaProps = ComponentProps<
  typeof InputGroupTextarea
>;

export const PromptInputTextarea = ({
  onChange,
  onKeyDown,
  className,
  placeholder = "What would you like to know?",
  ...props
}: PromptInputTextareaProps) => {
  const controller = useOptionalPromptInputController();
  const attachments = usePromptInputAttachments();
  // Not rendered anywhere, so a ref avoids triggering a re-render on every
  // composition start/end.
  const isComposingRef = useRef(false);

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    // Call the external onKeyDown handler first
    onKeyDown?.(e);

    // If the external handler prevented default, don't run internal logic
    if (e.defaultPrevented) {
      return;
    }

    submitOnEnter(e, isComposingRef);
    removeLastAttachmentOnBackspace(e, attachments);
  };

  const handlePaste: ClipboardEventHandler<HTMLTextAreaElement> = (event) => {
    const items = event.clipboardData?.items;
    if (!items) {
      return;
    }

    const files = extractFilesFromClipboard(items);
    if (files.length > 0) {
      event.preventDefault();
      attachments.add(files);
    }
  };

  const handleCompositionEnd = () => {
    isComposingRef.current = false;
  };
  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const controlledProps = controller
    ? {
        onChange: (e: ChangeEvent<HTMLTextAreaElement>) => {
          controller.textInput.setInput(e.currentTarget.value);
          onChange?.(e);
        },
        value: controller.textInput.value,
      }
    : {
        onChange,
      };

  return (
    <InputGroupTextarea
      className={cn("field-sizing-content max-h-48 min-h-16", className)}
      name="message"
      onCompositionEnd={handleCompositionEnd}
      onCompositionStart={handleCompositionStart}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      placeholder={placeholder}
      {...props}
      {...controlledProps}
    />
  );
};

export type PromptInputHeaderProps = Omit<
  ComponentProps<typeof InputGroupAddon>,
  "align"
>;

export const PromptInputHeader = ({
  className,
  ...props
}: PromptInputHeaderProps) => (
  <InputGroupAddon
    align="block-end"
    className={cn("order-first flex-wrap gap-1", className)}
    {...props}
  />
);

export type PromptInputFooterProps = Omit<
  ComponentProps<typeof InputGroupAddon>,
  "align"
>;

export const PromptInputFooter = ({
  className,
  ...props
}: PromptInputFooterProps) => (
  <InputGroupAddon
    align="block-end"
    className={cn("justify-between gap-1", className)}
    {...props}
  />
);

export type PromptInputToolsProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTools = ({
  className,
  ...props
}: PromptInputToolsProps) => (
  <div
    className={cn("flex min-w-0 items-center gap-1", className)}
    {...props}
  />
);

export type PromptInputButtonTooltip =
  | string
  | {
      content: ReactNode;
      shortcut?: string;
      side?: ComponentProps<typeof TooltipContent>["side"];
    };

export type PromptInputButtonProps = ComponentProps<typeof InputGroupButton> & {
  tooltip?: PromptInputButtonTooltip;
};

const countChildren = (children: ReactNode): number => {
  if (Array.isArray(children)) {
    return children.length;
  }
  return children === null || children === undefined ? 0 : 1;
};

const resolveButtonTooltip = (tooltip: PromptInputButtonTooltip) => {
  if (typeof tooltip === "string") {
    return { content: tooltip, shortcut: undefined, side: "top" as const };
  }

  return {
    content: tooltip.content,
    shortcut: tooltip.shortcut,
    side: tooltip.side ?? "top",
  };
};

const resolveButtonSize = (
  size: PromptInputButtonProps["size"],
  children: ReactNode
): PromptInputButtonProps["size"] =>
  size ?? (countChildren(children) > 1 ? "sm" : "icon-sm");

export const PromptInputButton = ({
  variant = "ghost",
  className,
  size,
  tooltip,
  ...props
}: PromptInputButtonProps) => {
  const newSize = resolveButtonSize(size, props.children);

  const button = (
    <InputGroupButton
      className={cn(className)}
      size={newSize}
      type="button"
      variant={variant}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  const { content, shortcut, side } = resolveButtonTooltip(tooltip);

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent side={side}>
        {content}
        {shortcut && (
          <span className="ml-2 text-muted-foreground">{shortcut}</span>
        )}
      </TooltipContent>
    </Tooltip>
  );
};

export type PromptInputActionMenuProps = ComponentProps<typeof DropdownMenu>;
export const PromptInputActionMenu = (props: PromptInputActionMenuProps) => (
  <DropdownMenu {...props} />
);

export type PromptInputActionMenuTriggerProps = PromptInputButtonProps;

export const PromptInputActionMenuTrigger = ({
  className,
  children,
  ...props
}: PromptInputActionMenuTriggerProps) => (
  <DropdownMenuTrigger
    render={<PromptInputButton className={className} {...props} />}
  >
    {children ?? <PlusIcon className="size-4" />}
  </DropdownMenuTrigger>
);

export type PromptInputActionMenuContentProps = ComponentProps<
  typeof DropdownMenuContent
>;
export const PromptInputActionMenuContent = ({
  className,
  ...props
}: PromptInputActionMenuContentProps) => (
  <DropdownMenuContent align="start" className={cn(className)} {...props} />
);

export type PromptInputActionMenuItemProps = ComponentProps<
  typeof DropdownMenuItem
>;
export const PromptInputActionMenuItem = ({
  className,
  ...props
}: PromptInputActionMenuItemProps) => (
  <DropdownMenuItem className={cn(className)} {...props} />
);

// Note: Actions that perform side-effects (like opening a file dialog)
// are provided in opt-in modules (e.g., prompt-input-attachments).

export type PromptInputSubmitProps = ComponentProps<typeof InputGroupButton> & {
  status?: ChatStatus;
  onStop?: () => void;
};

const getSubmitIcon = (status: ChatStatus | undefined) => {
  switch (status) {
    case "submitted": {
      return <Spinner />;
    }
    case "streaming": {
      return <SquareIcon className="size-4" />;
    }
    case "error": {
      return <XIcon className="size-4" />;
    }
    default: {
      return <CornerDownLeftIcon className="size-4" />;
    }
  }
};

const isSubmitGenerating = (status: ChatStatus | undefined): boolean =>
  status === "submitted" || status === "streaming";

// Extracted so PromptInputSubmit's own body stays a plain sequence of
// derived-value assignments instead of inlining this branch.
const createSubmitClickHandler =
  (
    isGenerating: boolean,
    onStop: (() => void) | undefined,
    onClick: PromptInputSubmitProps["onClick"]
  ) =>
  (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isGenerating && onStop) {
      e.preventDefault();
      onStop();
      return;
    }
    onClick?.(e as never);
  };

const getSubmitAriaLabel = (isGenerating: boolean): string =>
  isGenerating ? "Stop" : "Submit";

const getSubmitButtonType = (
  isGenerating: boolean,
  onStop: (() => void) | undefined
): "button" | "submit" => (isGenerating && onStop ? "button" : "submit");

export const PromptInputSubmit = ({
  className,
  variant = "default",
  size = "icon-sm",
  status,
  onStop,
  onClick,
  children,
  ...props
}: PromptInputSubmitProps) => {
  const isGenerating = isSubmitGenerating(status);
  const Icon = getSubmitIcon(status);
  const handleClick = createSubmitClickHandler(isGenerating, onStop, onClick);

  return (
    <InputGroupButton
      aria-label={getSubmitAriaLabel(isGenerating)}
      className={cn(className)}
      onClick={handleClick}
      size={size}
      type={getSubmitButtonType(isGenerating, onStop)}
      variant={variant}
      {...props}
    >
      {children ?? Icon}
    </InputGroupButton>
  );
};

export type PromptInputSelectProps = ComponentProps<typeof Select>;

export const PromptInputSelect = (props: PromptInputSelectProps) => (
  <Select {...props} />
);

export type PromptInputSelectTriggerProps = ComponentProps<
  typeof SelectTrigger
>;

export const PromptInputSelectTrigger = ({
  className,
  ...props
}: PromptInputSelectTriggerProps) => (
  <SelectTrigger
    className={cn(
      "border-none bg-transparent font-medium text-muted-foreground shadow-none transition-colors",
      "hover:bg-accent hover:text-foreground aria-expanded:bg-accent aria-expanded:text-foreground",
      className
    )}
    {...props}
  />
);

export type PromptInputSelectContentProps = ComponentProps<
  typeof SelectContent
>;

export const PromptInputSelectContent = ({
  className,
  ...props
}: PromptInputSelectContentProps) => (
  <SelectContent className={cn(className)} {...props} />
);

export type PromptInputSelectItemProps = ComponentProps<typeof SelectItem>;

export const PromptInputSelectItem = ({
  className,
  ...props
}: PromptInputSelectItemProps) => (
  <SelectItem className={cn(className)} {...props} />
);

export type PromptInputSelectValueProps = ComponentProps<typeof SelectValue>;

export const PromptInputSelectValue = ({
  className,
  ...props
}: PromptInputSelectValueProps) => (
  <SelectValue className={cn(className)} {...props} />
);

export type PromptInputHoverCardProps = ComponentProps<typeof HoverCard>;

export const PromptInputHoverCard = (props: PromptInputHoverCardProps) => (
  <HoverCard {...props} />
);

export type PromptInputHoverCardTriggerProps = ComponentProps<
  typeof HoverCardTrigger
>;

export const PromptInputHoverCardTrigger = (
  props: PromptInputHoverCardTriggerProps
) => <HoverCardTrigger {...props} />;

export type PromptInputHoverCardContentProps = ComponentProps<
  typeof HoverCardContent
>;

export const PromptInputHoverCardContent = ({
  align = "start",
  ...props
}: PromptInputHoverCardContentProps) => (
  <HoverCardContent align={align} {...props} />
);

export type PromptInputTabsListProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTabsList = ({
  className,
  ...props
}: PromptInputTabsListProps) => <div className={cn(className)} {...props} />;

export type PromptInputTabProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTab = ({
  className,
  ...props
}: PromptInputTabProps) => <div className={cn(className)} {...props} />;

export type PromptInputTabLabelProps = HTMLAttributes<HTMLHeadingElement>;

export const PromptInputTabLabel = ({
  className,
  ...props
}: PromptInputTabLabelProps) => (
  // Content provided via children in props
  // oxlint-disable-next-line jsx-a11y/heading-has-content
  <h3
    className={cn(
      "mb-2 px-3 font-medium text-muted-foreground text-xs",
      className
    )}
    {...props}
  />
);

export type PromptInputTabBodyProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTabBody = ({
  className,
  ...props
}: PromptInputTabBodyProps) => (
  <div className={cn("space-y-1", className)} {...props} />
);

export type PromptInputTabItemProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTabItem = ({
  className,
  ...props
}: PromptInputTabItemProps) => (
  <div
    className={cn(
      "flex items-center gap-2 px-3 py-2 text-xs hover:bg-accent",
      className
    )}
    {...props}
  />
);

export type PromptInputCommandProps = ComponentProps<typeof Command>;

export const PromptInputCommand = ({
  className,
  ...props
}: PromptInputCommandProps) => <Command className={cn(className)} {...props} />;

export type PromptInputCommandInputProps = ComponentProps<typeof CommandInput>;

export const PromptInputCommandInput = ({
  className,
  ...props
}: PromptInputCommandInputProps) => (
  <CommandInput className={cn(className)} {...props} />
);

export type PromptInputCommandListProps = ComponentProps<typeof CommandList>;

export const PromptInputCommandList = ({
  className,
  ...props
}: PromptInputCommandListProps) => (
  <CommandList className={cn(className)} {...props} />
);

export type PromptInputCommandEmptyProps = ComponentProps<typeof CommandEmpty>;

export const PromptInputCommandEmpty = ({
  className,
  ...props
}: PromptInputCommandEmptyProps) => (
  <CommandEmpty className={cn(className)} {...props} />
);

export type PromptInputCommandGroupProps = ComponentProps<typeof CommandGroup>;

export const PromptInputCommandGroup = ({
  className,
  ...props
}: PromptInputCommandGroupProps) => (
  <CommandGroup className={cn(className)} {...props} />
);

export type PromptInputCommandItemProps = ComponentProps<typeof CommandItem>;

export const PromptInputCommandItem = ({
  className,
  ...props
}: PromptInputCommandItemProps) => (
  <CommandItem className={cn(className)} {...props} />
);

export type PromptInputCommandSeparatorProps = ComponentProps<
  typeof CommandSeparator
>;

export const PromptInputCommandSeparator = ({
  className,
  ...props
}: PromptInputCommandSeparatorProps) => (
  <CommandSeparator className={cn(className)} {...props} />
);
