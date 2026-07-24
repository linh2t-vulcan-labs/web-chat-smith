import React from "react";

import { cn } from "@/components/utils/cn";
import { useGlobalState } from "@/store/global/hooks";

import ChatContent from "./chat-content";

interface Props {
  shouldFetch?: boolean;
  className?: string;
}

const ConversationHistory: React.FC<Props> = ({ shouldFetch, className }) => {
  const toggleSidebar = useGlobalState((state) => state.toggleSidebar);

  return (
    <ChatContent
      className={cn("w-full", className)}
      shouldFetch={shouldFetch}
      onToggleSidebar={() => toggleSidebar()}
    />
  );
};

export default ConversationHistory;
