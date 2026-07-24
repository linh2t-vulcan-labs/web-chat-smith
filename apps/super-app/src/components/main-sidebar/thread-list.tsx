import { AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";

import { AnimatedThread } from "@/components/animated-thread";
import type { TThreadGroupKeys } from "@/core/models/thread";
import { threadUC } from "@/core/usecases";
import { useChatSyncFlag } from "@/features/chat-sync/hooks/use-chat-sync-flag";
import { useDeletingConversation } from "@/hooks/conversations/use-deleting-conversation";
import { compositeStyles } from "@/utils/commons/styles";
import { THREAD_GROUP_CONST } from "@/utils/constants/thread";

import { ThreadV2 } from "../conversation-widgets-v2/thread-v2";
import ThreadHistory from "./thread-history";
import type { ThreadListProps } from "./types";

export default function ThreadList({
  id,
  threads,
  isError,
  onRetry,
  onClick,
  onRemove,
  onEdit,
}: ThreadListProps) {
  const categorizedThreads = threadUC.getCategorizeThreads(threads);
  const { checkDeletingConversation } = useDeletingConversation();

  const threadGroupT = useTranslations("mainLayout.sidebar");

  const { isBeta: enabledChatSync } = useChatSyncFlag();
  if (!threads.length) {
    return <ThreadHistory threads={[]} isError={isError} onRetry={onRetry} />;
  }

  return (
    <div className="gap-v1-structural-component-micro flex flex-col">
      {Object.keys(THREAD_GROUP_CONST).map((category) => {
        const threadList = categorizedThreads[category as TThreadGroupKeys];
        const groupName = threadGroupT(
          THREAD_GROUP_CONST[category as TThreadGroupKeys]
        );
        const sortedThreads = threadUC.getSortedThreads(threadList);

        return (
          sortedThreads.length > 0 && (
            <div key={category} className="flex flex-col">
              <h3
                className={compositeStyles(
                  "typo-v1-label-compact-allcap bg-v1-surface-hierarchy-base text-v1-text-hierarchy-tertiary",
                  "px-v1-structural-content-tight py-v1-1 md:px-v1-structural-content-normal md:py-v1-optical-normal",
                  "sticky top-0 z-10 size-full uppercase"
                )}
              >
                {groupName}
              </h3>
              <ul className="space-y-small-0.5 flex w-full flex-col">
                <AnimatePresence>
                  {sortedThreads.map((thread) => {
                    const isActive = thread.id === id;
                    const isDeleting = checkDeletingConversation(thread.id);
                    return (
                      <AnimatedThread
                        key={thread.id}
                        style={{
                          zIndex: isActive ? 1 : 0,
                        }}
                      >
                        <ThreadV2
                          id={thread.id}
                          title={thread.name}
                          content={thread.lastMessage}
                          platform={thread.platform}
                          isActive={isActive}
                          isDisabled={isDeleting}
                          isMigrated={thread.isMigrated}
                          isChatSyncEnabled={enabledChatSync}
                          href={thread.path}
                          onClick={onClick}
                          onRemove={onRemove}
                          onEdit={onEdit}
                        />
                      </AnimatedThread>
                    );
                  })}
                </AnimatePresence>
              </ul>
            </div>
          )
        );
      })}
    </div>
  );
}
