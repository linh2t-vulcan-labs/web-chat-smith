"use client";

import { IconAlert } from "@cs/icons/alert";
import { IconCheck } from "@cs/icons/check";
import { IconChevronDown } from "@cs/icons/chevron-down";
import { IconCopy } from "@cs/icons/copy";
import type { ComponentProps } from "react";
import { createContext, useContext } from "react";

import { Button } from "#components/shadcn/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#components/shadcn/collapsible";
import { useControllableState } from "#hooks/use-controllable-state";
import { useCopyToClipboard } from "#hooks/use-copy-to-clipboard";
import { cn } from "#lib/utils";

// Regex patterns for parsing stack traces
const STACK_FRAME_WITH_PARENS_REGEX =
  /^at\s+(?<functionName>.+?)\s+\((?<filePath>.+):(?<line>\d+):(?<column>\d+)\)$/u;
const STACK_FRAME_WITHOUT_FN_REGEX =
  /^at\s+(?<filePath>.+):(?<line>\d+):(?<column>\d+)$/u;
const ERROR_TYPE_REGEX = /^(?<errorType>\w+Error|Error):\s*(?<message>.*)$/u;
const AT_PREFIX_REGEX = /^at\s+/u;

interface StackFrame {
  raw: string;
  functionName: string | null;
  filePath: string | null;
  lineNumber: number | null;
  columnNumber: number | null;
  isInternal: boolean;
}

interface ParsedStackTrace {
  errorType: string | null;
  errorMessage: string;
  frames: StackFrame[];
  raw: string;
}

interface StackTraceContextValue {
  trace: ParsedStackTrace;
  raw: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onFilePathClick?: (filePath: string, line?: number, column?: number) => void;
}

const StackTraceContext = createContext<StackTraceContextValue | null>(null);

const useStackTrace = () => {
  const context = useContext(StackTraceContext);
  if (!context) {
    throw new Error("StackTrace components must be used within StackTrace");
  }
  return context;
};

const isInternalFilePath = (filePath: string) =>
  filePath.includes("node_modules") ||
  filePath.startsWith("node:") ||
  filePath.includes("internal/");

const toLineOrColumnNumber = (value: string | undefined) =>
  value ? Math.trunc(Number(value)) : null;

const stackFrameFromMatch = (
  raw: string,
  groups: {
    functionName?: string;
    filePath: string;
    line: string;
    column: string;
  }
): StackFrame => {
  const { functionName, filePath, line, column } = groups;

  return {
    columnNumber: toLineOrColumnNumber(column),
    filePath,
    functionName: functionName ?? null,
    isInternal: isInternalFilePath(filePath),
    lineNumber: toLineOrColumnNumber(line),
    raw,
  };
};

// Ordered from most to least specific: "at fn (path:line:col)" before the
// function-less "at path:line:col" form.
const STACK_FRAME_PATTERNS = [
  STACK_FRAME_WITH_PARENS_REGEX,
  STACK_FRAME_WITHOUT_FN_REGEX,
];

interface StackFrameMatchGroups {
  functionName?: string;
  filePath: string;
  line: string;
  column: string;
}

const matchStackFramePattern = (
  trimmed: string
): StackFrameMatchGroups | null => {
  for (const pattern of STACK_FRAME_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match?.groups) {
      return match.groups as unknown as StackFrameMatchGroups;
    }
  }
  return null;
};

const isUnparseableLineInternal = (trimmed: string) =>
  trimmed.includes("node_modules") || trimmed.includes("node:");

const parseStackFrame = (line: string): StackFrame => {
  const trimmed = line.trim();
  const groups = matchStackFramePattern(trimmed);

  if (groups) {
    return stackFrameFromMatch(trimmed, groups);
  }

  // Fallback: unparseable line
  return {
    columnNumber: null,
    filePath: null,
    functionName: null,
    isInternal: isUnparseableLineInternal(trimmed),
    lineNumber: null,
    raw: trimmed,
  };
};

const toErrorHeader = (
  type: string | undefined,
  message: string | undefined
) => ({
  errorMessage: message || "",
  errorType: type ?? null,
});

/** Splits the first line of a stack trace into its error type and message, when it follows the "ErrorType: message" format. */
const parseErrorHeader = (
  firstLine: string
): { errorType: string | null; errorMessage: string } => {
  const groups = firstLine.match(ERROR_TYPE_REGEX)?.groups;
  if (!groups) {
    return { errorMessage: firstLine, errorType: null };
  }

  return toErrorHeader(groups.errorType, groups.message);
};

/** The parsed `StackFrame`s for every "at ..." line after the header line. */
const parseStackFrames = (lines: string[]): StackFrame[] => {
  const frames: StackFrame[] = [];
  for (const line of lines) {
    if (line.trim().startsWith("at ")) {
      frames.push(parseStackFrame(line));
    }
  }
  return frames;
};

