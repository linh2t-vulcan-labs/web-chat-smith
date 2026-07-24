# `@cs/next-config`

Shared Next.js configuration factory for Chat Smith app

---

## Purpose

Provides `createNextConfig()` — an opinionated Next.js config factory that all ChatSmith apps use as their base. Includes:

- `output: "standalone"` for Docker/GKE self-hosted deployment
- Static security HTTP headers (env-independent): HSTS (prod), COOP, COEP, X-Frame-Options, Referrer-Policy — CSP itself is **not** built here, see below
- Immutable cache headers for `/_next/static/*` and `/assets/*`
- Sane defaults: `reactStrictMode`, `poweredByHeader: false`, `typedRoutes`, `compress`
- Per-environment behaviour: dev logging, dev CSP localhost sources, prod HSTS
- `allowedDevOrigins` auto-populated from `NEXT_PUBLIC_WEB_URL` hostname in non-prod

## Usage

```ts
// apps/<name>/next.config.ts
import { createNextConfig } from "@cs/next-config";

export default createNextConfig();

// With app-specific overrides:
export default createNextConfig({
  basePath: "/my-app",
  serverExternalPackages: ["some-native-pkg"],
  experimental: {
    optimizePackageImports: ["@my/pkg"], // merged with base list
  },
  transpilePackages: ["@my/pkg"], // merged, deduped
  headers: async () => [
    // appended after default security routes
    { source: "/api/:path*", headers: [{ key: "X-My-Header", value: "1" }] },
  ],
});
```

## Exports

| Symbol | Purpose |
| --- | --- |
| `createNextConfig` | Main factory — returns a `NextConfig` |
| `buildSecurityHeaders` | Build the static (env-independent) security header entries |
| `toDomainWildcard` / `isNonEmptyString` | Small pure helpers used internally for `allowedOrigins` |
| `BASE_TRANSPILE_PACKAGES` | Base packages always transpiled |
| `BASE_OPTIMIZE_PACKAGES` | Base packages in `optimizePackageImports` |
| `ASSETS_ROUTE` | `/assets/:path*` route pattern |
| `PAGE_ROUTE` | `/:path((?!api).*)*` route pattern |
| `NEXT_STATIC_ROUTE` | `/_next/static/:path*` route pattern |
| `IMMUTABLE_CACHE_CONTROL` | `public, max-age=31536000, immutable` |

## Package boundary

This package is tagged `shared` in `turbo.json` (see the root `turbo.json` `boundaries.tags` map — the actual tiers are `tools` / `foundation` / `shared` / `ui` / `app`, not the `pkg:*` naming this doc used to describe).

- **MAY** depend on: `@cs/ts-config`, `next` (peer)
- **MUST NOT** depend on: `@cs/ui`, `@cs/env`, `@cs/security`, or any package tagged `ui`/`app`
- Everything in this package runs at config-load time (Node, once), never per-request — that's the whole reason CSP building lives in `@cs/security` instead. Do not add anything here that touches `next/server`, `next/headers`, or reads env at request time.

## CSP building lives entirely in `@cs/security`, not here

This app only ever builds CSP from runtime (container-start) env, never from build-time config — there is no static-CSP use case to serve, now or planned. So `@cs/next-config` doesn't build a CSP header at all: no `buildCspDirectives`/`serializeCsp`/`disableCsp` option, no `CSP_*` constants. `buildSecurityHeaders` here only produces the headers that genuinely don't depend on request-time env (HSTS, COOP, X-Frame-Options, Referrer-Policy, Permissions-Policy).

`buildCsp()` (middleware) lives in `@cs/security/proxy` — it runs per-request and imports `next/server` / `@cs/env`, neither of which belong in a package whose whole job is building a static config object. It owns its own copy of the CSP directive builders and host-allowlist constants (`packages/security/src/csp.ts`, `constants.ts`) — no dependency back on `@cs/next-config`.

Currently wired into **`apps/web` only**. `apps/super-app`'s `src/proxy.ts` is legacy/reference middleware (auth-v2 chain, i18n, robots-tag) that predates this split — it is **not** migrated to `@cs/security`, and should not be, without an explicit request. See `packages/security/README.md`.

## `partialPrefetching` requires `cacheComponents`

Neither flag is a default here anymore. `partialPrefetching: true` alone used to be a forced default and threw at config validation the moment an app tried to build (`partialPrefetching requires cacheComponents to be enabled`) — Next validates this at `next build`/`next dev`, not just via types, so it's easy to ship broken. Cache Components is also a real semantic change to data fetching/caching, not something to force on every consumer silently.

Apps that want both must opt in explicitly:

```ts
createNextConfig({
  cacheComponents: true,
  partialPrefetching: true,
});
```

`apps/web` opts in. `apps/super-app` does not (legacy/reference, left as-is).

## Env vars consumed

