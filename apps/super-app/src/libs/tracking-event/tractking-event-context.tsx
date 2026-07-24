"use client";
// core-libs-context.tsx
import React, { createContext, useContext, useMemo } from "react";

interface TrackingEventProviderContextType {
  enabledGTM: boolean;
  enabledAppsflyer: boolean;
}

const TrackingEventContext = createContext<TrackingEventProviderContextType>({
  enabledAppsflyer: false,
  enabledGTM: false,
});

export const TrackingEventProvider = ({
  children,
  enabledGTM,
  enabledAppsflyer,
}: {
  children: React.ReactNode;
  enabledGTM?: boolean;
  enabledAppsflyer?: boolean;
}) => {
  const value = useMemo(
    () => ({
      enabledAppsflyer: Boolean(enabledAppsflyer),
      enabledGTM: Boolean(enabledGTM),
    }),
    [enabledGTM, enabledAppsflyer]
  );

  return <TrackingEventContext value={value}>{children}</TrackingEventContext>;
};

export const useTrackingEvent = () => {
  const context = useContext(TrackingEventContext);
  if (context === undefined) {
    throw new Error("useCoreLibsConfig must be used within a CoreLibsProvider");
  }
  return context;
};
