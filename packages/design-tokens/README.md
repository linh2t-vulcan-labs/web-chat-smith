# @cs/design-tokens

Token pipeline package for Chatsmith.

This package loads versioned Figma exports, resolves references, validates token quality, and emits CSS artifacts consumed by `@cs/ui` (and, through it, every app in the monorepo).

## What This Package Does

1. Reads source token data from `figma-tokens/tokens_v*`.
2. Uses `.current` to decide the active version.
3. Resolves references (supports `$path` and `{path.to.token}`).
4. Normalizes token values (color, spacing, radius, border, shadow, typography).
5. Runs validators (schema, refs, contrast, SSR safety).
6. Emits build outputs into `generated-token/<version>/`.

## CLI

Every operation goes through a single entrypoint:

```bash
bun run --cwd packages/design-tokens tokens <command> [...args]
```

(or just `bun run tokens <command>` when your shell is already inside `packages/design-tokens`). Run `bun run tokens` with no command, or `bun run tokens help`, to print this list at any time.

| Command | What it does |
| --- | --- |
| `audit` | Read-only sanity check of every `figma-tokens/tokens_v*` folder — file counts, parse errors, current version. Safe to run any time. |
| `validate [version] [--all]` | Validate a token version (resolver + schema + refs + contrast + SSR-safety). Defaults to the active (`.current`) version; `--all` validates every version in parallel. |
| `build [version] [--all]` | Build the CSS artifacts for a version. Defaults to the active version; `--all` builds every version in parallel — use this instead of manually switching versions in a loop. |
| `diff [prev] [next] [--json] [--out <file>]` | Diff two token versions. With no args, diffs the active version against the previous one. Pass two explicit version names to diff any pair. `--json` emits a machine-readable report; `--out <file>` writes it to disk. |
| `version init <tokens_vX.Y.Z>` | Scaffold a new version folder by copying the currently active version's JSON files. |
| `version use <tokens_vX.Y.Z>` | Validate the target version, switch `.current` to it, and sync `package.json` `exports`. |
| `codemod [path] [--fix] [--find-removed]` | Scan (and optionally rewrite) legacy Tailwind utility classes into design-token classes. Defaults to scanning `src`. |
| `clean` | Remove everything under `generated-token/` (regenerate with `tokens build --all`). |

### Typical workflow

1. Add or update token source under a new `figma-tokens/tokens_vX.Y.Z` folder:
   ```bash
   bun run tokens version init tokens_v1.1.3
   ```
2. Edit the JSON files in that folder, then check what changed:
   ```bash
   bun run tokens diff
   ```
3. Switch to it once you're happy (this also validates it):
   ```bash
   bun run tokens version use tokens_v1.1.3
   ```
4. Build the CSS artifacts:
   ```bash
   bun run tokens build
   ```

### Rebuilding every version

Old versions still ship their own CSS under `generated-token/<version>/` (see `package.json` `exports` for the version aliases). After a change to the pipeline itself (a normalizer, a generator, ...), regenerate every version's output in one shot, without touching `.current`:

```bash
bun run tokens build --all
```

## Quality Gates

Before merging token changes, run:

```bash
bun run --cwd packages/design-tokens tokens validate --all
bun run --cwd packages/design-tokens tokens build --all
bun test --cwd packages/design-tokens
```

## Key Folders

- `figma-tokens/`: immutable source versions + `.current`.
- `generated-token/`: generated CSS artifacts by version (build output — do not hand-edit, run `tokens build` instead).
- `scripts/tokens.ts`: the CLI entrypoint — parses the subcommand and dispatches to `scripts/commands/`.
- `scripts/commands/`: one file per CLI subcommand (`audit`, `build`, `validate`, `diff`, `version`, `codemod`, `clean`). Thin — argument parsing and console output only.
- `scripts/lib/`: the pure build-time logic the commands call into — resolver, normalizers, generators, validators, shared utils. No CLI concerns (no `process.argv`, no `console.log`) so it can be unit tested in isolation. Colocate `*.test.ts` next to the file it covers, e.g. `scripts/lib/utils/color-math.test.ts`.
- `scripts/codemod/`: the codemod's pure transform logic (`mappings.ts`, `transformer.ts`), called by `scripts/commands/codemod.ts`.

