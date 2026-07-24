"use client";

import {
  Conversation,
  ConversationContent,
} from "@/features/suite/components/ui/ai-elements/conversation";
import { cn } from "@/features/suite/utils/classnames";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";

import type { SuiteConversationProps } from "./types";

export function SuiteConversation({
  className,
  children,
  contextRef,
  ...props
}: SuiteConversationProps) {
  return (
    <Conversation
      data-testid={DATA_TEST_ID.suite.custom.suiteConversation}
      className={cn("flex-1 self-stretch", className)}
      contextRef={contextRef}
      resize="instant"
      {...props}
    >
      <ConversationContent
        className="gap-v1-structural-component-large py-0"
        scrollClassName="[overflow-anchor:none]"
      >
        {children}
      </ConversationContent>
    </Conversation>
  );
}
