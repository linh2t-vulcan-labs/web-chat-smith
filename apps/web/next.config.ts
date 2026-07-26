import { createNextIntlConfig } from "@cs/i18n/config";
import { createNextConfig } from "@cs/next-config";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin(
  createNextIntlConfig({
    messagesPath: "./messages",
    requestConfig: "./i18n/request.ts",
    srcPath: ["./app", "./components", "../../packages/ui/src"],
  })
);

// `cacheComponents: true` requires the standalone production server to run
// under real Node.js — `package.json`'s `start` script is
// `node .next/standalone/apps/web/server.js`, deliberately NOT
// `bun run .../server.js`. Verified directly: running the same
// `server.js` via Bun logs "Next.js cannot guarantee that Cache Components
// will run as expected due to the current runtime's implementation of
// `setTimeout()`" and then throws a repeating unhandled `AbortError` on
// every request (no application stack frames — purely Bun/Next internals).
// Switching the exact same build to `node server.js` produces neither
// symptom. `next dev`/`next build` (both still run via `bun -bun next ...`)
// are unaffected — this is specific to executing the compiled standalone
// server, not the Next.js CLI itself.
// Bun's `node_modules/.bun/<pkg>@<version>+<hash>/node_modules/...` store
// layout confuses Next's output-file-tracing for `output: "standalone"` —
// verified directly: the standalone trace only copied `@swc/helpers`'s
// `cjs/` subfolder, not `esm/`, even though this app is `"type": "module"`
// and needs the ESM entrypoint at runtime (`node .next/standalone/.../server.js`
// threw `Cannot find module '.../@swc/helpers/esm/_interop_require_default.js'`
// until this was added). This is Next's own documented escape hatch for
// exactly this failure mode (see `outputFileTracingIncludes` in Next's
// `output` docs) — not something fixable via `next.config` cache/experimental
// flags.
const swcHelpersGlob =
  "../../node_modules/.bun/@swc+helpers*/node_modules/@swc/helpers/**/*";

export default withNextIntl(
  createNextConfig({
    cacheComponents: true,
    outputFileTracingIncludes: {
      "/*": [swcHelpersGlob],
    },
    partialPrefetching: true,
    publicRuntimeConfig: {
      isProd: process.env.NODE_ENV === "production",
      webUrl: "http://localhost:3000",
    },
  })
);
