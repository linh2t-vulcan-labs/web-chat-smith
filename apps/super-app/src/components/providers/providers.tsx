import { ConversationSyncProvider } from "@/features/chat-sync/providers/conversation-sync-provider";
import { ConversationStateProvider } from "@/store/conversation/context";

import AutoBuyPackageProvider from "./auto-buy-package-provider";

function AppAuthProviders({ children }: Readonly<React.PropsWithChildren>) {
  return (
    <>
      <AutoBuyPackageProvider />
      <ConversationStateProvider>
        <ConversationSyncProvider>{children}</ConversationSyncProvider>
      </ConversationStateProvider>
    </>
  );
}
export default AppAuthProviders;
