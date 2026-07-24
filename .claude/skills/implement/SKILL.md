---
name: implement
description: Use whenever writing, adding, or changing code in this repo (features, endpoints, components, fixes) — walks through the plan/reuse/build/self-review loop so the result is SOLID/DRY, correctly placed in the folder structure, and verified before it's called done. Trigger for requests like "implement X", "add a Y", "viết code cho...", "thêm feature...", "sửa lỗi...".
---

# Implement

A checklist-driven loop for writing code that doesn't need a follow-up review pass to catch avoidable mistakes. Ultracite/oxlint (see `.claude/CLAUDE.md`) already enforces syntax-level rules (typing, hooks, a11y, security patterns) — this skill covers what a linter can't: architecture, duplication, structure, and judgment calls.

Scale effort to the task. A one-line fix doesn't need step 1's research or step 5's dispatch — read the file, fix it, verify it compiles. The steps below are for anything touching more than ~1 file or introducing a new concept (endpoint, component, module, schema).

## 1. Before writing: understand before you extend

- **Read the existing pattern for this kind of thing first.** Find a sibling file/module that does something similar (same layer, same domain) and match its shape — naming, error handling, file layout, level of abstraction. Don't invent a new convention when one already exists two files away.
- **Search for existing logic before writing new logic.** Grep for the function/helper/type you're about to write — a slightly different version may already exist. Reuse or extend it rather than creating a near-duplicate.
- **Check other packages in this monorepo, not just the one you're editing.** This is a `bun` workspace (`apps/*`, `packages/*`) — env vars live in `packages/env/src/schema.ts`/`index.ts`, auth/session/HTTP contracts live in `packages/api-client`, dependency-free cross-cutting TS utilities live in `packages/core`. A new package or feature that touches any of those domains without first grepping the existing package for an overlapping var/endpoint/service/helper risks a second, divergent implementation of the same contract (see the root `CLAUDE.md`'s "Monorepo Cross-Package Impact Check" section). Wire into what exists via a real workspace dependency instead of re-declaring it locally.
- **Decide the file/folder shape before the first line of code**, especially for a new domain/module: does it belong in an existing file, a new file next to siblings, or (if it has ≥2 distinct sub-concerns) a folder with an assembly/index file? Check this repo's actual convention (e.g. `packages/api-client/src/services/*` — one folder per domain, sub-files for sub-domains, an `index.ts` that only assembles) rather than defaulting to "one flat file always" or "split everything always."
- For a genuinely large/ambiguous feature, use the `Plan` subagent or the `architect` agent (see `.claude/agents/architect.md`) to settle the shape before writing — cheaper to redraw a plan than to restructure written code.

## 2. While writing

- **DRY, but not premature.** Three similar lines don't need a helper. The same non-trivial logic appearing in 2+ places does. Extract only once duplication is real, not speculative.
- **SOLID at the function/module level, not as ceremony.** One function does one thing; a module owns one responsibility. Don't add an interface/abstraction layer for a single implementation "in case it changes later" — YAGNI beats speculative extensibility.
- **No magic numbers/strings.** Any literal with meaning (timeout ms, retry count, a status code, a repeated string key) becomes a named constant at the top of the file or a shared constants module if used across files.
- **Small, focused files and functions.** If a file mixes ≥2 unrelated concerns or a function needs a "part 1 / part 2" comment to explain itself, split it — see `.claude/skills/refactor/SKILL.md` for how.
- **Name for what it is, not how it's built.** A reader should understand a variable/function's purpose from its name alone, without opening its body.
- **Handle errors where they're meaningful, not everywhere defensively.** Validate at real boundaries (user input, external API responses); trust internal code and framework guarantees elsewhere. Don't catch an error just to rethrow it unchanged.
- **No dead code, no commented-out blocks, no TODO without an owner/reason.** If it's not needed now, delete it — git history is the backup, not a comment block.
- **Match the existing abstraction level.** Don't introduce a generic/config-driven solution for what the surrounding code solves directly, and vice versa — consistency beats local cleverness.

## 3. After writing: self-review before calling it done

Re-read your own diff as if reviewing someone else's PR, specifically for:

- [ ] Duplication you just introduced (logic that already exists elsewhere, copy-pasted instead of reused/extracted)
- [ ] A function/file that grew past one clear responsibility
- [ ] Any magic number/string that should be a constant
- [ ] An error path that's silently swallowed or that throws without enough context to debug
- [ ] Naming that requires reading the implementation to understand
- [ ] A structural inconsistency with sibling files/folders in the same domain
- [ ] Anything added "for later" that nothing currently uses
- [ ] **Anything your change made obsolete** — when a change removes the last caller of a function/prop/file (e.g. dropping a mechanism like a feature flag, an old API version, a config option), delete that dead code in the same change rather than leaving it unreferenced. Run `npx knip` (config-free, works on this bun workspace out of the box) scoped to the package(s) you touched — `npx knip --workspace <path>` — and check its "Unused files/exports/dependencies" output against what you just changed. Fix what your change caused; a pre-existing unrelated finding is out of scope for this task, don't fix it as a drive-by.

## 4. Verify, don't assume

- Run the project's typecheck/lint (`bun x ultracite fix` then `tsc --noEmit`, or the workspace equivalent — check `package.json` scripts) and actually read the output, don't just assume clean.
- For UI changes, actually exercise the feature (dev server + browser) rather than declaring done from reading code — see the root `CLAUDE.md` UI-testing rule.
- If the change is non-trivial (new domain, cross-file refactor, anything touching auth/payments/data integrity), dispatch the `code-reviewer` agent (`.claude/agents/code-reviewer.md`) for an independent adversarial pass before telling the user it's done — a second, fresh-context read catches what the author's own blind spots miss. Skip this for genuinely small/obvious changes; don't turn every one-line fix into a review cycle.