const parseStackTrace = (trace: string): ParsedStackTrace => {
  const lines = trace.split("\n").filter((line) => line.trim());

  if (lines.length === 0) {
    return {
      errorMessage: trace,
      errorType: null,
      frames: [],
      raw: trace,
    };
  }

  const firstLine = (lines[0] ?? "").trim();
  const { errorType, errorMessage } = parseErrorHeader(firstLine);
  const frames = parseStackFrames(lines.slice(1));

  return {
    errorMessage,
    errorType,
    frames,
    raw: trace,
  };
};

export type StackTraceProps = ComponentProps<"div"> & {
  trace: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onFilePathClick?: (filePath: string, line?: number, column?: number) => void;
};

export const StackTrace = ({
  trace,
  className,
  open,
  defaultOpen = false,
  onOpenChange,
  onFilePathClick,
  children,
  ...props
}: StackTraceProps) => {
  const [isOpen, setIsOpen] = useControllableState({
    defaultProp: defaultOpen,
    onChange: onOpenChange,
    prop: open,
  });

  const parsedTrace = parseStackTrace(trace);

  const contextValue = {
    isOpen,
    onFilePathClick,
    raw: trace,
    setIsOpen,
    trace: parsedTrace,
  };

  return (
    // oxlint-disable-next-line react/jsx-no-constructed-context-values -- handled by React Compiler
    <StackTraceContext.Provider value={contextValue}>
      <div
        className={cn(
          "not-prose bg-background w-full overflow-hidden rounded-lg border font-mono text-sm",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </StackTraceContext.Provider>
  );
};

export type StackTraceHeaderProps = ComponentProps<typeof CollapsibleTrigger>;

export const StackTraceHeader = ({
  className,
  children,
  ...props
}: StackTraceHeaderProps) => {
  const { isOpen, setIsOpen } = useStackTrace();

  return (
    <Collapsible onOpenChange={setIsOpen} open={isOpen}>
      <CollapsibleTrigger
        render={
          // oxlint-disable-next-line jsx-a11y/control-has-associated-label -- generic passthrough render-prop; accessible text comes from `children` below, merged into this button by CollapsibleTrigger's render prop
          <button
            className={cn(
              "hover:bg-muted/50 flex w-full cursor-pointer items-center gap-3 p-3 text-left transition-colors",
              className
            )}
            type="button"
          />
        }
        {...props}
      >
        {children}
      </CollapsibleTrigger>
    </Collapsible>
  );
};

export type StackTraceErrorProps = ComponentProps<"div">;

export const StackTraceError = ({
  className,
  children,
  ...props
}: StackTraceErrorProps) => (
  <div
    className={cn("flex flex-1 items-center gap-2 overflow-hidden", className)}
    {...props}
  >
    <IconAlert className="text-destructive size-4 shrink-0" />
    {children}
  </div>
);

export type StackTraceErrorTypeProps = ComponentProps<"span">;

export const StackTraceErrorType = ({
  className,
  children,
  ...props
}: StackTraceErrorTypeProps) => {
  const { trace } = useStackTrace();

  return (
    <span
      className={cn("text-destructive shrink-0 font-semibold", className)}
      {...props}
    >
      {children ?? trace.errorType}
    </span>
  );
};

export type StackTraceErrorMessageProps = ComponentProps<"span">;

export const StackTraceErrorMessage = ({
  className,
  children,
  ...props
}: StackTraceErrorMessageProps) => {
  const { trace } = useStackTrace();

  return (
    <span className={cn("text-foreground truncate", className)} {...props}>
      {children ?? trace.errorMessage}
    </span>
  );
};

export type StackTraceActionsProps = ComponentProps<"div">;

const handleActionsClick = (e: React.MouseEvent) => e.stopPropagation();
const handleActionsKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.stopPropagation();
  }
};

export const StackTraceActions = ({
  className,
  children,
  ...props
}: StackTraceActionsProps) => (
  <div
    className={cn("flex shrink-0 items-center gap-1", className)}
    onClick={handleActionsClick}
    onKeyDown={handleActionsKeyDown}
    role="toolbar"
    tabIndex={-1}
    {...props}
  >
    {children}
  </div>
);

export type StackTraceCopyButtonProps = ComponentProps<typeof Button> & {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
};

export const StackTraceCopyButton = ({
  onCopy,
  onError,
  timeout = 2000,
  className,
  children,
  ...props
}: StackTraceCopyButtonProps) => {
  const { raw } = useStackTrace();
  const { isCopied, copyToClipboard } = useCopyToClipboard({
    onCopy,
    onError,
    timeout,
  });

  const Icon = isCopied ? IconCheck : IconCopy;

  return (
    <Button
      aria-label={isCopied ? "Copied" : "Copy stack trace"}
      className={cn("size-7", className)}
      onClick={() => copyToClipboard(raw)}
      size="icon"
      variant="ghost"
      {...props}
    >
      {children ?? <Icon size={14} />}
    </Button>
  );
};

export type StackTraceExpandButtonProps = ComponentProps<"div">;

