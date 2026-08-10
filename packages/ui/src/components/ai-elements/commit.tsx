"use client";

import { IconCheck } from "@cs/icons/check";
import { IconCopy } from "@cs/icons/copy";
import { IconFile } from "@cs/icons/file";
import { IconMinus } from "@cs/icons/minus";
import { IconPlus } from "@cs/icons/plus";
import { GitCommitIcon } from "lucide-react";
import type { ComponentProps, HTMLAttributes } from "react";

import { Avatar, AvatarFallback } from "#components/shadcn/avatar";
import { Button } from "#components/shadcn/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#components/shadcn/collapsible";
import { useCopyToClipboard } from "#hooks/use-copy-to-clipboard";
import { cn } from "#lib/utils";

export type CommitProps = ComponentProps<typeof Collapsible>;

export const Commit = ({ className, children, ...props }: CommitProps) => (
  <Collapsible
    className={cn("bg-background rounded-lg border", className)}
    {...props}
  >
    {children}
  </Collapsible>
);

export type CommitHeaderProps = ComponentProps<typeof CollapsibleTrigger>;

export const CommitHeader = ({
  className,
  children,
  ...props
}: CommitHeaderProps) => (
  <CollapsibleTrigger
    render={
      // oxlint-disable-next-line jsx-a11y/control-has-associated-label -- generic passthrough render-prop; accessible text comes from `children` below, merged into this button by CollapsibleTrigger's render prop
      <button
        className={cn(
          "group flex cursor-pointer items-center justify-between gap-4 p-3 text-left transition-colors hover:opacity-80",
          className
        )}
        type="button"
      />
    }
    {...props}
  >
    {children}
  </CollapsibleTrigger>
);

export type CommitHashProps = HTMLAttributes<HTMLSpanElement>;

export const CommitHash = ({
  className,
  children,
  ...props
}: CommitHashProps) => (
  <span className={cn("font-mono text-xs", className)} {...props}>
    <GitCommitIcon className="mr-1 inline-block size-3" />
    {children}
  </span>
);

export type CommitMessageProps = HTMLAttributes<HTMLSpanElement>;

export const CommitMessage = ({
  className,
  children,
  ...props
}: CommitMessageProps) => (
  <span className={cn("text-sm font-medium", className)} {...props}>
    {children}
  </span>
);

export type CommitMetadataProps = HTMLAttributes<HTMLDivElement>;

