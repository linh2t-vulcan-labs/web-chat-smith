import { EUseCase } from "@/core/http/dto/conversation";
import type {
  TResponseGetConversations,
  TResponseGetConversationsV2,
} from "@/core/models/conversation";
import { conversationClientService } from "@/core/repositories";
import { useInfiniteQuery } from "@/libs/react-query";
import {
  MILLISECONDS_IN_A_SECOND,
  SECONDS_IN_A_MINUTE,
} from "@/utils/commons/date-time";
import { THttpError } from "@/utils/commons/error";

const CONVERSATIONS_LIMIT = "20";
const CONVERSATIONS_PAGE_DEFAULT = "1";
const CONVERSATIONS_INTERVAL_30_MIN =
  MILLISECONDS_IN_A_SECOND * SECONDS_IN_A_MINUTE * 60 * 30;

export function getConversationsQueryKey() {
  return ["conversations"];
}

interface TUseGetConversationsProps {
  useChatSync?: boolean;
  enabled: boolean;
}

export function useGetConversations(options?: TUseGetConversationsProps) {
  const { useChatSync, enabled } = options || {};
  return useInfiniteQuery({
    enabled,
    getNextPageParam: (_lastPage) => {
      let nextPage: string | undefined;
      if (useChatSync) {
        const lastPage = _lastPage as TResponseGetConversationsV2;
        nextPage = lastPage.has_more
          ? (lastPage as TResponseGetConversationsV2).prev_cursor
          : undefined;
      } else {
        nextPage = (_lastPage as TResponseGetConversations).next_page_token;
      }
      return nextPage || undefined;
    },
    initialPageParam: CONVERSATIONS_PAGE_DEFAULT,
    networkMode: "always",
    queryFn: async ({ pageParam }) => {
      const params = {
        limit: CONVERSATIONS_LIMIT,
        page_token: pageParam,
        use_case: EUseCase.UNSPECIFIED,
      };

      const paramsV2 = {
        ...(pageParam !== CONVERSATIONS_PAGE_DEFAULT && {
          prev_cursor: pageParam,
        }),
        limit: CONVERSATIONS_LIMIT,
      };

      const [error, conversations] = useChatSync
        ? await conversationClientService.getConversationsV2(paramsV2)
        : await conversationClientService.getConversations(params);

      if (error) {
        throw new THttpError(error);
      }

      return conversations;
    },
    queryKey: getConversationsQueryKey(),
    refetchInterval: CONVERSATIONS_INTERVAL_30_MIN,
  });
}
