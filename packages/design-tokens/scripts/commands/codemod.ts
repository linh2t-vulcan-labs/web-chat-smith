import path from "node:path";

import { transformTokenSource } from "../codemod/transformer";
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

export const run = async (args: string[]): Promise<void> => {
  const { findRemoved, fix, targetPath } = parseArgs(args);
  const files = await collectFiles(targetPath);

  if (files.length === 0) {
    console.log(styleText("yellow", `No code files found in ${targetPath}`));
    return;
  }

  let touchedFiles = 0;
  let totalTransforms = 0;

  const sources = await Promise.all(files.map((file) => Bun.file(file).text()));
  const pendingWrites: { code: string; file: string }[] = [];

  for (const [index, file] of files.entries()) {
    const result = transformTokenSource(sources[index] ?? "");
    if (result.transforms.length === 0) {
      continue;
    }

    touchedFiles += 1;
    const changeCount = result.transforms.reduce(
      (sum, item) => sum + item.count,
      0
    );
    totalTransforms += changeCount;

    console.log(
      styleText("yellow", `  ${file} (${changeCount} class migration(s))`)
    );

    for (const change of result.transforms) {
      console.log(
        styleText(
          "gray",
          `    ${change.from} -> ${change.to} (${change.count}x)`
        )
      );
    }

    if (fix) {
      pendingWrites.push({ code: result.code, file });
    }
  }

  if (pendingWrites.length > 0) {
    await Promise.all(
      pendingWrites.map(({ file, code }) => Bun.write(file, code))
    );
  }

  if (totalTransforms === 0) {
    console.log(styleText("green", "  ✓ No legacy class tokens found"));
    return;
  }

  if (!fix) {
    const hint = findRemoved
      ? "Run again with --fix to apply codemod updates."
      : "Run with --fix to apply codemod updates.";

    console.log(
      styleText("yellow", `\n  ${touchedFiles} file(s) need migration.`)
    );
    console.log(styleText("yellow", `  ${hint}`));
    process.exitCode = 1;
    return;
  }

  console.log(styleText("green", `\n  ✓ Updated ${touchedFiles} file(s)`));
  console.log(
    styleText("green", `  ✓ Converted ${totalTransforms} class token(s)`)
  );
};
