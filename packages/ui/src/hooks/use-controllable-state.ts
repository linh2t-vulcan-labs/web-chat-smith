import { useEffect, useRef, useState } from "react";

interface UseControllableStateParams<T> {
  prop?: T;
  defaultProp?: T;
  onChange?: (value: T) => void;
}

export const useControllableState = <T>({
  prop,
  defaultProp,
  onChange,
}: UseControllableStateParams<T>): [
  T,
  (value: T | ((prev: T) => T)) => void,
] => {
  const [internalValue, setInternalValue] = useState<T>(defaultProp as T);
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : internalValue;

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const setValue = (nextValue: T | ((prev: T) => T)) => {
    const resolvedValue =
      typeof nextValue === "function"
        ? (nextValue as (prev: T) => T)(value as T)
        : nextValue;

    if (!isControlled) {
      setInternalValue(resolvedValue);
    }
    onChangeRef.current?.(resolvedValue);
  };

  return [value as T, setValue];
};
