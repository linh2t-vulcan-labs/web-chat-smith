# syntax=docker/dockerfile:1
#
# Multi-stage build for apps/web (Next.js, Cache Components/PPR enabled).
# Build context is the repo root (turbo prune needs the whole monorepo) —
# build from root with `-f tools/docker/Dockerfile .`.
#
# Build once, deploy many: this image is built exactly once per commit by CI
# (tagged by git SHA — see docs/runbook/flags-and-release-workflow.md §8 and
# docs/runbook/deployment.md) and the same image is promoted staging → prod,
# never rebuilt per environment.
#
# Runtime is `bun` end-to-end, matching this repo's package manager — no
# Node anywhere in this image. (An earlier revision of this file used a
# `node:22-alpine` runtime stage over a since-corrected belief that Bun's
# `setTimeout()` broke Next's Cache Components cache-expiration timers —
# re-verified directly against this exact build/bun version with multiple
# PPR/dynamic routes and a wait period: no warning, no AbortError. If that
# ever resurfaces, it's a regression to investigate, not a reason to
# silently reintroduce Node.)
#
# All `CS_PUBLIC_*` config is read at runtime only (Vault-injected into the
# container's env) — nothing is baked in at build time. This required fixing
# two routes that were eagerly reading env during static prerendering
# instead of deferring to request time; see apps/web/lib/flags.ts's
# `serverNoopAdapter` and apps/web/app/firebase-messaging-sw.js/route.ts's
# `connection()` call.

FROM oven/bun:1.3.14-alpine AS base

# ---- Prune the monorepo down to what apps/web actually needs ----
FROM base AS pruner
WORKDIR /repo
RUN bun add --global turbo@^2
COPY . .
RUN turbo prune web --docker

# ---- Install deps (cached by lockfile) + build ----
FROM base AS installer
WORKDIR /repo
# out/json only has the package.json files touched by the prune, so
# `bun install` here is cached independently of any application source change.
COPY --from=pruner /repo/out/json/ .
# --ignore-scripts: root `prepare` runs `lefthook install`, a git-hooks setup
# step that needs `git` (not in this image) and is meaningless in a container
# build anyway — it's a dev-machine-only concern.
#
# --linker=hoisted: Bun's default "isolated" linker stores real package
# contents under node_modules/.bun/<pkg>@<version>/... and symlinks
# node_modules/<pkg> to it. Next's standalone output tracer (`@vercel/nft`)
# doesn't fully follow that nested-symlink structure for every transitive
# dependency — confirmed directly: the resulting standalone server.js threw
# `Cannot find module '.../node_modules/.bun/next@.../node_modules/@swc/
# helpers/esm/_interop_require_default.js'` at runtime, i.e. the traced
# output referenced a path that was never actually copied. `--linker=hoisted`
# produces a conventional npm-style node_modules tree (no .bun store), which
# the tracer handles the same way it does for npm/yarn/pnpm projects.
RUN bun install --frozen-lockfile --ignore-scripts --linker=hoisted
COPY --from=pruner /repo/out/full/ .

# Also requires `turbo.json`'s `build` task to declare `"env": ["CS_PUBLIC_*"]`
# — confirmed directly: Turborepo's default strict environment mode silently
# strips any shell/Docker-set env var from a task unless it's declared there
# (it only auto-passes `NEXT_PUBLIC_*` via framework inference, not this
# repo's `CS_PUBLIC_*` convention). This only matters at all if some future
# route goes back to reading a `CS_PUBLIC_*` var eagerly during prerendering
# — the fix for that is to defer the read to request time (see the two
# examples referenced above), not to add a build arg.
RUN bun run build --filter=web

# ---- Runtime: standalone Next.js server, executed with Bun ----
FROM base AS runner
WORKDIR /repo
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# `output: "standalone"` (packages/next-config) traces only the deps actually
# used at runtime — this is the whole reason the runner stage doesn't need
# the installer stage's full node_modules at all.
COPY --from=installer --chown=nextjs:nodejs /repo/apps/web/.next/standalone/ ./
COPY --from=installer --chown=nextjs:nodejs /repo/apps/web/.next/static ./apps/web/.next/static
# apps/web/public doesn't exist yet at the time of writing — add it back here
# the day a `public/` directory is introduced:
# COPY --from=installer --chown=nextjs:nodejs /repo/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["bun", "run", "apps/web/server.js"]
