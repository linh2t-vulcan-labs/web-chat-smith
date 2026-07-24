// @cs/env/client — browser accessor for CS_PUBLIC_* vars.
//
// #1 RULE: never call getPublicEnv() at module top-level scope. Next.js
// executes a client module's top-level scope during the build (before
// `window.__CS_ENV__` exists), so an eager read throws or silently freezes
// an undefined value into the module — always call it inside a function,
// component body, or effect, at render/call time.
import type { PublicEnv } from "./schema";

declare global {
  interface Window {
    // Typed as the full PublicEnv, not Partial: <PublicEnvScript /> (see
    // ./bridge) serializes every schema key, since all of them are non-secret
    // by definition (assertAllPublic() in ./schema enforces this).
    __CS_ENV__?: PublicEnv;
  }
}

let cached: PublicEnv | null = null;

export const getPublicEnv = (): PublicEnv => {
  if (typeof window === "undefined") {
    throw new TypeError(
      "[@cs/env] getPublicEnv() was called on the server. Use `publicEnv` from @cs/env/server instead."
    );
  }
  if (cached === null) {
    if (window.__CS_ENV__ === undefined) {
      throw new Error(
        "[@cs/env] window.__CS_ENV__ is missing — <PublicEnvScript /> did not render before this read."
      );
    }
    cached = window.__CS_ENV__;
  }
  return cached;
};
