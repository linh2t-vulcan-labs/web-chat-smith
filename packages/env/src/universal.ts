// @cs/env/universal — isomorphic accessor for modules that run in
// BOTH the server and client bundle (e.g. an API-client factory instantiated
// once per side in a shared barrel file — core/repositories/index.ts is the
// canonical example). Never call this at module top-level scope, same rule
// as getPublicEnv(): Next.js evaluates a client module's top-level scope
// during the build, before window.__CS_ENV__ exists.
import { getPublicEnv } from "./client";
import type { PublicEnv } from "./schema";
import { publicEnv } from "./server";

export const getRuntimeEnv = (): PublicEnv =>
  typeof window === "undefined" ? publicEnv : getPublicEnv();
