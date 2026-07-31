import { getRuntimeEnv } from "@cs/env/universal";
import type { FlagAdapter } from "@cs/flags";
import { createFlagsEngine } from "@cs/flags";
import { createFirebaseAdapter } from "@cs/flags/firebase";
import { REMOTE_CONFIG_KEYS } from "@cs/flags/keys";
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
    // Pre-existing key, kept always-on/long-lived rather than a timed
    // rollout — treat as "config", not "release" (see runbook §3-4).
    governance: { owner: "platform", type: "config" },
  },
});

let engine: ReturnType<typeof createFlagsEngine<typeof flagSchema>> | undefined;

/**
 * Every value is `source: "static"`, which `engine.getValue()` treats as
 * "no adapter value available yet" and falls through to the schema default
 * — the exact same output a real (not-yet-`init()`-ed) Firebase adapter
 * produces. Used to skip touching Firebase entirely on the server.
 */
const serverNoopAdapter: FlagAdapter = {
  getRawValue: () => ({
    asBoolean: () => false,
    asNumber: () => 0,
    asString: () => "",
    source: "static",
  }),
  init: () => Promise.resolve(),
};

/**
 * Lazily builds the flags engine — same reasoning as lib/firebase.ts: the
 * Remote Config instance depends on `getRuntimeEnv()`, so it can't be
 * constructed at module top-level.
 *
 * `FlagsProvider` (a Client Component) still gets server-rendered as part of
 * the static shell during prerendering/SSR — `firebase/remote-config` is a
 * browser-only SDK (see `createFirebaseAdapter`'s guard), so constructing
 * the real adapter there would throw. A server render never calls `init()`
 * anyway (that only happens client-side, in a `useEffect`), so the real
 * adapter wouldn't have produced anything but schema defaults there either —
 * the noop adapter is behaviorally identical, just without touching Firebase.
 */
export const flagsEngine = () => {
  if (typeof window === "undefined") {
    return createFlagsEngine({
      adapter: serverNoopAdapter,
      schema: flagSchema,
    });
  }
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