export const StackTraceExpandButton = ({
  className,
  ...props
}: StackTraceExpandButtonProps) => {
  const { isOpen } = useStackTrace();

  return (
    <div
      className={cn("flex size-7 items-center justify-center", className)}
      {...props}
    >
      <IconChevronDown
        className={cn(
          "text-muted-foreground size-4 transition-transform",
          isOpen ? "rotate-180" : "rotate-0"
        )}
      />
    </div>
  );
};

export type StackTraceContentProps = ComponentProps<
  typeof CollapsibleContent
> & {
  maxHeight?: number;
};

export const StackTraceContent = ({
  className,
  maxHeight = 400,
  children,
  ...props
}: StackTraceContentProps) => {
  const { isOpen } = useStackTrace();

  return (
    <Collapsible open={isOpen}>
      <CollapsibleContent
        className={cn("bg-muted/30 border-t", className)}
        {...props}
      >
        <div className="overflow-auto" style={{ maxHeight }}>
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export type StackTraceFramesProps = ComponentProps<"div"> & {
  showInternalFrames?: boolean;
};

interface FilePathButtonProps {
  frame: StackFrame;
  onFilePathClick?: (
    filePath: string,
    lineNumber?: number,
    columnNumber?: number
  ) => void;
}

const toOptionalNumber = (value: number | null) => value ?? undefined;

const FilePathButton = ({ frame, onFilePathClick }: FilePathButtonProps) => {
  const handleClick = () => {
    if (!frame.filePath) {
      return;
    }

    onFilePathClick?.(
      frame.filePath,
      toOptionalNumber(frame.lineNumber),
      toOptionalNumber(frame.columnNumber)
    );
  };

  return (
    <button
      className={cn(
        "hover:text-primary underline decoration-dotted",
        onFilePathClick && "cursor-pointer"
      )}
      disabled={!onFilePathClick}
      onClick={handleClick}
      type="button"
    >
      {frame.filePath}
      {frame.lineNumber !== null && `:${frame.lineNumber}`}
      {frame.columnNumber !== null && `:${frame.columnNumber}`}
    </button>
  );
};

FilePathButton.displayName = "FilePathButton";

interface StackTraceFrameRowProps {
  frame: StackFrame;
  onFilePathClick?: FilePathButtonProps["onFilePathClick"];
}

const StackTraceFrameFunctionName = ({ frame }: { frame: StackFrame }) => {
  if (!frame.functionName) {
    return null;
  }

  return (
    <span className={frame.isInternal ? "" : "text-foreground"}>
      {frame.functionName}{" "}
    </span>
  );
};

const StackTraceFrameLocation = ({
  frame,
  onFilePathClick,
}: StackTraceFrameRowProps) => {
  if (frame.filePath) {
    return (
      <>
        <span className="text-muted-foreground">(</span>
        <FilePathButton frame={frame} onFilePathClick={onFilePathClick} />
        <span className="text-muted-foreground">)</span>
      </>
    );
  }

  if (frame.functionName) {
    return null;
  }

  return <span>{frame.raw.replace(AT_PREFIX_REGEX, "")}</span>;
};

const StackTraceFrameRow = ({
  frame,
  onFilePathClick,
}: StackTraceFrameRowProps) => (
  <div
    className={cn(
      "text-xs",
      frame.isInternal ? "text-muted-foreground/50" : "text-foreground/90"
    )}
  >
    <span className="text-muted-foreground">at </span>
    <StackTraceFrameFunctionName frame={frame} />
    <StackTraceFrameLocation frame={frame} onFilePathClick={onFilePathClick} />
  </div>
);

StackTraceFrameRow.displayName = "StackTraceFrameRow";

export const StackTraceFrames = ({
  className,
  showInternalFrames = true,
  ...props
}: StackTraceFramesProps) => {
  const { trace, onFilePathClick } = useStackTrace();

  const framesToShow = showInternalFrames
    ? trace.frames
    : trace.frames.filter((f) => !f.isInternal);

  return (
    <div className={cn("space-y-1 p-3", className)} {...props}>
      {framesToShow.map((frame) => (
        <StackTraceFrameRow
          frame={frame}
          key={frame.raw}
          onFilePathClick={onFilePathClick}
        />
      ))}
      {framesToShow.length === 0 && (
        <div className="text-muted-foreground text-xs">No stack frames</div>
      )}
    </div>
  );
};

StackTrace.displayName = "StackTrace";
StackTraceHeader.displayName = "StackTraceHeader";
StackTraceError.displayName = "StackTraceError";
StackTraceErrorType.displayName = "StackTraceErrorType";
StackTraceErrorMessage.displayName = "StackTraceErrorMessage";
StackTraceActions.displayName = "StackTraceActions";
StackTraceCopyButton.displayName = "StackTraceCopyButton";
StackTraceExpandButton.displayName = "StackTraceExpandButton";
StackTraceContent.displayName = "StackTraceContent";
StackTraceFrames.displayName = "StackTraceFrames";
