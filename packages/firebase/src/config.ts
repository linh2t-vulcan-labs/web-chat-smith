import { requireServerVar } from "@cs/env/helpers";
import { getRuntimeEnv } from "@cs/env/universal";
import type { FirebaseOptions } from "firebase/app";

/**
 * Parses the JSON-serialized Firebase web config blob (e.g. the
 * `CS_PUBLIC_FIREBASE_AUTH_CONFIG` env var validated by `@cs/env`'s schema —
 * that schema only checks "parses as JSON", not the Firebase config shape).
 *
 * Kept as its own pure string-in/object-out function (not folded into
 * {@link getFirebaseConfigFromEnv}) so callers who source the raw config
 * differently (e.g. a test double, a non-`@cs/env` app) can still reuse it.
 */
export const parseFirebaseConfig = (rawConfig: string): FirebaseOptions => {
  const parsed: unknown = JSON.parse(rawConfig);
  if (typeof parsed !== "object" || parsed === null) {
    throw new TypeError(
      `[@cs/firebase] parseFirebaseConfig: expected a JSON object, got ${typeof parsed}`
    );
  }
  return parsed as FirebaseOptions;
};

/**
 * Reads and parses `CS_PUBLIC_FIREBASE_AUTH_CONFIG` from `@cs/env` — the
 * config var already declared in `packages/env/src/schema.ts` for this exact
 * purpose. Call this inside a function (e.g. `getFirebaseApp(getFirebaseConfigFromEnv())`
 * at call time), never at module top-level, same rule as `getRuntimeEnv()`
 * itself: Next.js evaluates a client module's top-level scope during the
 * build, before `window.__CS_ENV__` exists.
 */
export const getFirebaseConfigFromEnv = (): FirebaseOptions => {
  const raw = requireServerVar(
    "CS_PUBLIC_FIREBASE_AUTH_CONFIG",
    getRuntimeEnv().CS_PUBLIC_FIREBASE_AUTH_CONFIG
  );
  return parseFirebaseConfig(raw);
};
