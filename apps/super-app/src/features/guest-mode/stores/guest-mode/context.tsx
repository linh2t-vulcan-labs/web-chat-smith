"use client";

import { createContext, useEffect, useRef } from "react";

import { clearAuthStorage } from "@/utils/commons/helpers";

import { useBootstrapSession } from "../../hooks/use-bootstrap-session";
import type { TCreateGuestStore } from "./store";
import { createGuestStore } from "./store";
import type { TGuestProviderProps } from "./types";

export const GuestContext = createContext<TCreateGuestStore | null>(null);

export function GuestProvider({ children, options }: TGuestProviderProps) {
  const storeRef = useRef<TCreateGuestStore | null>(null);

  storeRef.current ??= createGuestStore(options);

  const { data, error, isError } = useBootstrapSession();

  // Handle successful bootstrap data
  useEffect(() => {
    if (!data || !storeRef.current) {
      return;
    }

    try {
      if (!data.nonce || !data.csrfToken) {
        console.warn(
          "[GuestProvider] Bootstrap data missing nonce or csrfToken"
        );
        storeRef.current
          .getState()
          .setBootstrapError("Invalid bootstrap data received");
        return;
      }

      const store = storeRef.current.getState();
      store.setNonce(data.nonce);
      store.setCsrfToken(data.csrfToken);
      store.setBootstrapError(null);
    } catch {
      // console.error("[GuestProvider] Error processing bootstrap data:", err);
      storeRef.current
        .getState()
        .setBootstrapError("Failed to process bootstrap data");
    }
  }, [data]);

  // Handle bootstrap errors
  useEffect(() => {
    if (!isError || !storeRef.current) {
      return;
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to bootstrap session";
    // console.error("[GuestProvider] Bootstrap error:", errorMessage);

    const store = storeRef.current.getState();
    store.setBootstrapError(errorMessage);
    store.setIsShowCaptchaModal(true);
  }, [isError, error]);

  // Clean access Token
  useEffect(() => {
    clearAuthStorage();
  }, []);

  // oxlint-disable-next-line react/react-compiler -- reading the lazily-initialized store ref to provide it via context; store is created above before first paint and is stable thereafter
  return <GuestContext value={storeRef.current}>{children}</GuestContext>;
}
