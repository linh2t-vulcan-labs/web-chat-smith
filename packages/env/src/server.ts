// @cs/env/server — server-side accessor for CS_PUBLIC_* vars.
// Safe for Route Handlers, Server Components, and server-only libs: reads
// live process.env at request/render time (no build-time inlining).
import { lazyEnv, parseEntries } from "./parse";
import { publicSchemaEntries } from "./schema";
import type { PublicEnv } from "./schema";

export const publicEnv: PublicEnv = lazyEnv(() =>
  parseEntries(publicSchemaEntries, process.env, "public (runtime)")
);
