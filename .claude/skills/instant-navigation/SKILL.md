---
name: instant-navigation
description: Use when adding/reviewing a route, layout, or page under apps/web (Cache Components + partialPrefetching is enabled) that reads params, searchParams, cookies(), or headers(), or awaits any data — decides Stream (Suspense) vs Cache ("use cache") vs Block (instant = false) so client-side navigation into it behaves intentionally instead of throwing an unaddressed dev-overlay error.
---

# Instant Navigation (Cache Components) decision guide

`apps/web` runs with `cacheComponents: true` and `partialPrefetching: true` (`packages/next-config/src/config.ts`), plus the framework-default `instantInsights.validationLevel: "warning"`. In development, Next.js simulates client-side navigation into every Page/Default segment and throws a console error naming the first component that would block an "instant" shell — any `params`/`searchParams`/`cookies()`/`headers()` read, or unawaited data fetch, that isn't wrapped in `<Suspense>` or `"use cache"`. This is dev-only noise (`validationLevel: 'warning'` — "the build is unaffected") but it's real signal about a genuine layout/page property, not a lint nag to silence blindly.

Full background/investigation: see [[instant_navigation_cache_components]] memory.

## The three options, per Next.js 16.3's own framing

For each place a segment does something a navigation could wait on, pick one:

1. **Stream** — wrap the read in `<Suspense fallback={...}>`. Use when the data is genuinely per-request/dynamic (a cookie-gated value, a live query) and a brief loading state is an acceptable UX for it.
2. **Cache** — mark the async function `"use cache"` (or `"use cache: private"` for something that reads `cookies()`/`headers()` but is safe to memoize). Use when the value can be reused across requests/users.
3. **Block** — `export const instant = false` on the layout/page. Use when the segment does something that **can't** be deferred behind Suspense because it decides _whether_ to render at all (e.g. `notFound()` gating) or is cheap enough that "instant" isn't worth chasing. This is a first-class, intentional choice per Next's docs — not a workaround.

## Decision rule for this codebase specifically

- **A layout that gates rendering with `notFound()` or must run `setRequestLocale()`/similar before any child renders** (e.g. `app/(marketing)/[locale]/layout.tsx`, `app/(workspace)/[locale]/layout.tsx`, both wrapping `components/layout/locale-layout-shell.tsx`'s `await params`) → **Block** (`instant = false`). A gate like this can't move behind Suspense — Suspense only defers _display_, not the decision to render children at all. Both `[locale]` layouts already have `instant = false` set — copy this pattern for any new top-level gating layout (e.g. a future tenant/workspace-id segment that validates and 404s).
- **A Server Component that reads `cookies()`/`headers()` to produce _optional/optimistic_ initial state** (e.g. `components/providers/guest-session-initial-state.tsx`, which only checks cookie _presence_ to skip a redundant round-trip — the app already has a correct fallback without it) → **Stream**: wrap it in `<Suspense fallback={<FallbackWithoutThatState>...}>` the way `app/(workspace)/layout.tsx` already does. Do not "fix" a validator error here by ripping out the Suspense or converting it to `instant = false` — the pattern is already correct per Next's docs.
  - Known caveat (Next.js 16.3 Preview, confirmed in the official blog's "Known issues" section): the validator can still misreport a route as blocking when `partialPrefetching` interacts with `params`/request data inside an already-correctly-Suspense-wrapped shell, and this specific combination is an acknowledged unresolved preview bug, not a code defect. If a new warning shows this shape (Suspense already present, error still fires, pointing at a component that doesn't itself read request data), don't restructure reflexively — check the installed `next` version's changelog first ([[verify_against_installed_version_not_generic_docs]]), then treat it as a probable validator quirk before assuming the code is wrong.
- **A genuinely expensive/slow async operation** (external API call, DB query, non-trivial computation) that a future route introduces → prefer **Cache** (`"use cache"`) if the result can be shared across requests/users, otherwise **Stream**.

## What NOT to do

- Don't chase full "instant" compliance across the whole app as a goal in itself. The validator targets apps whose bottleneck is per-request data latency; this app's blocking points are cheap synchronous gates (locale validation, cookie-presence checks), where the SPA-like navigation payoff is close to zero. Restructuring i18n routing or auth/session bootstrapping specifically to satisfy this validator is not worth it while the feature is still `preview`-tagged and has open bugs in exactly this area.
- Don't reach for `instant = false` reflexively on every warning — check first whether the flagged read is trivially Suspense-able (most `cookies()`/`headers()` reads for _optional_ initial state are). Block is for structural gates, not a blanket escape hatch.
