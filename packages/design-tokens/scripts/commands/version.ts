import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

import { $ } from "bun";

import { resolveTokens } from "../lib/resolver";
import { styleText } from "../lib/utils/console-colors";
import {
  validateContrast,
  validateRefs,
  validateSchema,
  validateSSRSafety,
} from "../lib/validators";
import {
  CURRENT_VERSION_FILE,
  FIGMA_TOKENS_DIR,
  listVersions,
  readCurrentVersion,
} from "../lib/version";

const { resolve } = path;

const PACKAGE_JSON_FILE = resolve(import.meta.dir, "../../package.json");

interface DesignTokensPackageJson {
  exports?: Record<string, string>;
  [key: string]: unknown;
}

const toExportPath = (version: string): string =>
  `./generated-token/${version}/index.css`;

const toExportAlias = (version: string): string =>
  `./${version.replace(/^tokens_/u, "")}`;

const syncPackageExports = async (currentVersion: string): Promise<void> => {
  const packageJsonFile = Bun.file(PACKAGE_JSON_FILE);
  if (!(await packageJsonFile.exists())) {
    throw new Error("package.json not found for export sync");
  }

  const packageJson = (await packageJsonFile.json()) as DesignTokensPackageJson;

  const versions = listVersions();
  const exportsMap: Record<string, string> = {
    ".": toExportPath(currentVersion),
    "./latest": toExportPath(currentVersion),
  };

  for (const version of versions.toReversed()) {
    exportsMap[toExportAlias(version)] = toExportPath(version);
  }

  packageJson.exports = exportsMap;
  await Bun.write(
    PACKAGE_JSON_FILE,
    `${JSON.stringify(packageJson, null, 2)}\n`
  );
};

const validateVersionData = async (version: string): Promise<void> => {
  const [resolved, resolvedDark] = await Promise.all([
    resolveTokens(FIGMA_TOKENS_DIR, version, "light"),
    resolveTokens(FIGMA_TOKENS_DIR, version, "dark"),
  ]);

  const schema = validateSchema(resolved.tokens);
  const refs = validateRefs(resolved.tokens);
  const contrast = validateContrast(resolved.tokens);
  const ssrSafety = validateSSRSafety(resolved.tokens);
  const darkSchema = validateSchema(resolvedDark.tokens);
  const darkRefs = validateRefs(resolvedDark.tokens);
  const darkContrast = validateContrast(resolvedDark.tokens);
  const darkSsrSafety = validateSSRSafety(resolvedDark.tokens);

  const totalErrors =
    resolved.errors.length +
    resolvedDark.errors.length +
    schema.errors.length +
    refs.errors.length +
    contrast.errors.length +
    ssrSafety.errors.length +
    darkSchema.errors.length +
    darkRefs.errors.length +
    darkContrast.errors.length +
    darkSsrSafety.errors.length;

  if (totalErrors > 0) {
    throw new Error(
      `Validation failed for ${version} with ${totalErrors} errors`
    );
  }
};

const requireTargetVersion = (args: string[], usage: string): string => {
  const value = args[0]?.trim();
  if (!value) {
    throw new Error(usage);
  }

  return value;
};

const runInit = async (args: string[]): Promise<void> => {
  const target = requireTargetVersion(
    args,
    "Usage: bun run tokens version init <tokens_vX.Y.Z>"
  );

  if (!target.startsWith("tokens_v")) {
    throw new Error("Version name must start with tokens_v");
  }

  const current = await readCurrentVersion();
  const targetDir = resolve(FIGMA_TOKENS_DIR, target);
  if (existsSync(targetDir)) {
    throw new Error(`Target version already exists: ${target}`);
  }

  const sourceDir = resolve(FIGMA_TOKENS_DIR, current);
  if (!existsSync(sourceDir)) {
    throw new Error(`Current source version folder does not exist: ${current}`);
  }

  await $`mkdir -p ${targetDir} && cp -r ${sourceDir}/. ${targetDir}`.quiet();

  const fileCount = readdirSync(targetDir).filter((name) =>
    name.endsWith(".json")
  ).length;

  console.log(styleText("green", `Initialized ${target} from ${current}`));
  console.log(`Copied JSON files: ${fileCount}`);
  console.log(
    styleText(
      "cyan",
      `Next step: edit files in ${target}, then run \`bun run tokens diff\` and \`bun run tokens version use ${target}\`.`
    )
  );
};

const runUse = async (args: string[]): Promise<void> => {
  const next = requireTargetVersion(
    args,
    "Usage: bun run tokens version use <tokens_vX.Y.Z>"
  );
  const previous = await readCurrentVersion();

  if (previous === next) {
    await syncPackageExports(next);
    console.log(styleText("yellow", `Already using ${next}`));
    console.log(
      styleText("cyan", "Synced package exports for current/versioned CSS.")
    );
    return;
  }

  const nextDir = resolve(FIGMA_TOKENS_DIR, next);
  if (!existsSync(nextDir)) {
    throw new Error(`Target version folder does not exist: ${next}`);
  }

  console.log(styleText("cyan", `Validating ${next} before switching...`));
  await validateVersionData(next);

  await Bun.write(CURRENT_VERSION_FILE, `${next}\n`);
  await syncPackageExports(next);

  console.log(styleText("green", `Switched .current: ${previous} -> ${next}`));
  console.log(
    styleText(
      "cyan",
      "Run `bun run tokens build` to regenerate output artifacts."
    )
  );
  console.log(
    styleText("cyan", "Synced package exports for current/versioned CSS.")
  );
};

export const run = async (args: string[]): Promise<void> => {
  const [action, ...rest] = args;

  if (action === "init") {
    await runInit(rest);
    return;
  }

  if (action === "use") {
    await runUse(rest);
    return;
  }

  throw new Error("Usage: bun run tokens version <init|use> <tokens_vX.Y.Z>");
};
