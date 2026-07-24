"use client";

import { useContext } from "react";
import { useStore } from "zustand";

import { GuestContext } from "./context";
import type { TGuestStore } from "./types";

function useGuestState<T>(selector: (state: TGuestStore) => T): T {
  const store = useContext(GuestContext);

  if (!store) {
    throw new Error("Missing GuestContext in the tree");
  }

  return useStore(store, selector);
}

function useGuestStore() {
  const store = useContext(GuestContext);
  if (!store) {
    return null;
  }
  return store;
}

export { useGuestState, useGuestStore };
