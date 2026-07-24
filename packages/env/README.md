# @cs/env

Single env package for the whole repo: server secrets + runtime-resolved public (`CS_PUBLIC_*`) config, shared by `apps/super-app`, `apps/web`, and `apps/creative-studio`.

## Server secrets

```ts
import { env } from "@cs/env";

env.JWT_SECRET;
env.SANITY_API_TOKEN;
```

`env` is a lazily-validated singleton over `serverSchemaEntries` — validated once, on first property access, against `process.env`. Never import this from a `"use client"` file.

## Public runtime config (`CS_PUBLIC_*`)

One flat schema (`publicSchemaEntries` in `src/schema.ts`) shared by all three apps — every field is `.optional()`, since each app reads a different subset. Values resolve at container-start/request time, never baked into the JS bundle at `next build`.

- `@cs/env/server` — `publicEnv`, for Route Handlers, Server Components, `import "server-only"` files. Reads live `process.env`.
- `@cs/env/client` — `getPublicEnv()`, for `"use client"` files. Reads `window.__CS_ENV__`. **Never call at module top-level scope.**
- `@cs/env/universal` — `getRuntimeEnv()`, for modules that run in both bundles (e.g. an API-client factory built once per side in a shared barrel). Same never-at-module-scope rule as `getPublicEnv()`.
- `@cs/env/bridge` — `<PublicEnvScript />`, a Server Component that serializes the full public schema into `window.__CS_ENV__` via an inline `<script>`. Render it once, as high in `<head>` as possible, before any client component reads env during hydration.

## Other subpaths

- `@cs/env/helpers` — Zod coercion helpers (`envUrl`, `envNum`, `envBool`, etc).
- `@cs/env/sanity` — Sanity Studio's own `SANITY_STUDIO_*` schema (unrelated build tool, Vite-inlined, untouched by the runtime-env migration).
