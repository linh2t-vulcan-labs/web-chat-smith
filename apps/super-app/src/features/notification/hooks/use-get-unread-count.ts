import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { notificationService } from "@/core/repositories";
import { THttpError } from "@/utils/commons/error";

import { handleCountUpdate, handleFetchCompletion } from "../utils/helpers";

export function getUnreadCountQueryKey() {
  return ["notification-unread-count"];
}

export function useGetUnreadCount(
  shouldFetch = false,
  onCountChanged?: (newCount: number, oldCount: number) => void
) {
  const previousCountRef = useRef<number | null>(null);
  const wasFetchingRef = useRef<boolean>(false);

  const query = useQuery({
    enabled: shouldFetch,
    queryFn: async () => {
      const [error, result] = await notificationService.getUnreadCount();

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
    queryKey: getUnreadCountQueryKey(),
    refetchOnWindowFocus: false,
  });

  // Track when query finishes fetching
  useEffect(() => {
    const { isFetching } = query;
    const wasFetching = wasFetchingRef.current;
    const currentCount = query.data?.unread_count;
    const previousCount = previousCountRef.current;

    // Query just finished fetching (was fetching, now not)
    if (wasFetching && !isFetching) {
      previousCountRef.current = handleFetchCompletion(
        currentCount,
        previousCount,
        onCountChanged
      );
    } else if (!isFetching) {
      // Not fetching, just update the ref if data exists
      previousCountRef.current = handleCountUpdate(currentCount, previousCount);
    }

    // Update wasFetching ref
    wasFetchingRef.current = isFetching;
  }, [query.isFetching, query.data?.unread_count, onCountChanged]);

  return query;
}