| Var | Used for |
| --- | --- |
| `NEXT_PUBLIC_ENV_NAME` | Toggle prod vs dev behaviour (HSTS on/off) |
| `NEXT_PUBLIC_WEB_URL` | `serverActions.allowedOrigins`; `allowedDevOrigins` hostname in dev |
| `NEXT_PUBLIC_COOKIE_DOMAIN` | `serverActions.allowedOrigins` domain wildcard (`*.cookieDomain`) |
| `APP_RELEASE` | `deploymentId` fallback |

CSP-specific env vars (`NEXT_PUBLIC_API_BASE_URL`, etc.) are read directly by `@cs/security` at request time, not by this package — see `packages/security/README.md`.

## Dev origins

In non-production builds, the hostname of `NEXT_PUBLIC_WEB_URL` is automatically added to `allowedDevOrigins`. This allows the Caddy gateway (e.g. `local.chatsmith.io`) to reach the Next.js dev server without CORS issues.

Apps may append extra origins via `overrides.allowedDevOrigins`.

## Extending headers

Default security headers are always applied and cannot be removed by `overrides`. App-level `headers` overrides are **appended** after the defaults:

```ts
createNextConfig({
  headers: async () => [
    // appended AFTER the default security routes
    { source: "/api/:path*", headers: [{ key: "X-My-Header", value: "1" }] },
  ],
});
```

To customise a specific header, export and consume `buildSecurityHeaders` directly.

## CSP notes

CSP is not built in this package at all — see "CSP building lives entirely in `@cs/security`" above. For CSP directive details (dev/prod sources, no-nonce rationale, host allowlist) see `packages/security/README.md`.

## Transpile packages (auto-included)

`BASE_TRANSPILE_PACKAGES` (`constants.ts`) always ships in `transpilePackages`, without needing `overrides.transpilePackages`. It's every workspace package that ships raw TypeScript/TSX (no build step) and is reachable — directly or transitively — from at least one app's runtime import graph:

```txt
@cs/api-client  — raw TS; also pulls in @cs/validation
@cs/env         — raw TS
@cs/flags       — raw TS (apps/super-app)
@cs/i18n        — raw TS
@cs/icons       — raw TSX
@cs/next-config — raw TS; imported directly by each app's next.config.ts
@cs/security    — raw TS (apps/web's proxy.ts + layout.tsx)
@cs/themes      — raw TS; also pulls in @cs/icons
@cs/ui          — raw TS (CSS export is separate, doesn't need transpiling)
@cs/validation  — raw TS (pulled in via @cs/env, @cs/api-client)
```

`@cs/design-tokens` is deliberately excluded — it only exports `.css`, nothing for a JS/TS compiler to transpile. `@cs/ts-config` is excluded too — dev-only tsconfig files, never imported at runtime.

App thêm package khác vào `overrides.transpilePackages` — chúng sẽ được merge (dedup) với list trên.

**Lưu ý:** dưới Turbopack (bundler mặc định của repo này) — và cả webpack cho App Router — Next.js **tự động transpile workspace packages**, không cần khai báo (xem `transpilePackages.md`: _"Turbopack transpiles workspace packages ... automatically under both routers. Webpack does the same for the App Router."_). List này chỉ thực sự cần khi build rơi vào Pages Router, hoặc khi có một dependency thật trong `node_modules` (không phải workspace) ship raw TS. Giữ lại chủ yếu để tự document dependency graph.

## Experimental features (mặc định bật)

| Option | Giá trị | Lý do |
| --- | --- | --- |
| `taint: true` | enabled | Ngăn server secrets cross sang client bundle (React Taint API) — per file 20 |
| `optimizePackageImports` | `BASE_OPTIMIZE_PACKAGES` (`radix-ui`, `@base-ui/react`, `motion`, `react-syntax-highlighter`, `konva`, `react-konva`, `@tanstack/react-table`, `zod/mini`) | Tree-shake các third-party package có nhiều named export. Next.js đã tự động optimize sẵn một số package phổ biến khác (`lucide-react`, `date-fns`, `lodash-es`, `@headlessui/react`, ...) — không cần khai báo lại |
| `serverActions.bodySizeLimit` | `"1mb"` | Default; tăng chỉ khi upload file qua Server Actions |
| `sri.algorithm` | `"sha256"` | Subresource Integrity cho static assets |

## TypeScript build errors

```ts
typescript: {
  ignoreBuildErrors: true, // temporary escape hatch
}
```

**Đây là escape hatch tạm thời** trong quá trình ST→LT migration (file 01 § migration). TypeScript errors sẽ **không** fail production build trong giai đoạn này. Khi nào TypeScript fully aligned giữa tất cả apps, option này sẽ được xóa. Dùng `bun run typecheck` để vẫn catch errors trong CI.

## Standalone start script

Apps built với `output: "standalone"` start via:

```bash
node .next/standalone/server.js
```

Set `PORT` và `HOSTNAME` qua environment variables (`.env.production.local` locally, actual env trong GKE).
