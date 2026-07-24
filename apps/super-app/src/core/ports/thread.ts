import type { TThread, TThreadGroupKeys } from "../models/thread";

export interface TThreadRepositories {
  getCategorizeThreads: (
    threads: TThread[]
  ) => Record<TThreadGroupKeys, TThread[]>;
  getSortedThreads: (threads: TThread[]) => TThread[];
}

export type TThreadServiceAPIs = object;
