import { useContext } from "react";

import { ConversationHandlerContext } from "@/store/conversation-handler/context";
import type { TConversationHandlerContext } from "@/store/conversation-handler/types";

export function useConversationHandler<Selected = TConversationHandlerContext>(
  selector?: (context: TConversationHandlerContext) => Selected
): Selected {
  const context = useContext(ConversationHandlerContext);
  if (!context) {
    throw new Error(
      "useConversationHandler must be used within a ConversationHandlerProvider"
    );
  }

  return selector ? selector(context) : (context as unknown as Selected);
}
