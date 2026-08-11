"use client";

import { IconBrain } from "@cs/icons/brain";
import { IconChevronDown } from "@cs/icons/chevron-down";
import type { ComponentProps, ReactNode } from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

import { MarkdownBlocks } from "#components/ai-elements/markdown-plugins";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#components/shadcn/collapsible";
import { useControllableState } from "#hooks/use-controllable-state";
import { cn } from "#lib/utils";

import { Shimmer } from "./shimmer";

interface ReasoningContextValue {
  isStreaming: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  duration: number | undefined;
}

const ReasoningContext = createContext<ReasoningContextValue | null>(null);

export const useReasoning = () => {
  const context = useContext(ReasoningContext);
  if (!context) {
    throw new Error("Reasoning components must be used within Reasoning");
  }
  return context;
};

export type ReasoningProps = ComponentProps<typeof Collapsible> & {
  isStreaming?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
};

const AUTO_CLOSE_DELAY = 1000;
const MS_IN_S = 1000;

const shouldAutoCloseReasoning = (
  hasEverStreamed: boolean,
  isStreaming: boolean,
  isOpen: boolean,
  hasAutoClosed: boolean
) => hasEverStreamed && !isStreaming && isOpen && !hasAutoClosed;

export const Reasoning = ({
  className,
  isStreaming = false,
  open,
  defaultOpen,
  onOpenChange,
  duration: durationProp,
  children,
  ...props
}: ReasoningProps) => {
  const resolvedDefaultOpen = defaultOpen ?? isStreaming;
  // Track if defaultOpen was explicitly set to false (to prevent auto-open)
  const isExplicitlyClosed = defaultOpen === false;

  const [isOpen, setIsOpen] = useControllableState<boolean>({
    defaultProp: resolvedDefaultOpen,
    onChange: onOpenChange,
    prop: open,
  });
  const [duration, setDuration] = useControllableState<number | undefined>({
    defaultProp: undefined,
    prop: durationProp,
  });

  const hasEverStreamedRef = useRef(isStreaming);
  const [hasAutoClosed, setHasAutoClosed] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  // Track when streaming starts and compute duration
  useEffect(() => {
    if (isStreaming) {
      hasEverStreamedRef.current = true;
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
      }
    } else if (startTimeRef.current !== null) {
      setDuration(Math.ceil((Date.now() - startTimeRef.current) / MS_IN_S));
      startTimeRef.current = null;
    }
  }, [isStreaming, setDuration]);

  // Auto-open when streaming starts (unless explicitly closed)
  useEffect(() => {
    if (isStreaming && !isOpen && !isExplicitlyClosed) {
      setIsOpen(true);
    }
  }, [isStreaming, isOpen, setIsOpen, isExplicitlyClosed]);

  // Auto-close when streaming ends (once only, and only if it ever streamed)
  useEffect(() => {
    if (
      !shouldAutoCloseReasoning(
        hasEverStreamedRef.current,
        isStreaming,
        isOpen,
        hasAutoClosed
      )
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setIsOpen(false);
      setHasAutoClosed(true);
    }, AUTO_CLOSE_DELAY);

    return () => clearTimeout(timer);
  }, [isStreaming, isOpen, setIsOpen, hasAutoClosed]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
  };

  const contextValue = { duration, isOpen, isStreaming, setIsOpen };

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values -- handled by React Compiler
    <ReasoningContext value={contextValue}>
      <Collapsible
        className={cn("not-prose mb-4", className)}
        onOpenChange={handleOpenChange}
        open={isOpen}
        {...props}
      >
        {children}
      </Collapsible>
    </ReasoningContext>
  );
};

export type ReasoningTriggerProps = ComponentProps<
  typeof CollapsibleTrigger
> & {
  getThinkingMessage?: (isStreaming: boolean, duration?: number) => ReactNode;
};

const defaultGetThinkingMessage = (isStreaming: boolean, duration?: number) => {
  if (isStreaming || duration === 0) {
    return <Shimmer duration={1}>Thinking...</Shimmer>;
  }
  if (duration === undefined) {
    return <p>Thought for a few seconds</p>;
  }
  return <p>Thought for {duration} seconds</p>;
};

export const ReasoningTrigger = ({
  className,
  children,
  getThinkingMessage = defaultGetThinkingMessage,
  ...props
}: ReasoningTriggerProps) => {
  const { isStreaming, isOpen, duration } = useReasoning();

  return (
    <CollapsibleTrigger
      className={cn(
        "text-muted-foreground hover:text-foreground flex w-full items-center gap-2 text-sm transition-colors",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          <IconBrain className="size-4" />
          {getThinkingMessage(isStreaming, duration)}
          <IconChevronDown
            className={cn(
              "size-4 transition-transform",
              isOpen ? "rotate-180" : "rotate-0"
            )}
          />
        </>
      )}
    </CollapsibleTrigger>
  );
};

export type ReasoningContentProps = ComponentProps<
  typeof CollapsibleContent
> & {
  children: string;
};

export const ReasoningContent = ({
  className,
  children,
  ...props
}: ReasoningContentProps) => (
  <CollapsibleContent
    className={cn(
      "markdown-renderer prose prose-sm mt-4 max-w-none text-sm",
      "text-muted-foreground outline-none",
      className
    )}
    {...props}
  >
    <MarkdownBlocks content={children} />
  </CollapsibleContent>
);
