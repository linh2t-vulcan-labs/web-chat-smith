"use client";

import { useContext } from "react";
import { useStore } from "zustand";

import { LIMIT_MESSAGE_STATUSES } from "@/core/models/conversation";

import { ConversationContext } from "./context";
import type { TConversationStore } from "./types";

function useConversationState<T>(
  selector: (state: TConversationStore) => T
): T {
  const store = useContext(ConversationContext);

  if (!store) {
    throw new Error("Missing ConversationContext in the tree");
  }

  return useStore(store, selector);
}

function useConversationStore() {
  const store = useContext(ConversationContext);
  if (!store) {
    throw new Error("Missing ConversationContext in the tree");
  }
  return store;
}

/**
 * Reactive equivalent of calling `state.checkDisabledInputBasedOnMessageStatus()`.
 * That store method reads `get()` imperatively, so selecting the method itself
 * (`useConversationState((state) => state.checkDisabledInputBasedOnMessageStatus)`)
 * never subscribes to the messages it reads — callers only saw a fresh value when
 * they happened to re-render for an unrelated reason, so sibling controls fed by
 * this selector could disable a render or more later than the textarea did.
 */
function useIsDisabledInputBasedOnMessageStatus(): boolean {
  return useConversationState((state) => {
    const messages = state.conversationStates[state.selectedId]?.messages ?? [];
    return messages.some((message) =>
      LIMIT_MESSAGE_STATUSES.has(message.status)
    );
  });
}

export {
  useConversationState,
  useConversationStore,
  useIsDisabledInputBasedOnMessageStatus,
};
