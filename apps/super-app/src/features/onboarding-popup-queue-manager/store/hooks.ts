import { useContext } from "react";
import { useStore } from "zustand";

import { OnboardingPopupQueueManagerContext } from "./context";
import type { TOnboardingPopupQueueStore } from "./types";

const useOnboardingPopupQueueManagerStore = () => {
  const store = useContext(OnboardingPopupQueueManagerContext);
  if (!store) {
    throw new Error("Missing OnboardingPopupQueueManagerContext in the tree");
  }
  return store;
};

const useOnboardingPopupQueueManagerStoreState = <T>(
  selector: (state: TOnboardingPopupQueueStore) => T
): T => {
  const store = useOnboardingPopupQueueManagerStore();
  return useStore(store, selector);
};

export {
  useOnboardingPopupQueueManagerStore,
  useOnboardingPopupQueueManagerStoreState,
};
