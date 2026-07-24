"use client";

import { useTranslations } from "next-intl";

import { EmptyThread } from "@/components/empty-thread";
import { FetchingErrorMessage } from "@/components/fetching-error-message";
import { useRouter } from "@/i18n/navigation";

import type { TThreadHistory } from "./types";

export default function ThreadHistory({
  threads,
  isError,
  onRetry,
}: TThreadHistory) {
  const conversationT = useTranslations("conversationPage");
  const router = useRouter();

  const handleReplaceConversationURL = (id: string) => {
    router.replace(`/conversation/${id}`, { scroll: false });
  };

  if (isError) {
    return (
      <FetchingErrorMessage
        text={conversationT("toast.error.failHistory")}
        onRetry={onRetry}
      />
    );
  }

  return (
    <div className="flex size-full flex-col items-center">
      {threads.map((thread) => (
        <div
          className="block h-fit w-full"
          key={thread.id}
          onClick={() => {
            handleReplaceConversationURL(thread.id);
          }}
        >
          {/* <Thread title={thread.title} content={thread.last_message} /> */}
        </div>
      ))}

      {threads.length <= 0 && (
        <div className="flex size-full items-center justify-center px-3">
          <EmptyThread />
        </div>
      )}
    </div>
  );
}
