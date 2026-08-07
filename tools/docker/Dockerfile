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
# Build AND runtime run on `node:24-alpine`, not Bun — Bun 1.3.x has a
# confirmed, still-open upstream bug where its own JS engine segfaults
# tearing down worker threads that loaded a native (napi) module, hitting
# `next build`'s "Finalizing page optimization" phase every single time in
# this repo's Docker build (reproduced identically on musl and glibc — same
# crash offset/signature either way). Confirmed as a known Bun issue, not
# app code: https://github.com/oven-sh/bun/issues/25864 and
# https://github.com/oven-sh/bun/issues/23944. `bun` is still copied into
# the `base` stage below — it's still needed for `bun install`/`turbo prune`
# (this workspace's `bun.lock` + catalogs), just never used to execute
# `next build`/the server. Don't move build/runtime back to Bun without
# first checking whether those upstream issues are closed in a specific
# released version, and re-testing that the exact failure (crash right
# after the route table prints, at "Finalizing page optimization") is
# actually gone.
#
# (An even earlier revision used a `node:22-alpine` runtime stage over a
# separate, since-corrected belief that Bun's `setTimeout()` broke Next's
# Cache Components cache-expiration timers — re-verified directly: no
# warning, no AbortError. That timer concern stays debunked; this is an
# unrelated, real bug that resurfaced the same node-vs-bun question.)
#
# All `CS_PUBLIC_*` config is read at runtime only (Vault-injected into the
# container's env) — nothing is baked in at build time. This required fixing
# two routes that were eagerly reading env during static prerendering
# instead of deferring to request time; see apps/web/lib/flags.ts's
# `serverNoopAdapter` and apps/web/app/firebase-messaging-sw.js/route.ts's
# `connection()` call.

FROM node:24-alpine AS base
COPY --from=oven/bun:1.3.14-alpine /usr/local/bin/bun /usr/local/bin/bun
# `bun add --global` installs into `$BUN_INSTALL/bin` (`~/.bun/bin` by
# default) — the official Bun image puts that on `PATH` itself; a plain
# `node:24-alpine` base doesn't, so `turbo` (installed globally via Bun
# below) wouldn't otherwise be found.
ENV PATH="/root/.bun/bin:${PATH}"
# Silences Turborepo's anonymous telemetry banner/upload for both `turbo
# prune` (pruner stage) and `bun run build` (which shells out to turbo).
ENV TURBO_TELEMETRY_DISABLED=1
# Silences Next.js's own anonymous telemetry banner during `next build`
# (installer stage).
ENV NEXT_TELEMETRY_DISABLED=1

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

# ---- Runtime: standalone Next.js server, executed with Node ----
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
COPY --from=installer --chown=nextjs:nodejs /repo/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "apps/web/server.js"]
