"use client";

import { useContext } from "react";
import { useStore } from "zustand";

import { SuiteConversationContext } from "./context";
import type { TSuiteConversationStore } from "./types";

export function useSuiteConversation<T>(
  selector: (state: TSuiteConversationStore) => T
): T {
  const store = useContext(SuiteConversationContext);
  if (!store) {
    throw new Error("Missing SuiteConversationProvider in the tree");
  }
  return useStore(store, selector);
}

export function useSuiteConversationStore() {
  const store = useContext(SuiteConversationContext);
  if (!store) {
    throw new Error("Missing SuiteConversationProvider in the tree");
  }
  return store;
}
