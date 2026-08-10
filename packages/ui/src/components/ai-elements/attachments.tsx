"use client";

import { IconEarth } from "@cs/icons/earth";
import { IconImage } from "@cs/icons/image";
import { IconVideo } from "@cs/icons/video";
import { IconX } from "@cs/icons/x";
import type { FileUIPart, SourceDocumentUIPart } from "ai";
import { FileTextIcon, Music2Icon, PaperclipIcon } from "lucide-react";
import type {
  ComponentProps,
  ComponentType,
  HTMLAttributes,
  ReactNode,
} from "react";
import { createContext, useContext } from "react";

import { Button } from "#components/shadcn/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "#components/shadcn/hover-card";
import { cn } from "#lib/utils";

// ============================================================================
// Types
// ============================================================================

export type AttachmentData =
  | (FileUIPart & { id: string })
  | (SourceDocumentUIPart & { id: string });

export type AttachmentMediaCategory =
  | "image"
  | "video"
  | "audio"
  | "document"
  | "source"
  | "unknown";

export type AttachmentVariant = "grid" | "inline" | "list";

const mediaCategoryIcons: Record<
  AttachmentMediaCategory,
  ComponentType<{ className?: string }>
> = {
  audio: Music2Icon,
  document: FileTextIcon,
  image: IconImage,
  source: IconEarth,
  unknown: PaperclipIcon,
  video: IconVideo,
};

// ============================================================================
// Utility Functions
// ============================================================================

const mediaTypePrefixCategories: [
  prefix: string,
  category: AttachmentMediaCategory,
][] = [
  ["image/", "image"],
  ["video/", "video"],
  ["audio/", "audio"],
  ["application/", "document"],
  ["text/", "document"],
];

const resolveCategoryFromMediaType = (
  mediaType: string
): AttachmentMediaCategory => {
  const match = mediaTypePrefixCategories.find(([prefix]) =>
    mediaType.startsWith(prefix)
  );
  return match?.[1] ?? "unknown";
};

export const getMediaCategory = (
  data: AttachmentData
): AttachmentMediaCategory => {
  if (data.type === "source-document") {
    return "source";
  }

  return resolveCategoryFromMediaType(data.mediaType ?? "");
};

const getSourceDocumentLabel = (
  data: Extract<AttachmentData, { type: "source-document" }>
) => data.title || data.filename || "Source";

export const getAttachmentLabel = (data: AttachmentData): string => {
  if (data.type === "source-document") {
    return getSourceDocumentLabel(data);
  }

  if (data.filename) {
    return data.filename;
  }

  return getMediaCategory(data) === "image" ? "Image" : "Attachment";
};

const renderAttachmentImage = (
  url: string,
  filename: string | undefined,
  isGrid: boolean
) =>
  isGrid ? (
    // oxlint-disable-next-line next/no-img-element, react-doctor/nextjs-no-img-element -- arbitrary caller-supplied blob/data/remote URL, not a next/image-optimizable asset
    <img
      alt={filename || "Image"}
      className="size-full object-cover"
      height={96}
      src={url}
      width={96}
    />
  ) : (
    // oxlint-disable-next-line next/no-img-element, react-doctor/nextjs-no-img-element -- arbitrary caller-supplied blob/data/remote URL, not a next/image-optimizable asset
    <img
      alt={filename || "Image"}
      className="size-full rounded object-cover"
      height={20}
      src={url}
      width={20}
    />
  );

// ============================================================================
// Contexts
// ============================================================================

interface AttachmentsContextValue {
  variant: AttachmentVariant;
}

const AttachmentsContext = createContext<AttachmentsContextValue | null>(null);

interface AttachmentContextValue {
  data: AttachmentData;
  mediaCategory: AttachmentMediaCategory;
  onRemove?: () => void;
  variant: AttachmentVariant;
}

const AttachmentContext = createContext<AttachmentContextValue | null>(null);

// ============================================================================
// Hooks
// ============================================================================

export const useAttachmentsContext = () =>
  useContext(AttachmentsContext) ?? { variant: "grid" as const };

