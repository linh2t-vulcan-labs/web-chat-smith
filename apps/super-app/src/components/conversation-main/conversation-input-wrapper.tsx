import { useTranslations } from "next-intl";
import type { PropsWithChildren } from "react";
import React from "react";

import { TypingAnimation } from "@/components/typing-animation/typing-animation";
import { cn } from "@/components/utils/cn";

interface Props {
  isConversationHome?: boolean;
}
const ConversationInputWrapper: React.FC<PropsWithChildren<Props>> = ({
  children,
  isConversationHome = false,
}) => {
  const conversationT = useTranslations("conversationPage");

  return (
    <div
      className={cn(
        "pb-medium-2.5 px-v1-2 flex w-full flex-col justify-center",
        {
          "flex-1": isConversationHome,
        }
      )}
    >
      <div
        className={cn("gap-small-1 mx-auto w-full max-w-(--breakpoint-md)", {
          "gap-v1-structural-section-compact md:px-small-0 px-v1-structural-component-micro flex flex-col":
            isConversationHome,
          "md:gap-medium-1.5 flex flex-col": !isConversationHome,
        })}
      >
        {isConversationHome && (
          <TypingAnimation
            text={conversationT("home.welcomeQuestion")}
            className="typo-v1-price-new md:typo-v1-heading-h1 text-v1-text-hierarchy-emphasis text-start"
          />
        )}
        {children}
      </div>
    </div>
  );
};

export default ConversationInputWrapper;
