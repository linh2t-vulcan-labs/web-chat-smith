#!/usr/bin/env bun
/**
 * `bun run gen <icons|tokens> <command> [...args]` — runs a workspace
 * package's own generator CLI from the repo root, so nobody has to `cd`
 * into `packages/icons` or `packages/design-tokens` to run `audit`,
 * `preview`, `diff`, etc. Each package still owns its own commands (see
 * `packages/icons/scripts/icons.ts` / `packages/design-tokens/scripts/tokens.ts`)
 * — this only forwards args to the right one.
 */
import { $ } from "bun";

interface Target {
  dir: string;
  script: string;
}

const TARGETS: Record<string, Target> = {
  icons: { dir: "packages/icons", script: "icons" },
  tokens: { dir: "packages/design-tokens", script: "tokens" },
};

const REPO_ROOT = `${import.meta.dir}/../..`;

const HELP = `Usage: bun run gen <${Object.keys(TARGETS).join("|")}> <command> [...args]

Forwards to that package's own CLI (same commands as running it from inside
the package): audit, preview, diff, import, version, build, validate, ...
Run \`bun run gen <target> help\` to see that package's full command list.

Examples:
  bun run gen icons preview icons_v2
  bun run gen icons audit --all
  bun run gen tokens preview tokens_v1.1.3
  bun run gen tokens diff tokens_v1.1.1 tokens_v1.1.2`;

const isHelpToken = (value: string): boolean =>
  value === "help" || value === "--help";

const main = async (): Promise<void> => {
  const [targetName, ...rest] = process.argv.slice(2);

  if (!targetName || isHelpToken(targetName)) {
    console.log(HELP);
    return;
  }

  const target = TARGETS[targetName];
  if (!target) {
    console.log(HELP);
    throw new Error(`Unknown target: ${targetName}`);
  }

  await $`bun run ${target.script} ${rest}`.cwd(`${REPO_ROOT}/${target.dir}`);
};

await main();
