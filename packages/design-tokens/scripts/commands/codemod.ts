import path from "node:path";

import { transformTokenSource } from "../codemod/transformer";
import type { TransformResult } from "../codemod/transformer";
import { styleText } from "../lib/utils/console-colors";

const { resolve } = path;

const isCodeFile = (filePath: string): boolean =>
  /\.(?:[cm]?[jt]sx?)$/u.test(filePath);

const shouldSkip = (filePath: string): boolean =>
  filePath.includes("/node_modules/") ||
  filePath.includes("/.next/") ||
  filePath.includes("/dist/") ||
  filePath.includes("/generated-token/");

const parseArgs = (
  args: string[]
): { fix: boolean; findRemoved: boolean; targetPath: string } => {
  const fix = args.includes("--fix");
  const findRemoved = args.includes("--find-removed");
  const targetPath = args.find((arg) => !arg.startsWith("--")) ?? "src";

  return { findRemoved, fix, targetPath };
};

const collectFiles = async (targetPath: string): Promise<string[]> => {
  const fullTarget = resolve(process.cwd(), targetPath);
  const files: string[] = [];

  const matcher = new Bun.Glob("**/*");
  for await (const relativePath of matcher.scan(fullTarget)) {
    const absolutePath = resolve(fullTarget, relativePath);
    if (!isCodeFile(absolutePath) || shouldSkip(absolutePath)) {
      continue;
    }
    files.push(absolutePath);
  }

  return files.toSorted((a, b) => a.localeCompare(b));
};

interface CodemodSummary {
  pendingWrites: { code: string; file: string }[];
  touchedFiles: number;
  totalTransforms: number;
}

const logFileTransforms = (file: string, result: TransformResult): number => {
  const changeCount = result.transforms.reduce(
    (sum, item) => sum + item.count,
    0
  );

  console.log(
    styleText("yellow", `  ${file} (${changeCount} class migration(s))`)
  );
  for (const change of result.transforms) {
    console.log(
      styleText("gray", `    ${change.from} -> ${change.to} (${change.count}x)`)
    );
  }

  return changeCount;
};

interface FileTransformOutcome {
  pendingWrite: { code: string; file: string } | null;
  transformCount: number;
}

const processFileTransform = (
  file: string,
  source: string | undefined,
  fix: boolean
): FileTransformOutcome | null => {
  const result = transformTokenSource(source ?? "");
  if (result.transforms.length === 0) {
    return null;
  }

  const transformCount = logFileTransforms(file, result);
  const pendingWrite = fix ? { code: result.code, file } : null;

  return { pendingWrite, transformCount };
};

const collectTransformSummary = async (
  files: string[],
  fix: boolean
): Promise<CodemodSummary> => {
  const sources = await Promise.all(files.map((file) => Bun.file(file).text()));
  const pendingWrites: { code: string; file: string }[] = [];
  let touchedFiles = 0;
  let totalTransforms = 0;

  for (const [index, file] of files.entries()) {
    const outcome = processFileTransform(file, sources[index], fix);
    if (!outcome) {
      continue;
    }

    touchedFiles += 1;
    totalTransforms += outcome.transformCount;
    if (outcome.pendingWrite) {
      pendingWrites.push(outcome.pendingWrite);
    }
  }

  return { pendingWrites, touchedFiles, totalTransforms };
};

const reportOutcome = (
  summary: CodemodSummary,
  fix: boolean,
  findRemoved: boolean
): void => {
  if (summary.totalTransforms === 0) {
    console.log(styleText("green", "  ✓ No legacy class tokens found"));
    return;
  }

  if (!fix) {
    const hint = findRemoved
      ? "Run again with --fix to apply codemod updates."
      : "Run with --fix to apply codemod updates.";

    console.log(
      styleText("yellow", `\n  ${summary.touchedFiles} file(s) need migration.`)
    );
    console.log(styleText("yellow", `  ${hint}`));
    process.exitCode = 1;
    return;
  }

  console.log(
    styleText("green", `\n  ✓ Updated ${summary.touchedFiles} file(s)`)
  );
  console.log(
    styleText(
      "green",
      `  ✓ Converted ${summary.totalTransforms} class token(s)`
    )
  );
};

export const run = async (args: string[]): Promise<void> => {
  const { findRemoved, fix, targetPath } = parseArgs(args);
  const files = await collectFiles(targetPath);

  if (files.length === 0) {
    console.log(styleText("yellow", `No code files found in ${targetPath}`));
    return;
  }

  const summary = await collectTransformSummary(files, fix);

  if (summary.pendingWrites.length > 0) {
    await Promise.all(
      summary.pendingWrites.map(({ file, code }) => Bun.write(file, code))
    );
  }

  reportOutcome(summary, fix, findRemoved);
};
