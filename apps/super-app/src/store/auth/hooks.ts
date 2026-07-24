import { useContext } from "react";
import { useStore } from "zustand";

import { AuthContext } from "./context";
import type { TAuthStore } from "./types";

export function useAuthState<T>(selector: (state: TAuthStore) => T): T {
  const store = useContext(AuthContext);
  if (!store) {
    throw new Error("Missing AuthContext in the tree");
  }

  return useStore(store, selector);
}

export function useAuthStore() {
  return useContext(AuthContext);
}
