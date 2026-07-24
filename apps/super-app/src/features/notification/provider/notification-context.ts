import { createContext, useContext } from "react";

import type { TNotificationContext } from "./types";

export const NotificationContext = createContext<TNotificationContext | null>(
  null
);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotification must be used inside NotificationProvider");
  }
  return ctx;
}
