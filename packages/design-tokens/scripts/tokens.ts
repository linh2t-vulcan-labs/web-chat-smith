import { run as runAudit } from "./commands/audit";
import { run as runBuild } from "./commands/build";
import { run as runClean } from "./commands/clean";
import { run as runCodemod } from "./commands/codemod";
import { run as runDiff } from "./commands/diff";
import { run as runValidate } from "./commands/validate";
import { run as runVersion } from "./commands/version";
import { styleText } from "./lib/utils/console-colors";

type Command = (args: string[]) => Promise<void>;

const COMMANDS: Record<string, Command> = {
  audit: runAudit,
  build: runBuild,
  clean: runClean,
  codemod: runCodemod,
  diff: runDiff,
  validate: runValidate,
  version: runVersion,
};

const HELP = `Usage: bun run tokens <command> [...args]

Commands:
  audit                           Inspect every figma-tokens/tokens_v* folder (read-only)
  validate [version] [--all]      Validate the active version, an explicit version, or every version
  build [version] [--all]         Build CSS artifacts for the active version, an explicit version, or every version
  diff [prev] [next] [--json] [--out <file>]
                                   Diff two token versions (defaults to current vs. previous)
  version init <tokens_vX.Y.Z>    Scaffold a new version folder by copying the active version
  version use <tokens_vX.Y.Z>     Validate a version, switch .current, sync package.json exports
  codemod [path] [--fix] [--find-removed]
                                   Migrate legacy Tailwind class tokens to design-token classes
  clean                           Remove generated-token/* build artifacts

Examples:
  bun run tokens build
  bun run tokens build --all
  bun run tokens version init tokens_v1.1.3
  bun run tokens version use tokens_v1.1.2
  bun run tokens diff --json --out generated-token/diff-report.json
  bun run tokens codemod apps/web --fix`;

const isHelpToken = (command: string): boolean =>
  command === "help" || command === "--help";

const run = async (): Promise<void> => {
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
  await run();
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(styleText("red", `tokens failed: ${message}`));
  process.exitCode = 1;
}
