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
    // `firebase/remote-config`'s own type declarations say so explicitly —
    // "This SDK does not work in a Node.js environment" (verified directly
    // against the installed @firebase/remote-config, both its CJS and ESM
    // builds ship the same warning). It falls back to in-memory storage when
    // IndexedDB is missing rather than throwing, but that path isn't
    // supported or tested by Firebase, so don't rely on it — not even via
    // `FirebaseServerApp`, which only extends Auth/Firestore/App Check to
    // SSR per Firebase's own SSR guide, not Remote Config. Throwing a clear
    // message here beats letting the engine's catch-all report a cryptic
    // IndexedDB error — see docs/runbook/flags-and-release-workflow.md §5.
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
