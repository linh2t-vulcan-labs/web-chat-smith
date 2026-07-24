"use client";

import { useEffect, useState } from "react";

import { useAuthState } from "@/store/auth/hooks";
import { LOCAL_STORAGE_KEY } from "@/utils/commons/keys";

let reloadTriggered = false;

const onRefresh = () => {
  globalThis.location.reload();
};

export function useMultiTabAuthSync() {
  const isAuthenticated = useAuthState((state) => state.isAuthenticated);
  const [openModal, setOpenModal] = useState(false);

  const onCloseSignoutModal = () => {
    setOpenModal(false);
  };

  useEffect(() => {
    const handleLogin = () => {
      if (reloadTriggered) {
        return;
      }

      if (!isAuthenticated) {
        reloadTriggered = true;
        onRefresh();
      }
    };

    const handleLogout = () => {
      if (isAuthenticated) {
        setOpenModal(true);
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.storageArea !== localStorage) {
        return;
      }

      if (event.key === LOCAL_STORAGE_KEY.LOGIN_EVENT) {
        handleLogin();
      }

      if (event.key === LOCAL_STORAGE_KEY.LOGOUT_EVENT) {
        handleLogout();
      }
    };

    globalThis.addEventListener("storage", onStorage);

    return () => {
      globalThis.removeEventListener("storage", onStorage);
    };
  }, [isAuthenticated]);

  return {
    closeSignoutModal: onCloseSignoutModal,
    forceRefresh: onRefresh,
    openSignoutModal: openModal,
  };
}
