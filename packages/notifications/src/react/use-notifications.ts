"use client";

import { useContext } from "react";

import { NotificationsContext } from "./notifications-provider";
import type { NotificationsContextValue } from "./notifications-provider";

export const useNotifications = (): NotificationsContextValue => {
  const value = useContext(NotificationsContext);
  if (!value) {
    throw new Error(
      "useNotifications must be used within a <NotificationsProvider>."
    );
  }
  return value;
};
