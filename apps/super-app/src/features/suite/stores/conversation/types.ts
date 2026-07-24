import type {
  ConversationItem,
  SuiteAssetType,
} from "@/features/suite/types/conversation";

export interface PendingSkeletonHint {
  generationId: string;
  count: number;
  assetType: SuiteAssetType;
}

export interface TSuiteConversationStore {
  items: ConversationItem[];
  historyItemCount: number;
  pendingSkeletonHint: PendingSkeletonHint | null;
  /**
   * generationId of a turn that finished with NO image output (e.g. BE returned a
   * clarification instead of generating). Keyed by generationId so each turn is independent.
   * The canvas reacts by trimming that turn's orphan skeletons / annotations.
   */
  settledNoOutputGenId: string | null;

  appendItem: (item: ConversationItem) => string;
  insertBefore: (targetId: string, item: ConversationItem) => string;
  prependItems: (items: ConversationItem[]) => void;
  updateItem: (id: string, updater: (item: ConversationItem) => void) => void;
  removeItem: (id: string) => void;
  setItems: (items: ConversationItem[]) => void;
  setPendingSkeletonHint: (hint: PendingSkeletonHint) => void;
  clearPendingSkeletonHint: () => void;
  markTurnSettledWithoutOutput: (generationId: string) => void;
  reset: () => void;
}
