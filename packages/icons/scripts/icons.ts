#!/usr/bin/env bun
import { run as runAudit } from "./commands/audit";
import { run as runDiff } from "./commands/diff";
import { run as runPreview } from "./commands/preview";
import { run as runVerify } from "./commands/verify";
import { run as runVersion } from "./commands/version";
import { styleText } from "./lib/console-colors";

type Command = (args: string[]) => Promise<void>;

const COMMANDS: Record<string, Command> = {
  audit: runAudit,
  diff: runDiff,
  preview: runPreview,
  verify: runVerify,
  version: runVersion,
};

const HELP = `Usage: bun run icons <command> [...args]

Commands:
  audit [version|--all]      Read-only: resolved/duplicate/unresolved counts per version
  preview [version]          Read-only: writes preview.html + names.json stub. Resolved shapes render the
                              real generated component when one exists, else fall back to the raw dump SVG
  verify [version]           Read-only, terminal-only: confirms every generated-icons/ component actually
                              imports and renders, and that the count matches the dump. CI-friendly (exits 1 on failure)
  version init <icons_vX>    Create an empty figma-icons/icons_vX folder for a new Figma export
  version use <icons_vX>     Switch .current to an existing version
  diff [prev] [next]         Diff which icon slugs two versions resolve to (defaults to previous vs .current)

A version folder holds one subfolder per category (e.g. \`icons/\`, \`graphics/\`
— any top-level folder works, add more as the design team adds them). Each
category is a raw Figma export dump; \`names.json\` (same folder) fills in a
slug for anything Figma only gave a placeholder name like \`meaning-42.svg\`,
or disambiguates two shapes that resolved to the same slug. Output mirrors
category into \`generated-icons/<category>/\`, but the public import path
(\`@cs/icons/<slug>\`) stays flat via package.json's \`./*\` export.

Note: \`bun run gen\` (from the package root, not this CLI) already resolves
\`.current\` before generating \`generated-icons/**/*.tsx\` — filling in
names.json and running \`bun run gen\` is the whole loop. Use \`icons
preview\`/\`audit\` directly only to inspect a version that isn't \`.current\`
yet.

Workflow for a new Figma export:
  1. bun run icons version init icons_v2
  2. Unzip each category's download into figma-icons/icons_v2/<category>/
  3. bun run icons preview icons_v2     # writes preview.html + names.json stub, touches nothing else
  4. Fill in blanks in figma-icons/icons_v2/names.json, re-run step 3 until preview.html looks right
  5. bun run icons version use icons_v2
  6. bun run gen                        # generates generated-icons/**/*.tsx from .current, re-writes preview.html
                                         #   with the real rendered components instead of raw SVGs`;

const isHelpToken = (command: string): boolean =>
  command === "help" || command === "--help";

const main = async (): Promise<void> => {
  const [command, ...rest] = process.argv.slice(2);

  if (!command || isHelpToken(command)) {
    console.log(HELP);
    return;
  }

  const handler = COMMANDS[command];
  if (!handler) {
    console.log(HELP);
    throw new Error(`Unknown command: ${command}`);
  }

  await handler(rest);
};

try {
  await main();
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(styleText("red", `icons failed: ${message}`));
  process.exitCode = 1;
}
