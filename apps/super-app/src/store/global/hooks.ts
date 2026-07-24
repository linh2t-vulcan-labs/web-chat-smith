import { useContext } from "react";
import { useStore } from "zustand";

import { GlobalContext } from "./context";
import type { TGlobalStore } from "./types";

export function useGlobalState<T>(selector: (state: TGlobalStore) => T): T {
  const store = useContext(GlobalContext);
  if (!store) {
    throw new Error("Missing GlobalContext in the tree");
  }

  return useStore(store, selector);
}

export function useGlobalStore() {
  const store = useContext(GlobalContext);
  if (!store) {
    throw new Error("Missing GlobalContext in the tree");
  }
  return store;
}
