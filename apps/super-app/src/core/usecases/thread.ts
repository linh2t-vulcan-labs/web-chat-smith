import { getTimeCategory } from "@/utils/commons/date-time";

import type { TThread, TThreadGroupKeys } from "../models/thread";
import type { TThreadRepositories } from "../ports/thread";

export const threadUseCases = (): TThreadRepositories => ({
  getCategorizeThreads: (threads) => {
    const categories: Record<TThreadGroupKeys, TThread[]> = {
      lastWeek: [],
      others: [],
      pinned: [],
      today: [],
      twoWeeksAgo: [],
      yesterday: [],
    };

    // categorize threads
    for (const thread of threads) {
      if (thread.pinned) {
        categories["pinned"].push(thread);
        continue;
      }

      const date = new Date(thread.updatedAt);
      const category = getTimeCategory(date);
      categories[category].push(thread);
    }

    return categories;
  },
  getSortedThreads: (threads) => {
    // sort threads newest to oldest
    const sortedData = threads.toSorted((a, b) => {
      if (b.pinned && a.pinned) {
        if (!(b.pinnedAt && a.pinnedAt)) {
          throw new Error("Expected pinnedAt to be set for pinned threads");
        }
        return new Date(b.pinnedAt).getTime() - new Date(a.pinnedAt).getTime();
      }
      return (
        new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
      );
    });
    return sortedData;
  },
});