export const CommitMetadata = ({
  className,
  children,
  ...props
}: CommitMetadataProps) => (
  <div
    className={cn(
      "text-muted-foreground flex items-center gap-2 text-xs",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export type CommitSeparatorProps = HTMLAttributes<HTMLSpanElement>;

export const CommitSeparator = ({
  className,
  children,
  ...props
}: CommitSeparatorProps) => (
  <span className={className} {...props}>
    {children ?? "•"}
  </span>
);

export type CommitInfoProps = HTMLAttributes<HTMLDivElement>;

export const CommitInfo = ({
  className,
  children,
  ...props
}: CommitInfoProps) => (
  <div className={cn("flex flex-1 flex-col", className)} {...props}>
    {children}
  </div>
);

export type CommitAuthorProps = HTMLAttributes<HTMLDivElement>;

export const CommitAuthor = ({
  className,
  children,
  ...props
}: CommitAuthorProps) => (
  <div className={cn("flex items-center", className)} {...props}>
    {children}
  </div>
);

export type CommitAuthorAvatarProps = ComponentProps<typeof Avatar> & {
  initials: string;
};

export const CommitAuthorAvatar = ({
  initials,
  className,
  ...props
}: CommitAuthorAvatarProps) => (
  <Avatar className={cn("size-8", className)} {...props}>
    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
  </Avatar>
);

export type CommitTimestampProps = HTMLAttributes<HTMLTimeElement> & {
  date: Date;
};

const relativeTimeFormat = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

const formatRelativeDate = (date: Date) => {
  const days = Math.round(
    (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  return relativeTimeFormat.format(days, "day");
};

export const CommitTimestamp = ({
  date,
  className,
  children,
  ...props
}: CommitTimestampProps) => {
  const formatted = formatRelativeDate(date);

  return (
    <time
      className={cn("text-xs", className)}
      dateTime={date.toISOString()}
      {...props}
    >
      {children ?? formatted}
    </time>
  );
};

export type CommitActionsProps = HTMLAttributes<HTMLFieldSetElement>;

const handleActionsClick = (e: React.MouseEvent) => e.stopPropagation();
const handleActionsKeyDown = (e: React.KeyboardEvent) => e.stopPropagation();

export const CommitActions = ({
  className,
  children,
  ...props
}: CommitActionsProps) => (
  // Stops the parent commit row's onClick/onKeyDown from firing when an
  // action button inside is used; the fieldset itself has no interactive semantics.
  // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- event containment only, not a control
  <fieldset
    className={cn("flex items-center gap-1", className)}
    onClick={handleActionsClick}
    onKeyDown={handleActionsKeyDown}
    {...props}
  >
    {children}
  </fieldset>
);

export type CommitCopyButtonProps = ComponentProps<typeof Button> & {
  hash: string;
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
};

export const CommitCopyButton = ({
  hash,
  onCopy,
  onError,
  timeout = 2000,
  children,
  className,
  ...props
}: CommitCopyButtonProps) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard({
    onCopy,
    onError,
    timeout,
  });

  const Icon = isCopied ? IconCheck : IconCopy;

  return (
    <Button
      aria-label={isCopied ? "Copied" : "Copy commit hash"}
      className={cn("size-7 shrink-0", className)}
      onClick={() => copyToClipboard(hash)}
      size="icon"
      variant="ghost"
      {...props}
    >
      {children ?? <Icon size={14} />}
    </Button>
  );
};

export type CommitContentProps = ComponentProps<typeof CollapsibleContent>;

export const CommitContent = ({
  className,
  children,
  ...props
}: CommitContentProps) => (
  <CollapsibleContent className={cn("border-t p-3", className)} {...props}>
    {children}
  </CollapsibleContent>
);

export type CommitFilesProps = HTMLAttributes<HTMLDivElement>;

export const CommitFiles = ({
  className,
  children,
  ...props
}: CommitFilesProps) => (
  <div className={cn("space-y-1", className)} {...props}>
    {children}
  </div>
);

export type CommitFileProps = HTMLAttributes<HTMLDivElement>;

export const CommitFile = ({
  className,
  children,
  ...props
}: CommitFileProps) => (
  <div
    className={cn(
      "hover:bg-muted/50 flex items-center justify-between gap-2 rounded px-2 py-1 text-sm",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export type CommitFileInfoProps = HTMLAttributes<HTMLDivElement>;

export const CommitFileInfo = ({
  className,
  children,
  ...props
}: CommitFileInfoProps) => (
  <div className={cn("flex min-w-0 items-center gap-2", className)} {...props}>
    {children}
  </div>
);

const fileStatusStyles = {
  added: "text-green-600 dark:text-green-400",
  deleted: "text-red-600 dark:text-red-400",
  modified: "text-yellow-600 dark:text-yellow-400",
  renamed: "text-blue-600 dark:text-blue-400",
};

const fileStatusLabels = {
  added: "A",
  deleted: "D",
  modified: "M",
  renamed: "R",
};

export type CommitFileStatusProps = HTMLAttributes<HTMLSpanElement> & {
  status: "added" | "modified" | "deleted" | "renamed";
};

export const CommitFileStatus = ({
  status,
  className,
  children,
  ...props
}: CommitFileStatusProps) => (
  <span
    className={cn(
      "font-mono text-xs font-medium",
      fileStatusStyles[status],
      className
    )}
    {...props}
  >
    {children ?? fileStatusLabels[status]}
  </span>
);

export type CommitFileIconProps = ComponentProps<typeof IconFile>;

export const CommitFileIcon = ({
  className,
  ...props
}: CommitFileIconProps) => (
  <IconFile
    className={cn("text-muted-foreground size-3.5 shrink-0", className)}
    {...props}
  />
);

export type CommitFilePathProps = HTMLAttributes<HTMLSpanElement>;

export const CommitFilePath = ({
  className,
  children,
  ...props
}: CommitFilePathProps) => (
  <span className={cn("truncate font-mono text-xs", className)} {...props}>
    {children}
  </span>
);

export type CommitFileChangesProps = HTMLAttributes<HTMLDivElement>;

export const CommitFileChanges = ({
  className,
  children,
  ...props
}: CommitFileChangesProps) => (
  <div
    className={cn(
      "flex shrink-0 items-center gap-1 font-mono text-xs",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export type CommitFileAdditionsProps = HTMLAttributes<HTMLSpanElement> & {
  count: number;
};

export const CommitFileAdditions = ({
  count,
  className,
  children,
  ...props
}: CommitFileAdditionsProps) => {
  if (count <= 0) {
    return null;
  }

  return (
    <span
      className={cn("text-green-600 dark:text-green-400", className)}
      {...props}
    >
      {children ?? (
        <>
          <IconPlus className="inline-block size-3" />
          {count}
        </>
      )}
    </span>
  );
};

export type CommitFileDeletionsProps = HTMLAttributes<HTMLSpanElement> & {
  count: number;
};

export const CommitFileDeletions = ({
  count,
  className,
  children,
  ...props
}: CommitFileDeletionsProps) => {
  if (count <= 0) {
    return null;
  }

  return (
    <span
      className={cn("text-red-600 dark:text-red-400", className)}
      {...props}
    >
      {children ?? (
        <>
          <IconMinus className="inline-block size-3" />
          {count}
        </>
      )}
    </span>
  );
};
