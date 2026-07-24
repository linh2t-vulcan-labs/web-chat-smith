import { useTranslations } from "next-intl";

import type { TCitationMessage } from "@/core/models/conversation";
import { useGetCitations } from "@/hooks/citations/use-get-citations";
import { useGlobalState } from "@/store/global/hooks";

interface TRetryHandlerOptions {
  maxRetries: number;
  isShowPosition?: boolean;
}

// Citations can legitimately cite the same URL more than once; dedupe before
// using `url` as the React key downstream (right-sidebar-content.tsx).
const dedupeCitationsByUrl = (
  citations: TCitationMessage[]
): TCitationMessage[] => [
  ...new Map(citations.map((item) => [item.url, item])).values(),
];

export const useHandleGetCitationSources = (
  conversationId: string,
  messageId: string
) => {
  const { refetch } = useGetCitations({ conversationId, messageId });
  const setRightSidebarConfig = useGlobalState(
    (state) => state.setRightSidebarConfig
  );
  const conversationT = useTranslations("conversationPage");

  const retryGetCitationHandler = (options: TRetryHandlerOptions) => {
    let retryCount = 0;
    const { maxRetries, isShowPosition = true } = options;

    const retryHandler = async () => {
      if (retryCount >= maxRetries) {
        return;
      }

      retryCount += 1;

      setRightSidebarConfig({
        contentSetting: {
          type: "loading",
        },
        isOpen: true,
        title: conversationT("deepResearch.sources"),
      });

      const result = await refetch();

      if (result.isError) {
        const exhausted = retryCount >= maxRetries;

        setRightSidebarConfig({
          contentSetting: {
            onRetry: exhausted
              ? undefined
              : () => {
                  void retryHandler();
                },
            retryExhausted: exhausted,
            type: "error",
          },
          isOpen: true,
          title: conversationT("deepResearch.sources"),
        });
        return;
      }

      setRightSidebarConfig({
        contentSetting: {
          data: dedupeCitationsByUrl(result.data || []),
          isShowPosition,
          type: "sources",
        },
        isOpen: true,
        title: conversationT("deepResearch.sources"),
      });
    };

    return retryHandler;
  };

  return { retryGetCitationHandler };
};
