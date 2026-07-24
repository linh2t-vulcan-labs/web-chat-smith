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
import { publicSchemaEntries } from "./schema";
import { publicEnv } from "./server";

// Escape `<` so a value containing "</script>" can't break out of the inline
// script tag — required since this is rendered via dangerouslySetInnerHTML.
const serializeForInlineScript = (value: unknown): string =>
  JSON.stringify(value).replaceAll("<", "\\u003c");

export const PublicEnvScript = () => {
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
