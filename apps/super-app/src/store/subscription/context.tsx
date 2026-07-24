"use client";

import type { PropsWithChildren } from "react";
import { createContext, useRef } from "react";

import type { TCreateSubscriptionStore } from "./store";
import { createSubscriptionStore } from "./store";

export const SubscriptionContext =
  createContext<TCreateSubscriptionStore | null>(null);

export function SubscriptionProvider({
  children,
}: Readonly<PropsWithChildren>) {
  const storeRef = useRef<TCreateSubscriptionStore | null>(null);

  storeRef.current ??= createSubscriptionStore();

  return (
    // oxlint-disable-next-line react/react-compiler -- reading the lazily-initialized store ref to provide it via context; store is created above before first paint and is stable thereafter
    <SubscriptionContext value={storeRef.current}>
      {children}
    </SubscriptionContext>
  );
}
