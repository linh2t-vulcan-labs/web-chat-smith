// "use client";

import { publicEnv } from "@cs/env/server";
import React from "react";

import { TrackingEventProvider } from "../tracking-event";
import { GoogleTagManagerProvider } from "../tracking-event/gtm";

interface TGTMConfig {
  gtmId: string;
  gtmAuth: string;
  gtmPreview: string;
}

interface TWebTrackingProviderProps {
  gtmConfig: TGTMConfig;
  /** Per-request CSP nonce — see GoogleTagManagerProvider for why it matters. */
  nonce?: string;
}

function WebTrackingProvider(
  props: React.PropsWithChildren<TWebTrackingProviderProps>
) {
  const { gtmConfig, nonce } = props;

  if (publicEnv.CS_PUBLIC_ENV_NAME !== "production") {
    return props.children;
  }

  return (
    <TrackingEventProvider enabledGTM={true} enabledAppsflyer={false}>
      <GoogleTagManagerProvider
        auth={gtmConfig.gtmAuth}
        gtmId={gtmConfig.gtmId}
        nonce={nonce}
        preview={gtmConfig.gtmPreview}
      />
      {props.children}
    </TrackingEventProvider>
  );
}

export { WebTrackingProvider };
