// @cs/validation — single shared entry point for zod across the monorepo.
//
// Always `zod/mini`, never full `zod`: mini's functional API (no method
// chaining — `z.optional(x)`, `z.pipe(a, b)`, `.check(z.minLength(...))`
// instead of `.optional()`, `.min()`) is deliberately more verbose in
// exchange for a much smaller bundle — see https://zod.dev/packages/mini.
// Import zod through this package (not `"zod/mini"` directly) so that
// choice stays structural instead of tribal knowledge.
//
// Zod Mini never loads a default locale by default (bundle-size tradeoff,
// see https://zod.dev/packages/mini#no-default-locale) — an unmapped
// issue's `message` would otherwise be the literal string "Invalid input"
// instead of something like "Expected string, received number".
//
// Every check that carries user/developer-actionable meaning (env var
// validation, business rules) MUST still pass its own explicit message —
// that text is what @cs/env's parse errors and any future product-defined
// validation surface, and none of it may be replaced by zod's generic
// English copy. UI-facing text is never sourced from a zod issue's
// `message` anywhere in this repo — it's always driven by `ApiError.reason`
// through the `ApiErrors` i18n namespace (Product-owned copy). Zod's own
// `message` only ever reaches a thrown Error / dev console / `cause` — e.g.
// unannotated structural checks like a bare `z.string()`/`z.number()` in an
// api-client response schema, where writing a custom message per field
// would be pure boilerplate for zero real benefit.
//
// So: load the English locale, but ONLY outside production, so a
// structural mismatch reads as "Expected string, received number" instead
// of "Invalid input" during local/staging debugging — with zero
// production bundle cost, since Next.js inlines `NODE_ENV` and dead-code
// eliminates this branch in production builds.
//
// Import the locale from its own submodule (`zod/v4/locales/en.js`), never
// via `z.locales.en()`: `z.locales` is a namespace re-export that funnels
// through zod's internal `core/index.js` → `locales/index.js` barrel, which
// re-exports all ~49 locale files. Webpack/Turbopack's usedExports
// tree-shaking marks that whole barrel as "used" the moment `z.locales` is
// referenced anywhere in the graph — evaluated before Terser's dead-code
// elimination strips this NODE_ENV-guarded branch — so every locale file
// ends up shipped in production regardless. A deep import bypasses the
// barrel entirely so only `en.js` is ever reachable.
// oxlint-disable-next-line unicorn/prefer-export-from -- `z` must be a local binding here (not just re-exported) to call the dev-only locale config below
import * as z from "zod/mini";
import en from "zod/v4/locales/en.js";

if (process.env.NODE_ENV !== "production") {
  z.config(en());
}

export { z };
export * from "./report";
