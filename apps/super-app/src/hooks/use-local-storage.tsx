import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useSyncExternalStore } from "react";

import { localStorageImpl, safeJsonParse } from "@/utils/commons/helpers";

const isFunction = <T,>(
  value: T | ((prevState: T) => T)
): value is (prevState: T) => T => typeof value === "function";

const getLocalStorageItem = (key: string) => {
  // An empty key means "not ready to persist yet" (e.g. userId-scoped keys
  // before the user id is known). Multiple call sites share this same ""
  // sentinel key, so it must never actually touch localStorage or their
  // values collide with each other.
  if (!key) {
    return null;
  }
  const value = window.localStorage.getItem(key);
  // Return null if the value is the string "undefined" or "null"
  if (value === "undefined" || value === "null") {
    return null;
  }
  return value;
};

const localStorageSubscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};

// Overload for when initialValue is provided
export default function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>];

// Overload for when initialValue is not provided
export default function useLocalStorage<T>(
  key: string,
  initialValue?: undefined
): [T | undefined, Dispatch<SetStateAction<T>>];

// Implementation
export default function useLocalStorage<T>(
  key: string,
  initialValue?: T
): [T | undefined, Dispatch<SetStateAction<T>>] {
  const getSnapshot = () => getLocalStorageItem(key);
  const store = useSyncExternalStore(
    localStorageSubscribe,
    getSnapshot,
    () => null
  );

  const setState = useCallback(
    (v: SetStateAction<T>) => {
      if (!key) {
        return;
      }
      try {
        let nextState;
        if (isFunction(v)) {
          const parsedStore = store ? JSON.parse(store) : null;
          nextState = (v as (prevValue: T) => T)(parsedStore ?? initialValue);
        } else {
          nextState = v;
        }

        // Always use localStorageImpl.save which handles undefined/null properly
        // When nextState is undefined or null, the key will be removed from localStorage
        localStorageImpl.save(key, nextState);
      } catch (error) {
        console.log(error);
      }
    },
    [key, store, initialValue]
  );

  useEffect(() => {
    if (
      key &&
      getLocalStorageItem(key) === null &&
      initialValue !== undefined
    ) {
      localStorageImpl.save(key, initialValue);
    }
  }, [key, initialValue]);

  const getValue = (): T | undefined => {
    if (!store) {
      return initialValue;
    }

    return safeJsonParse<T>(store) ?? initialValue;
  };

  return [getValue(), setState];
}
