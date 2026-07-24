import { useCallback, useEffect } from "react";

import { localStorageImpl } from "@/utils/commons/helpers";

export interface TUseShowModalOnce {
  isDisabled?: boolean;
  key: string;
  setModal: (value: boolean) => void;
  isListenToLocalStorageChange?: boolean;
}

function useShowModalOnce({
  isDisabled = false,
  key,
  setModal,
  isListenToLocalStorageChange = false,
}: TUseShowModalOnce) {
  const checkAndShowModal = useCallback(() => {
    const hasSeen = localStorageImpl.load<boolean>(key);
    if (!hasSeen) {
      localStorageImpl.save(key, true);
      // oxlint-disable-next-line react/react-compiler -- setModal intentionally omitted from deps; it's a caller-supplied prop of unknown stability and adding it risks re-running this once-per-key localStorage check more often than intended
      setModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (isDisabled) {
      return;
    }
    checkAndShowModal();
  }, [isDisabled, checkAndShowModal]);

  useEffect(() => {
    if (!isListenToLocalStorageChange || isDisabled) {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== key) {
        return;
      }
      checkAndShowModal();
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [isListenToLocalStorageChange, isDisabled, key, checkAndShowModal]);
}

export default useShowModalOnce;
