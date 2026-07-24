import { useCallback, useEffect, useRef, useState } from "react";

export const useHandleClickOutside = <T extends HTMLElement>(
  cb?: () => void
) => {
  const wrapperRef = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
        return cb?.();
      }
    },
    [cb]
  );

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, false);

    return () => {
      document.removeEventListener("click", handleClickOutside, false);
    };
  }, [handleClickOutside]);

  return {
    isVisible,
    setIsVisible,
    wrapperRef,
  };
};
