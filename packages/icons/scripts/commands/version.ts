import { existsSync, mkdirSync } from "node:fs";

import { styleText } from "../lib/console-colors";
import {
  CURRENT_VERSION_FILE,
  assertValidVersionName,
  readCurrentVersion,
  versionDir,
} from "../lib/figma-icons-version";
import { listCategories } from "../lib/icon-importer";
import { syncPackageExports } from "../lib/package-exports";

const requireTargetVersion = (args: string[], usage: string): string => {
  const value = args[0]?.trim();
  if (!value) {
    throw new Error(usage);
  }
  return value;
};

const runInit = (args: string[]): void => {
  const target = requireTargetVersion(
    args,
    "Usage: bun run icons version init <icons_vX>"
  );
  assertValidVersionName(target);

  const targetDir = versionDir(target);
  if (existsSync(targetDir)) {
    throw new Error(`Target version already exists: ${target}`);
  }

  mkdirSync(targetDir, { recursive: true });
  console.log(styleText("green", `Created figma-icons/${target}`));
  console.log(
    styleText(
      "cyan",
      `Next step: unzip each category's export into figma-icons/${target}/<category>/, then run \`bun run icons preview ${target}\`.`
    )
  );
};

const runUse = async (args: string[]): Promise<void> => {
  const next = requireTargetVersion(
    args,
    "Usage: bun run icons version use <icons_vX>"
  );
  const previous = await readCurrentVersion();

  if (previous === next) {
    console.log(styleText("yellow", `Already using ${next}`));
    return;
  }

  if (!existsSync(versionDir(next))) {
    throw new Error(`Target version folder does not exist: ${next}`);
  }

  await Bun.write(CURRENT_VERSION_FILE, `${next}\n`);
  await syncPackageExports(next, listCategories(versionDir(next)));

  console.log(styleText("green", `Switched .current: ${previous} -> ${next}`));
  console.log(
    styleText(
      "cyan",
      "Synced package exports for it. Run `bun run gen` to generate its components."
    )
  );
};

export const run = async (args: string[]): Promise<void> => {
  const [action, ...rest] = args;

  if (action === "init") {
    runInit(rest);
    return;
  }
  if (action === "use") {
    await runUse(rest);
    return;
  }
  throw new Error("Usage: bun run icons version <init|use> <icons_vX>");
};