export const useAttachmentContext = () => {
  const ctx = useContext(AttachmentContext);
  if (!ctx) {
    throw new Error("Attachment components must be used within <Attachment>");
  }
  return ctx;
};

// ============================================================================
// Attachments - Container
// ============================================================================

export type AttachmentsProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AttachmentVariant;
};

export const Attachments = ({
  variant = "grid",
  className,
  children,
  ...props
}: AttachmentsProps) => {
  const contextValue = { variant };

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values -- handled by React Compiler
    <AttachmentsContext.Provider value={contextValue}>
      <div
        className={cn(
          "flex items-start",
          variant === "list" ? "flex-col gap-2" : "flex-wrap gap-2",
          variant === "grid" && "ml-auto w-fit",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AttachmentsContext.Provider>
  );
};

// ============================================================================
// Attachment - Item
// ============================================================================

export type AttachmentProps = HTMLAttributes<HTMLDivElement> & {
  data: AttachmentData;
  onRemove?: () => void;
};

export const Attachment = ({
  data,
  onRemove,
  className,
  children,
  ...props
}: AttachmentProps) => {
  const { variant } = useAttachmentsContext();
  const mediaCategory = getMediaCategory(data);

  const contextValue: AttachmentContextValue = {
    data,
    mediaCategory,
    onRemove,
    variant,
  };

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values -- handled by React Compiler
    <AttachmentContext.Provider value={contextValue}>
      <div
        className={cn(
          "group relative",
          variant === "grid" && "size-24 overflow-hidden rounded-lg",
          variant === "inline" && [
            "flex h-8 cursor-pointer items-center gap-1.5 select-none",
            "border-border rounded-md border px-1.5",
            "text-sm font-medium transition-all",
            "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
          ],
          variant === "list" && [
            "flex w-full items-center gap-3 rounded-lg border p-3",
            "hover:bg-accent/50",
          ],
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AttachmentContext.Provider>
  );
};

// ============================================================================
// AttachmentPreview - Media preview
// ============================================================================

export type AttachmentPreviewProps = HTMLAttributes<HTMLDivElement> & {
  fallbackIcon?: ReactNode;
};

type FileAttachmentData = Extract<AttachmentData, { type: "file" }>;

const asFileAttachment = (data: AttachmentData): FileAttachmentData | null =>
  data.type === "file" ? data : null;

interface AttachmentPreviewFallbackProps {
  mediaCategory: AttachmentMediaCategory;
  variant: AttachmentVariant;
  fallbackIcon?: ReactNode;
}

const AttachmentPreviewFallback = ({
  mediaCategory,
  variant,
  fallbackIcon,
}: AttachmentPreviewFallbackProps) => {
  const Icon = mediaCategoryIcons[mediaCategory];
  const iconSize = variant === "inline" ? "size-3" : "size-4";

  return (
    fallbackIcon ?? <Icon className={cn(iconSize, "text-muted-foreground")} />
  );
};

interface AttachmentPreviewContentProps {
  data: AttachmentData;
  mediaCategory: AttachmentMediaCategory;
  variant: AttachmentVariant;
  fallbackIcon?: ReactNode;
}

const isDisplayableMediaCategory = (
  mediaCategory: AttachmentMediaCategory
): mediaCategory is "image" | "video" =>
  mediaCategory === "image" || mediaCategory === "video";

const mediaContentRenderers: Record<
  "image" | "video",
  (
    url: string,
    filename: string | undefined,
    variant: AttachmentVariant
  ) => ReactNode
> = {
  image: (url, filename, variant) =>
    renderAttachmentImage(url, filename, variant === "grid"),
  video: (url) => <video className="size-full object-cover" muted src={url} />,
};

const AttachmentPreviewContent = ({
  data,
  mediaCategory,
  variant,
  fallbackIcon,
}: AttachmentPreviewContentProps) => {
  const fileData = asFileAttachment(data);

  if (fileData?.url && isDisplayableMediaCategory(mediaCategory)) {
    return mediaContentRenderers[mediaCategory](
      fileData.url,
      fileData.filename,
      variant
    );
  }

  return (
    <AttachmentPreviewFallback
      fallbackIcon={fallbackIcon}
      mediaCategory={mediaCategory}
      variant={variant}
    />
  );
};

const previewVariantClasses: Record<AttachmentVariant, string> = {
  grid: "size-full bg-muted",
  inline: "size-5 rounded bg-background",
  list: "size-12 rounded bg-muted",
};

export const AttachmentPreview = ({
  fallbackIcon,
  className,
  ...props
}: AttachmentPreviewProps) => {
  const { data, mediaCategory, variant } = useAttachmentContext();

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden",
        previewVariantClasses[variant],
        className
      )}
      {...props}
    >
      <AttachmentPreviewContent
        data={data}
        fallbackIcon={fallbackIcon}
        mediaCategory={mediaCategory}
        variant={variant}
      />
    </div>
  );
};

