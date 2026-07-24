"use client";

import { FlagsProvider } from "@cs/flags/react";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { getFlags } from "./flags";
import type { TRemoteConfigDefaultValue } from "./remote-config-default";
import { remoteConfigDefaultValue } from "./remote-config-default";
import { REMOTE_CONFIG_KEY } from "./remote-config-key";

type RemoteConfigValueType = "boolean" | "number" | "string";

const REMOTE_CONFIG_GETTER: Record<
  RemoteConfigValueType,
  (key: string) => boolean | number | string
> = {
  boolean: (key) => getFlags().getBoolean(key),
  number: (key) => getFlags().getNumber(key),
  string: (key) => getFlags().getString(key),
};

const REMOTE_CONFIG_VALUE_TYPE: {
  [K in keyof TRemoteConfigDefaultValue]: RemoteConfigValueType;
} = {
  [REMOTE_CONFIG_KEY.SIDEBAR_DOWNLOAD_APP_LABEL]: "string",
  [REMOTE_CONFIG_KEY.PACKAGE_SUBSCRIPTION_INFO]: "string",
  [REMOTE_CONFIG_KEY.MESSAGE_FEEDBACK_OPTIONS]: "string",
  [REMOTE_CONFIG_KEY.SOCIAL_LINKS]: "string",
  [REMOTE_CONFIG_KEY.WHATS_NEW_OPTIONS]: "string",
  [REMOTE_CONFIG_KEY.WEB_FEATURES]: "string",
  [REMOTE_CONFIG_KEY.FLOATING_UPGRADE_CONFIG]: "string",
  [REMOTE_CONFIG_KEY.WHAT_NEWS_POPUP_OPTIONS]: "string",
  [REMOTE_CONFIG_KEY.PACKAGE_SUBSCRIPTION_UI_VERSION]: "number",
  [REMOTE_CONFIG_KEY.CONVERSATION_SUGGESTION_OPTIONS]: "string",
  [REMOTE_CONFIG_KEY.LIST_STYLE_OPTIONS]: "string",
  [REMOTE_CONFIG_KEY.NOTIFICATION_CONFIG]: "string",
  [REMOTE_CONFIG_KEY.MANAGE_SUBSCRIPTION_MECHANISM]: "string",
  [REMOTE_CONFIG_KEY.ONBOARDING_POPUP_GUIDE_SETTING]: "string",
  [REMOTE_CONFIG_KEY.SYNC_BETA]: "boolean",
  [REMOTE_CONFIG_KEY.FREE_USER_USAGE_CONFIG]: "string",
  [REMOTE_CONFIG_KEY.FEATURE_PADDLE_CHECKOUT]: "boolean",
  [REMOTE_CONFIG_KEY.CHAT_MEMORY_USED]: "boolean",
  [REMOTE_CONFIG_KEY.ENABLE_PADDLE_RETAIN]: "boolean",
  [REMOTE_CONFIG_KEY.UI_IMAGE_CONFIG]: "string",
  [REMOTE_CONFIG_KEY.FEATURE_PAYMENT_FLOW_V2]: "boolean",
  [REMOTE_CONFIG_KEY.ENABLE_THEME_TOGGLE]: "boolean",
  [REMOTE_CONFIG_KEY.ENABLE_DESIGN_STUDIO_TOGGLE]: "boolean",
};

interface RemoteConfigContextValue {
  isReady: boolean;
  isFetchedFromServer: boolean;
  getValueSyncRemoteConfig: <K extends keyof TRemoteConfigDefaultValue>(
    key: K
  ) => TRemoteConfigDefaultValue[K];
}

const RemoteConfigContext = createContext<RemoteConfigContextValue | undefined>(
  undefined
);

export const FirebaseRemoteConfigProvider = ({
  children,
}: PropsWithChildren) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initRemoteConfig = async () => {
      await getFlags().init();
      setIsReady(true);
    };
    initRemoteConfig();
  }, []);

  const getValueSyncRemoteConfig = useMemo(
    () =>
      <K extends keyof TRemoteConfigDefaultValue>(
        key: K
      ): TRemoteConfigDefaultValue[K] => {
        if (!isReady) {
          return remoteConfigDefaultValue[key];
        }
        const getValue = REMOTE_CONFIG_GETTER[REMOTE_CONFIG_VALUE_TYPE[key]];
        return getValue(key) as TRemoteConfigDefaultValue[K];
      },
    [isReady]
  );

  const contextValue = useMemo(
    () => ({
      getValueSyncRemoteConfig,
      isFetchedFromServer: isReady,
      isReady,
    }),
    [isReady, getValueSyncRemoteConfig]
  );

  return (
    <FlagsProvider flags={getFlags()}>
      <RemoteConfigContext value={contextValue}>{children}</RemoteConfigContext>
    </FlagsProvider>
  );
};

export const useRemoteConfigContext = (): RemoteConfigContextValue => {
  const context = useContext(RemoteConfigContext);
  if (!context) {
    throw new Error(
      "useRemoteConfigContext must be used inside FirebaseRemoteConfigProvider"
    );
  }
  return context;
};
