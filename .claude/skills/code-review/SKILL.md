---
name: code-review
description: Use when the user asks to review code, check a diff/PR, or "tìm lỗi/bug giúp tôi" — runs a structured, adversarial review across correctness, SOLID/DRY, structure, performance, and error handling, then verifies each finding before reporting so low-confidence noise doesn't reach the user.
---

# Code Review

A repeatable review pass, not a vibe check. Goal: surface only findings that would actually break something or meaningfully hurt maintainability — not style nitpicks Ultracite/oxlint already auto-fixes.

## Scope the review first

Figure out what's actually being reviewed before reading anything: a specific diff (`git diff`/`git diff main...HEAD`), a set of files the user named, or "everything I just wrote this session." Read exactly that — don't silently expand scope to the whole repo unless asked.

## Review dimensions (work through all of them, not just the first one you notice)

1. **Correctness/bugs** — logic errors, off-by-one, wrong operator, incorrect async ordering, race conditions, unhandled edge cases (empty array, null, concurrent calls), state mutated somewhere it shouldn't be.
2. **SOLID/DRY** — a function/module doing more than one job; the same non-trivial logic duplicated in 2+ places instead of extracted; an abstraction that only has one real implementation (premature); tight coupling that would force unrelated changes together.
3. **Naming & readability** — can you tell what a function/variable does from its name alone? Any magic number/string that should be a named constant?
4. **File/folder structure** — does this fit the existing convention for this part of the repo (check sibling files/folders), or does it mix unrelated concerns into one file, or duplicate a pattern that already has a shared helper?
5. **Error handling** — swallowed errors, inconsistent error shapes, missing cleanup in error paths (unclosed resources, unremoved listeners), errors that don't carry enough context to debug.
6. **Performance** — obviously redundant work in a hot path (recomputing per-call what could be hoisted/memoized), unbounded loops over unbounded data, N+1-style patterns.
7. **Security** (when touching user input, auth, external data) — injection, unsanitized input reaching a sink, secrets in code/logs, missing authz check.
8. **Extensibility** — does this hardcode an assumption that breaks the moment a second case appears (second tenant, second locale, second provider)? Only flag this if a second case is a realistic near-term expectation, not hypothetically someday.
9. **Dead code left behind** — when a diff removes or replaces a mechanism (a prop, a helper, a whole file's reason to exist), check whether anything it made obsolete was actually deleted. Run `npx knip --workspace <path>` scoped to the touched package(s) (config-free on this bun workspace) and cross-check its output against the diff — flag only findings that trace back to this change, not pre-existing unrelated ones.

## How to review

- Read the actual diff/files, not a summary of them. Read enough surrounding context (the file the diff lives in, callers of a changed function) to judge correctness, not just the changed lines in isolation.
- For anything non-trivial in scope (more than a couple files), dispatch the `code-reviewer` agent (`.claude/agents/code-reviewer.md`) — a fresh context free of the implementer's assumptions catches more than reviewing your own just-written code.
- **Verify every finding before reporting it.** A finding is only worth surfacing if you can state the concrete failure scenario: what input/state causes what wrong behavior. "This could be cleaner" is not a finding; "passing an empty array here throws because `.reduce()` has no initial value" is. If you can't construct the concrete scenario, drop it — don't pad the list.
- Rank findings most-severe first: correctness bugs > security > SOLID/DRY structural issues > performance > style/naming.
- If something is actually well-designed, don't invent a nitpick to seem thorough — say so and move on. False positives cost the user's trust and review time.

## Reporting

If the active instructions (this skill, or whatever invoked it) call for structured output, use the `ReportFindings` tool with verified findings only, most severe first — empty list if nothing survived verification. Otherwise report as plain text: one paragraph per finding with file:line, the concrete failure scenario, and a suggested fix; skip preamble and skip a finding count summary nobody asked for.

Do not silently fix what you find unless the user asked you to fix issues, not just review them — a review reports; a fix changes code. If asked to do both, fix only what you verified, and re-report outcomes (fixed/skipped/no-change-needed) per finding.
