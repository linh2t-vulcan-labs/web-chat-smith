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
    remoteConfig.defaultConfig = toFirebaseDefaultConfig(schema);
    await fetchAndActivate(remoteConfig);
  },
});
