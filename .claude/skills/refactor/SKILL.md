---
name: refactor
description: Use when cleaning up, splitting, or restructuring existing code without changing its behavior — an oversized file/function, duplicated logic across files, a folder structure that's grown inconsistent, or "tách file/dọn code giúp tôi" requests. Not for adding new features.
---

# Refactor

Refactoring changes structure, not behavior. If the task also needs new behavior, do the behavior change first (via the `implement` skill), then refactor separately — mixing the two in one diff makes it impossible to tell which change caused a regression.

## Before touching anything

- **Confirm there's a passing baseline** (typecheck/tests/lint) before you start — you need to know afterward that you didn't break anything, which requires knowing it worked before.
- **Identify the actual smell**, not just "this file is long." A long file that's one cohesive concern with clear sections isn't automatically wrong. Split when: the file mixes ≥2 unrelated concerns, the same logic is duplicated across ≥2 files, or a function needs internal section comments to explain itself.

## Splitting a file/domain

- Look for an existing convention in a sibling part of the repo first (e.g. this repo's `packages/api-client/src/services/*` — one folder per domain, one file per sub-domain, an `index.ts` that only assembles/re-exports, never a root barrel spanning unrelated domains). Match it rather than inventing a new shape.
- Split along real sub-domain boundaries (what the code is _about_), not arbitrary line-count chunks.
- When a builder/chain pattern can't span multiple files directly (e.g. a fluent API mutating one object), extract each sub-file's contribution as a plain config/data object, and keep one assembly point (often `index.ts`) that wires them into the single object callers already use — the goal is splitting the _definition_, not changing the _public shape_ callers depend on.
- Update every import path touched by the move — grep for the old path (including in comments/docs) rather than trusting the IDE caught everything.

## Removing duplication

- Before extracting a shared helper, confirm the duplicated logic is actually the same thing conceptually (not just currently-identical code that happens to serve two different, coincidentally-matching purposes today — extracting that couples them incorrectly).
- Put the extracted helper where its scope actually is: local to a file if only that file needs it, a domain-shared location if 2+ files in one domain need it, a package-wide `utils/` only if it's truly cross-domain and dependency-free.
- Delete the original duplicated copies in the same change — a "shared helper" that coexists with the old inline copies isn't a refactor, it's more duplication.

## After refactoring

- Diff should show moved/restructured code, not logic changes. If you notice a bug while refactoring, fix it as a clearly separate, called-out step (or a separate commit) — don't bury a behavior fix inside a "just moving things" diff.
- Re-run typecheck/lint/tests — a refactor that doesn't compile isn't done.
- Check for now-stale references: doc comments pointing at the old file path, a runbook/README describing the old structure, an export map (`package.json` `exports`) that needs updating for a new file layout.
- **Delete what's now unused, don't just move it.** Removing/replacing a mechanism (an old provider, a helper, a prop threaded through for one caller that no longer exists) leaves dangling files/exports/dependencies if you stop at "nothing calls this anymore." Run `npx knip --workspace <path>` (config-free on this bun workspace) scoped to whatever package(s) you touched, and delete anything it flags that traces back to your change — the whole file if nothing else in it is used, not just the one export. Leave pre-existing unrelated findings alone; that's a separate task.
