import { useMemo } from "react";

import type { InfiniteData } from "@/libs/react-query";

export default function usePaginatedResultItems<T, V>(
  data: InfiniteData<T | undefined> | undefined,
  getPageItems: (page: T) => V[]
) {
  return useMemo(() => {
    const items: V[] = [];

    if (data?.pages) {
      for (const page of data.pages) {
        if (page) {
          items.push(...getPageItems(page));
        }
      }
    }

    return items;
  }, [data, getPageItems]);
}
