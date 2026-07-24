# `@cs/security`

Per-request runtime security helpers (middleware) for Next.js apps.

---

## Purpose

Split out of `@cs/next-config` — that package only builds a static `next.config.ts` object at config-load time; it must not contain code that runs per-request. This package holds the part that does:

- `./proxy` — `buildCsp()`: serialize the Content-Security-Policy header value from runtime env (`@cs/env`), for use in a middleware/`proxy.ts` file. `next.config.ts`'s `headers()` can't do this itself — it's evaluated at build time and can't see container-start env the way `@cs/env`'s runtime-config bridge does.

The CSP directive builders (`buildCspDirectives`, `serializeCsp`, the `CSP_*` host-allowlist constants, `toDomainWildcard`) live entirely inside this package (`src/csp.ts`, `src/constants.ts`, `src/utils.ts`) — this app only ever builds CSP from runtime env, never from build-time config, so there's no shared build-time/runtime CSP code to reuse from `@cs/next-config`. `@cs/next-config` still owns the other static security headers (HSTS, COOP, X-Frame-Options, etc.) that don't depend on runtime env — see its README.

> **No nonce.** This package used to also generate a per-request CSP nonce (`buildCspContext`/`buildCspProxy`) plus a `./server` export (`getNonce`) to read it back in a Server Component, paired with `'strict-dynamic'` in `script-src`. That was removed: it requires every page using it to render dynamically, which is fundamentally incompatible with `cacheComponents`/Partial Prerendering (confirmed against a real build+deploy — a cached static shell and a fresh per-request nonce diverge, blocking every script on some requests) — see the [Next.js CSP guide's "Static vs Dynamic Rendering with CSP" section](https://nextjs.org/docs/app/guides/content-security-policy#static-vs-dynamic-rendering-with-csp). This app's actual UGC/XSS surface (no `dangerouslySetInnerHTML` on user/LLM content, no raw-HTML markdown rendering) doesn't currently justify that cost. `script-src`/`script-src-elem` now use `'unsafe-inline'` with a host allowlist instead — see `packages/next-config/README.md`'s CSP notes. Reintroduce nonce-based CSP only for a specific route that actually renders untrusted HTML, not app-wide.

## Usage

```ts
// proxy.ts (or middleware.ts)
import { buildCsp } from "@cs/security/proxy";

export default function proxy(request: NextRequest) {
  const response = /* ...compose with any other middleware... */;
  response.headers.set("Content-Security-Policy", buildCsp());
  return response;
}
```

See `apps/web/proxy.ts` for the reference wiring.

## Which apps use this

- **`apps/web`** — wired in (`proxy.ts`). `@cs/next-config` never builds a CSP header at all, so there's no static header to skip — the proxy is the only source of the (env-accurate) CSP.
- **`apps/super-app`** — **intentionally not wired in.** Its `src/proxy.ts` is legacy/reference code (auth-v2 middleware chain, i18n, robots-tag handling) that predates this package. Do not add `@cs/security` to super-app unless a human explicitly asks for it — it is out of scope for routine shared-package changes. See `packages/next-config/README.md` for the related `cacheComponents` note.

## Package boundary

Tagged `shared` in `turbo.json` (same tier as `@cs/next-config`, `@cs/env`).

- **MAY** depend on: `@cs/env`, `next` (peer)
- **MUST NOT** depend on: `@cs/next-config`, `@cs/ui`, or any package tagged `ui`/`app`
