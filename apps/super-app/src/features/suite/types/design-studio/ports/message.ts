import type { SuiteResult } from "@/features/suite/types/http";

import type {
  TSuiteCreativeDeleteMessageInput,
  TSuiteCreativeGetMessageHistoryInput,
  TSuiteCreativeGetMessageHistoryResult,
  TSuiteCreativeGetMessageSuggestionsInput,
  TSuiteCreativeGetMessageSuggestionsResult,
  TSuiteCreativePostMessageInput,
  TSuiteCreativePostMessageResult,
} from "../message";

export interface TSuiteCreativeMessageServiceAPIs {
  postMessage: (
    input: TSuiteCreativePostMessageInput
  ) => SuiteResult<TSuiteCreativePostMessageResult>;
  getMessageHistory: (
    input: TSuiteCreativeGetMessageHistoryInput
  ) => SuiteResult<TSuiteCreativeGetMessageHistoryResult>;
  deleteMessage: (
    input: TSuiteCreativeDeleteMessageInput
  ) => SuiteResult<Record<string, never>>;
  getMessageSuggestions: (
    input: TSuiteCreativeGetMessageSuggestionsInput
  ) => SuiteResult<TSuiteCreativeGetMessageSuggestionsResult>;
}
