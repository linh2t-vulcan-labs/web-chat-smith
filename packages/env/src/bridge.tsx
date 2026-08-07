// @cs/env/bridge — Server Component that serializes CS_PUBLIC_* into
// `window.__CS_ENV__` for client components to read via getPublicEnv() (or
// getRuntimeEnv() from ./universal, for code that runs on both sides).
// Serializes every schema key — everything under CS_PUBLIC_* is non-secret by
// definition (assertAllPublic() in ./schema enforces this), and several
// isomorphic modules (e.g. core/repositories/*) build both a server and a
// client instance from the same factory, so no key can be safely omitted.
// Render this once, as high in the document as possible (before any client
// component that reads env during hydration), as a plain blocking <script> —
// not next/script with a deferred strategy.
//
// Must stay excluded from the Cache Components static shell: this app's
// Vault sidecar injects CS_PUBLIC_* into process.env at container start,
// AFTER `next build` runs with none of them set (see
// tools/docker/vault-entrypoint.ts), so a build-time read of `publicEnv`
// bakes in empty values forever. `await io()` opts this component out of
// prerendering (resolves immediately at real request time, so this still
// renders synchronously in the SSR stream — no visible Suspense fallback)
// without blocking prefetches the way `connection()` would. Render inside
// its own `<Suspense>` in the layout, same isolation pattern used for the
// CSP nonce read (see layout-nonce-suspense-boundary memory).
import { io } from "next/cache";

import { publicSchemaEntries } from "./schema";
import { publicEnv } from "./server";

// Escape `<` so a value containing "</script>" can't break out of the inline
// script tag — required since this is rendered via dangerouslySetInnerHTML.
const serializeForInlineScript = (value: unknown): string =>
  JSON.stringify(value).replaceAll("<", "\\u003c");

export const PublicEnvScript = async () => {
  await io();
  const exposed: Record<string, unknown> = {};
  for (const key of Object.keys(publicSchemaEntries)) {
    exposed[key] = publicEnv[key as keyof typeof publicEnv];
  }
  return (
    <script
      // oxlint-disable-next-line react/no-danger -- JSON.stringify output escaped above, not raw HTML/user input
      dangerouslySetInnerHTML={{
        __html: `window.__CS_ENV__=${serializeForInlineScript(exposed)};`,
      }}
      id="__cs_env__"
    />
  );
};
