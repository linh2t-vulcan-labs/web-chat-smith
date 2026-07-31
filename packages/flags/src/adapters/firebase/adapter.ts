import { fetchAndActivate, getValue } from "firebase/remote-config";
import type { RemoteConfig, Value } from "firebase/remote-config";

import type { FlagAdapter, RawFlagValue } from "../../core/types";
import type { FlagSchema } from "../../schema";

/**
 * Firebase only accepts `string | number | boolean` in `defaultConfig`, so
 * object/array defaults are serialized to JSON strings — the schema's typed
 * getters still use the original (unserialized) default as their fallback.
 */
const toFirebaseDefaultConfig = (
  schema: FlagSchema
): Record<string, string | number | boolean> => {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, entry] of Object.entries(schema)) {
    const { defaultValue } = entry;
    if (typeof defaultValue === "object" && defaultValue !== null) {
      out[key] = JSON.stringify(defaultValue);
    } else if (
      typeof defaultValue === "string" ||
      typeof defaultValue === "number" ||
      typeof defaultValue === "boolean"
    ) {
      out[key] = defaultValue;
    }
  }
  return out;
};

const toRawFlagValue = (value: Value): RawFlagValue => ({
  asBoolean: () => value.asBoolean(),
  asNumber: () => value.asNumber(),
  asString: () => value.asString(),
  source: value.getSource(),
});

/**
 * The only file in this package that imports `firebase/remote-config`.
 * Implements {@link FlagAdapter} so the engine, schema, and experiments layer
 * never see a Firebase type.
 *
 * The `RemoteConfig` instance (fetch/timeout settings) is owned by the
 * caller — create it with `getFirebaseApp`/`getRemoteConfig` from
 * `@cs/firebase`.
 */
export const createFirebaseAdapter = (
  remoteConfig: RemoteConfig,
  schema: FlagSchema
): FlagAdapter => ({
  getRawValue: (key) => toRawFlagValue(getValue(remoteConfig, key)),
  init: async () => {
    // `firebase/remote-config` is a browser-only SDK (relies on IndexedDB) —
    // there is no supported way to run it in a Server Component/Route
    // Handler (Firebase's own SSR guide only covers Auth/Firestore/App Check,
    // not Remote Config). Throwing a clear message here beats letting the
    // engine's catch-all report a cryptic IndexedDB error — see
    // docs/runbook/flags-and-release-workflow.md §5.
    if (typeof window === "undefined") {
      throw new TypeError(
        "[@cs/flags/firebase] createFirebaseAdapter only runs in the browser. " +
          "Don't call engine.init() from a Server Component/Route Handler — " +
          "gate the flag-dependent UI behind a client subtree instead (see " +
          "docs/runbook/flags-and-release-workflow.md §5)."
      );
    }
    remoteConfig.defaultConfig = toFirebaseDefaultConfig(schema);
    await fetchAndActivate(remoteConfig);
  },
});
