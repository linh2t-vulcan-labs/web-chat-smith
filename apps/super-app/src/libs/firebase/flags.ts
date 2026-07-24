import { createFirebaseFlags, flagDefaults } from "@cs/flags";
import { REMOTE_CONFIG_KEYS } from "@cs/flags/keys";

import { defaultWebFeatures } from "@/config/web-features";

import { getFirebaseRemoteConfig } from ".";

let cachedFlags: ReturnType<typeof createFirebaseFlags> | undefined;

// Lazy — never called at module scope, since getFirebaseRemoteConfig()
// depends on CS_PUBLIC_* being available (window.__CS_ENV__/process.env).
export const getFlags = (): ReturnType<typeof createFirebaseFlags> => {
  if (!cachedFlags) {
    cachedFlags = createFirebaseFlags({
      defaults: {
        ...flagDefaults,
        // Override the generic empty-object default with the app's real default
        // values so getWebFeature() returns meaningful data before the first fetch.
        [REMOTE_CONFIG_KEYS.WEB_FEATURES]: defaultWebFeatures,
      },
      remoteConfig: getFirebaseRemoteConfig(),
    });
  }
  return cachedFlags;
};