## Generated Artifacts Per Version

Each generated version directory (`generated-token/<version>/`) contains:

- `index.css` — imports the 5 files below, in order. This is the file `@cs/design-tokens`'s package `exports` point to.
- `tokens.css` — every token as a `--cs-*` CSS variable, plus responsive density/device mode overrides.
- `shadcn.css` — bridges `--cs-*` variables to the shadcn/Tailwind v4 variable names (`--background`, `--primary`, `--sidebar-ring`, ...) that `@cs/ui`'s `globals.css` theme expects. A single `:root` block of `var(--cs-*)` assignments — no `@import`, `@custom-variant`, `@theme`, `@layer base`, or `.dark` overrides, since `@cs/ui` owns the former and `tokens.css`'s own `.dark` block (below) makes the latter unnecessary.
- `typography.css` — typography tokens as CSS variables + `@utility` classes.
- `shadows.css` — shadow tokens as CSS variables.
- `recipes.css` — a couple of hand-authored component recipes.
- `manifest.json` — version + token count + build timestamp, for tooling.

Global diff output: `generated-token/diff-report.json` (written by `tokens diff --json --out generated-token/diff-report.json`).

### Why every file has its own `:root { ... }`

Each CSS file above declares its own `:root { ... }` block instead of one shared block. This is intentional and has no runtime cost: browsers treat multiple `:root` rules exactly like any other repeated selector — matching `:root` is effectively free (it's a single element, the document root), and because each file's variables use a different namespace (`--cs-*` in `tokens.css` vs. plain `--background`/`--primary`/... in `shadcn.css`), there is no cross-file override. Splitting per concern (tokens vs. shadcn bridge vs. typography vs. shadows) is what most design-token pipelines do (Style Dictionary, Tokens Studio, ...) and keeps each generator independently testable.

### How dark mode works

`build` resolves **two** trees per version: a light tree (merging `alias_colors Light.json`) and a dark tree (merging `alias_colors Dark.json` instead — see `resolveTokens(dir, version, "light" | "dark")` in `scripts/lib/resolver.ts`). `tokens.css` ships the light tree as `--cs-*` values in `:root`, then a `.dark { ... }` block (from `generateDarkModeCss`) with only the `--cs-*` variables whose dark value actually differs from light — a diff, same pattern as the density/device mode overrides.

Because `shadcn.css` defines every shadcn variable as `var(--cs-*)`, and never redeclares them under `.dark`, the CSS custom-property cascade does the rest: any element under a `.dark` ancestor sees the overridden `--cs-*` value, so `--background`, `--accent`, etc. automatically resolve to their real dark-theme value with zero extra mapping. There is nothing to keep in sync in `shadcn-bridge.ts` for dark mode — only `TOKEN_VAR_MAP` (the light-mode `--cs-*` path each shadcn variable points to) needs maintaining.

`build`, `validate`, and `version use` all resolve and validate **both** trees — schema, refs, contrast, and SSR-safety run against the dark tree too, so a WCAG contrast regression introduced in `alias_colors Dark.json` fails the build exactly like a light-mode one would.

### Consuming this package from `@cs/ui`

`@cs/ui`'s `packages/ui/src/styles/globals.css` imports this package (`@import "@cs/design-tokens";`) as the source of truth for every shadcn/ Tailwind v4 theme variable — there are no hard-coded `oklch(...)` values in `globals.css` anymore. `globals.css` still owns `@import "tailwindcss"`, `@custom-variant dark`, the color/radius `@theme inline` block, and `@layer base` — this package only supplies the variable _values_. If you add a brand-new shadcn variable name (e.g. a new `--chart-6`), add it to both `TOKEN_VAR_MAP` in `scripts/lib/generators/shadcn-bridge.ts` **and** the `@theme inline` block in `globals.css`.

### Notes about `shadows.css`

If `shadows.css` is empty, it usually means shadow data is not entering the token tree as `$type: "shadow"` tokens. The pipeline supports shadow values coming from:

- Standard shadow tokens in the token JSON tree (string, single-object, or multi-layer array `$value`).
- Effect-style shadows extracted from `others_styles.json` (`styles.effectStyles`).

So a non-empty `others_styles.json` with effect styles should produce a non-empty `shadows.css` after `tokens build`.
