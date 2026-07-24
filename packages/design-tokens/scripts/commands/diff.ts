import path from "node:path";

import { flattenTokens } from "../lib/generators";
import type { FlatToken } from "../lib/generators";
import { resolveTokens } from "../lib/resolver";
import { styleText } from "../lib/utils/console-colors";
import {
  FIGMA_TOKENS_DIR,
  listVersions,
  readCurrentVersion,
} from "../lib/version";

const { resolve } = path;

interface TokenDiff {
  added: FlatToken[];
  changed: {
    next: FlatToken;
    prev: FlatToken;
  }[];
  removed: FlatToken[];
}

interface DiffCliOptions {
  json: boolean;
  outFile?: string;
  versions: string[];
}

interface DiffReport {
  changed: string[];
  metadata: {
    generatedAt: string;
    nextVersion: string;
    previousVersion: string;
  };
  summary: {
    added: number;
    changed: number;
    removed: number;
  };
  added: string[];
  removed: string[];
}

const parseCliOptions = (args: string[]): DiffCliOptions => {
  const versions: string[] = [];

  let json = false;
  let outFile: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg) {
      continue;
    }

    if (arg === "--json") {
      json = true;
      continue;
    }

    if (arg === "--out") {
      const value = args[index + 1]?.trim();
      if (!value) {
        throw new Error("--out requires a file path");
      }
      outFile = value;
      index += 1;
      continue;
    }

    if (arg.startsWith("--")) {
      throw new Error(`Unknown flag: ${arg}`);
    }

    versions.push(arg.trim());
  }

  return {
    json,
    outFile,
    versions: versions.filter((value) => value.length > 0),
  };
};

const getVersionOrThrow = (versions: string[], index: number): string => {
  const value = versions.at(index);
  if (!value) {
    throw new Error(`Version not found at index ${index}`);
  }

  return value;
};

const resolveVersionPair = async (
  args: string[]
): Promise<{
  next: string;
  prev: string;
}> => {
  const { versions: cliVersions } = parseCliOptions(args);

  if (cliVersions.length >= 2) {
    return {
      next: getVersionOrThrow(cliVersions, 1),
      prev: getVersionOrThrow(cliVersions, 0),
    };
  }

  const current = await readCurrentVersion();
  const versions = listVersions();
  const index = versions.indexOf(current);

  if (versions.length < 2) {
    throw new Error("Need at least 2 token versions to run diff");
  }

  if (index > 0) {
    return {
      next: current,
      prev: getVersionOrThrow(versions, index - 1),
    };
  }

  if (index === 0) {
    return {
      next: getVersionOrThrow(versions, 1),
      prev: getVersionOrThrow(versions, 0),
    };
  }

  return {
    next: getVersionOrThrow(versions, -1),
    prev: getVersionOrThrow(versions, -2),
  };
};

const createTokenMap = (tokens: FlatToken[]): Map<string, FlatToken> =>
  new Map(tokens.map((entry) => [entry.path, entry]));

const toComparable = (token: FlatToken["token"]): string =>
  JSON.stringify(token);

const diffTokens = (
  prevTokens: FlatToken[],
  nextTokens: FlatToken[]
): TokenDiff => {
  const prevMap = createTokenMap(prevTokens);
  const nextMap = createTokenMap(nextTokens);

  const added: FlatToken[] = [];
  const changed: { next: FlatToken; prev: FlatToken }[] = [];
  const removed: FlatToken[] = [];

  for (const [tokenPath, next] of nextMap) {
    const prev = prevMap.get(tokenPath);
    if (!prev) {
      added.push(next);
      continue;
    }

    if (toComparable(prev.token) !== toComparable(next.token)) {
      changed.push({ next, prev });
    }
  }

  for (const [tokenPath, prev] of prevMap) {
    if (!nextMap.has(tokenPath)) {
      removed.push(prev);
    }
  }

  return {
    added: added.toSorted((a, b) => a.path.localeCompare(b.path)),
    changed: changed.toSorted((a, b) => a.next.path.localeCompare(b.next.path)),
    removed: removed.toSorted((a, b) => a.path.localeCompare(b.path)),
  };
};

const printSection = (label: string): void => {
  console.log(styleText("cyan", `\n${label}`));
};

const printTokenList = (title: string, values: string[]): void => {
  console.log(`${title}: ${values.length}`);
  for (const value of values.slice(0, 20)) {
    console.log(`  - ${value}`);
  }

  if (values.length > 20) {
    console.log(`  ... and ${values.length - 20} more`);
  }
};

const createDiffReport = (
  diff: TokenDiff,
  prev: string,
  next: string
): DiffReport => ({
  added: diff.added.map((entry) => entry.path),
  changed: diff.changed.map((entry) => entry.next.path),
  metadata: {
    generatedAt: new Date().toISOString(),
    nextVersion: next,
    previousVersion: prev,
  },
  removed: diff.removed.map((entry) => entry.path),
  summary: {
    added: diff.added.length,
    changed: diff.changed.length,
    removed: diff.removed.length,
  },
});

const emitJsonReport = async (
  report: DiffReport,
  outFile?: string
): Promise<void> => {
  const serialized = `${JSON.stringify(report, null, 2)}\n`;

  if (!outFile) {
    console.log(serialized);
    return;
  }

  const outputPath = resolve(process.cwd(), outFile);
  await Bun.write(outputPath, serialized);
  console.log(styleText("green", `Wrote diff report: ${outputPath}`));
};

export const run = async (args: string[]): Promise<void> => {
  const options = parseCliOptions(args);
  const { next, prev } = await resolveVersionPair(args);

  printSection("Token Diff");
  console.log(`Previous: ${prev}`);
  console.log(`Next: ${next}`);

  const prevResolved = await resolveTokens(FIGMA_TOKENS_DIR, prev);
  const nextResolved = await resolveTokens(FIGMA_TOKENS_DIR, next);

  if (prevResolved.errors.length > 0 || nextResolved.errors.length > 0) {
    throw new Error("Cannot diff versions with resolver errors");
  }

  const prevFlat = flattenTokens(prevResolved.tokens);
  const nextFlat = flattenTokens(nextResolved.tokens);

  const diff = diffTokens(prevFlat, nextFlat);

  if (options.json) {
    const report = createDiffReport(diff, prev, next);
    await emitJsonReport(report, options.outFile);
    return;
  }

  printSection("Summary");
  console.log(`Added: ${diff.added.length}`);
  console.log(`Removed: ${diff.removed.length}`);
  console.log(`Changed: ${diff.changed.length}`);

  printSection("Details");
  printTokenList(
    "Added",
    diff.added.map((entry) => entry.path)
  );
  printTokenList(
    "Removed",
    diff.removed.map((entry) => entry.path)
  );
  printTokenList(
    "Changed",
    diff.changed.map((entry) => entry.next.path)
  );
};