// ============================================================================
// AttachmentInfo - Name and type display
// ============================================================================

export type AttachmentInfoProps = HTMLAttributes<HTMLDivElement> & {
  showMediaType?: boolean;
};

export const AttachmentInfo = ({
  showMediaType = false,
  className,
  ...props
}: AttachmentInfoProps) => {
  const { data, variant } = useAttachmentContext();
  const label = getAttachmentLabel(data);

  if (variant === "grid") {
    return null;
  }

  return (
    <div className={cn("min-w-0 flex-1", className)} {...props}>
      <span className="block truncate">{label}</span>
      {showMediaType && data.mediaType && (
        <span className="text-muted-foreground block truncate text-xs">
          {data.mediaType}
        </span>
      )}
    </div>
  );
};

// ============================================================================
// AttachmentRemove - Remove button
// ============================================================================

export type AttachmentRemoveProps = ComponentProps<typeof Button> & {
  label?: string;
};

const removeButtonVariantClasses: Record<AttachmentVariant, string> = {
  grid: cn(
    "absolute top-2 right-2 size-6 rounded-full p-0",
    "bg-background/80 backdrop-blur-sm",
    "opacity-0 transition-opacity group-hover:opacity-100",
    "hover:bg-background",
    "[&>svg]:size-3"
  ),
  inline: cn(
    "size-5 rounded p-0",
    "opacity-0 transition-opacity group-hover:opacity-100",
    "[&>svg]:size-2.5"
  ),
  list: cn("size-8 shrink-0 rounded p-0", "[&>svg]:size-4"),
};

export const AttachmentRemove = ({
  label = "Remove",
  className,
  children,
  ...props
}: AttachmentRemoveProps) => {
  const { onRemove, variant } = useAttachmentContext();

  if (!onRemove) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  };

  return (
    <Button
      aria-label={label}
      className={cn(removeButtonVariantClasses[variant], className)}
      onClick={handleClick}
      type="button"
      variant="ghost"
      {...props}
    >
      {children ?? <IconX />}
      <span className="sr-only">{label}</span>
    </Button>
  );
};

// ============================================================================
// AttachmentHoverCard - Hover preview
// ============================================================================

export type AttachmentHoverCardProps = ComponentProps<typeof HoverCard>;

export const AttachmentHoverCard = (props: AttachmentHoverCardProps) => (
  <HoverCard {...props} />
);

export type AttachmentHoverCardTriggerProps = ComponentProps<
  typeof HoverCardTrigger
>;

export const AttachmentHoverCardTrigger = (
  props: AttachmentHoverCardTriggerProps
) => <HoverCardTrigger {...props} />;

export type AttachmentHoverCardContentProps = ComponentProps<
  typeof HoverCardContent
>;

export const AttachmentHoverCardContent = ({
  align = "start",
  className,
  ...props
}: AttachmentHoverCardContentProps) => (
  <HoverCardContent
    align={align}
    className={cn("w-auto p-2", className)}
    {...props}
  />
);

// ============================================================================
// AttachmentEmpty - Empty state
// ============================================================================

export type AttachmentEmptyProps = HTMLAttributes<HTMLDivElement>;

export const AttachmentEmpty = ({
  className,
  children,
  ...props
}: AttachmentEmptyProps) => (
  <div
    className={cn(
      "text-muted-foreground flex items-center justify-center p-4 text-sm",
      className
    )}
    {...props}
  >
    {children ?? "No attachments"}
  </div>
);
