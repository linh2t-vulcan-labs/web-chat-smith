"use client";

import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/features/suite/components/ui/ai-elements/message";
import { cn } from "@/features/suite/utils/classnames";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";

import type { SuiteBotMessageProps } from "./types";

export function SuiteBotMessage({
  children,
  className,
  isAnimating,
  onAnimationComplete,
}: SuiteBotMessageProps) {
  return (
    <Message
      data-testid={DATA_TEST_ID.suite.custom.suiteBotMessage}
      className={cn("gap-v1-structural-content-micro self-stretch", className)}
      from="assistant"
    >
      <MessageContent className="gap-v1-structural-content-micro self-stretch">
        <MessageResponse
          className="typo-v1-body-longform font-250 text-v1-text-hierarchy-primary self-stretch **:data-[streamdown=ordered-list]:px-1.5 **:data-[streamdown=unordered-list]:px-1.5"
          animated
          isAnimating={isAnimating}
          onAnimationEnd={() => {
            onAnimationComplete?.();
          }}
        >
          {children as string}
        </MessageResponse>
      </MessageContent>
    </Message>
  );
}
