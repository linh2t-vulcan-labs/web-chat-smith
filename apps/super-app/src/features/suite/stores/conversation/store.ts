import { immer } from "zustand/middleware/immer";
import { createStore } from "zustand/vanilla";

import { generateRandomUUIDV4 } from "@/utils/commons/helpers";

import type { TSuiteConversationStore } from "./types";

export type TCreateSuiteConversationStore = ReturnType<
  typeof createSuiteConversationStore
>;

export const createSuiteConversationStore = () =>
  createStore<TSuiteConversationStore>()(
    immer((set) => ({
      appendItem: (item) => {
        const id = item.id ?? generateRandomUUIDV4();
        set((state) => {
          state.items.push({ ...item, id });
        });
        return id;
      },
      clearPendingSkeletonHint: () => {
        set({ pendingSkeletonHint: null });
      },
      historyItemCount: 0,
      insertBefore: (targetId, item) => {
        const id = item.id ?? generateRandomUUIDV4();
        set((state) => {
          const withId = { ...item, id };
          const idx = state.items.findIndex((it) => it.id === targetId);
          if (idx === -1) {
            state.items.push(withId);
          } else {
            state.items.splice(idx, 0, withId);
          }
        });
        return id;
      },
      items: [],
      markTurnSettledWithoutOutput: (generationId) => {
        set({ settledNoOutputGenId: generationId });
      },
      pendingSkeletonHint: null,
      prependItems: (items) => {
        set((state) => {
          const withIds = items.map((it) => ({
            ...it,
            id: it.id ?? generateRandomUUIDV4(),
          }));
          state.items.unshift(...withIds);
          state.historyItemCount += items.length;
        });
      },
      removeItem: (id) => {
        set((state) => {
          const idx = state.items.findIndex((it) => it.id === id);
          if (idx === -1) {
            return;
          }

          state.items.splice(idx, 1);
        });
      },
      reset: () => {
        set({ historyItemCount: 0, items: [], settledNoOutputGenId: null });
      },
      setItems: (items) => {
        set({
          items: items.map((it) => ({
            ...it,
            id: it.id ?? generateRandomUUIDV4(),
          })),
        });
      },
      setPendingSkeletonHint: (hint) => {
        set({ pendingSkeletonHint: hint });
      },
      settledNoOutputGenId: null,
      updateItem: (id, updater) => {
        set((state) => {
          const item = state.items.find((it) => it.id === id);
          if (!item) {
            return;
          }

          updater(item);
        });
      },
    }))
  );
