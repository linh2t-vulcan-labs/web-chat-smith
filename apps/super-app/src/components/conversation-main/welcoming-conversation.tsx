"use client";

import type { PropsWithChildren } from "react";
import React from "react";

import { cn } from "@/components/utils/cn";
import { WelcomeConversation } from "@/components/welcome-conversation";
import { EConversationMode } from "@/core/models/conversation";
import { useMatchRoute } from "@/hooks/use-match-route";
import { useConversationState } from "@/store/conversation/hooks";

interface Props {
  shouldShowWelcome?: boolean;
  exitsMessage?: boolean;
  className?: string;
}

const WelcomingWrapper: React.FC<
  PropsWithChildren & { className?: string; matchConversationExact?: boolean }
> = ({ className, matchConversationExact, children }) => (
  <div
    className={cn(className, {
      "min-h-[176px]": matchConversationExact,
    })}
  >
    {children}
  </div>
);

const WelcomingConversation: React.FC<Props> = ({
  className,
  exitsMessage,
  shouldShowWelcome = false,
}) => {
  const matchConversationExact = useMatchRoute("/conversation");
  const selectedFiles = useConversationState((state) => state.selectedFiles);
  const mode = useConversationState((state) => state.mode);
  const userInput = useConversationState((state) => state.userInput);

  const showWelComeConversation =
    !userInput.length &&
    !selectedFiles.length &&
    mode === EConversationMode.CHAT;

  if (!matchConversationExact || exitsMessage) {
    return null;
  }

  if (!showWelComeConversation) {
    return (
      <WelcomingWrapper
        className={className}
        matchConversationExact={Boolean(matchConversationExact)}
      />
    );
  }

  if (shouldShowWelcome) {
    return (
      <WelcomingWrapper
        className={className}
        matchConversationExact={Boolean(matchConversationExact)}
      >
        <WelcomeConversation />
      </WelcomingWrapper>
    );
  }
  return (
    <WelcomingWrapper className={className} matchConversationExact={true} />
  );
};

export default WelcomingConversation;
