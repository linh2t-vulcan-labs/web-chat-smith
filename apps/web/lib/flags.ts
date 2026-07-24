import { getRuntimeEnv } from "@cs/env/universal";
import { createFlagsEngine } from "@cs/flags";
import { createFirebaseAdapter } from "@cs/flags/firebase";
import { REMOTE_CONFIG_KEYS } from "@cs/flags/keys";
import { createFlagsReact } from "@cs/flags/react";
import { defineFlagSchema } from "@cs/flags/schema";
import { getRemoteConfig } from "firebase/remote-config";

import { firebaseApp } from "@/lib/firebase";

/**
 * Start with the one flag apps/web already has UI for (@cs/themes'
 * ThemeToggle) — add more keys from REMOTE_CONFIG_KEYS as features need them,
 * not speculatively.
 */
export const flagSchema = defineFlagSchema({
  [REMOTE_CONFIG_KEYS.ENABLE_THEME_TOGGLE]: {
    decoder: "boolean",
    defaultValue: true,
  },
});

let engine: ReturnType<typeof createFlagsEngine<typeof flagSchema>> | undefined;

/**
 * Lazily builds the flags engine — same reasoning as lib/firebase.ts: the
 * Remote Config instance depends on `getRuntimeEnv()`, so it can't be
 * constructed at module top-level.
 */
export const flagsEngine = () => {
  if (!engine) {
    const remoteConfig = getRemoteConfig(firebaseApp());
    const fetchIntervalMs =
      getRuntimeEnv().CS_PUBLIC_FIREBASE_REMOTE_CONFIG_INTERVAL_FETCH;
    if (fetchIntervalMs) {
      remoteConfig.settings.minimumFetchIntervalMillis = fetchIntervalMs;
    }
    const adapter = createFirebaseAdapter(remoteConfig, flagSchema);
    engine = createFlagsEngine({ adapter, schema: flagSchema });
  }
  return engine;
};

export const { FlagsProvider, Feature, useFlag } =
  createFlagsReact<typeof flagSchema>();
