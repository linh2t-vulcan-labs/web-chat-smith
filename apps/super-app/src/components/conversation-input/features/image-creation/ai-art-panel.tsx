import { EConversationMode } from "@/core/models/conversation";
import { useConversationState } from "@/store/conversation/hooks";

import { AiArtPanelContent } from "./ai-art-panel-content";

export const AIArtPanel = () => {
  // Conversation state
  const conversationMode = useConversationState((state) => state.mode);

  if (conversationMode !== EConversationMode.AI_ART) {
    return null;
  }

  return <AiArtPanelContent />;
};
