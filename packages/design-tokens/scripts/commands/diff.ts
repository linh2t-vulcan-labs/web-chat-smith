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

type CliArgToken =
  | { type: "json" }
  | { type: "out"; consumed: number; value: string }
  | { type: "version"; value: string };

const parseOutFlagValue = (
  args: string[],
  index: number
): { consumed: number; value: string } => {
  const value = args[index + 1]?.trim();
  if (!value) {
    throw new Error("--out requires a file path");
  }

  return { consumed: 1, value };
};

const classifyCliArg = (
  arg: string,
  args: string[],
  index: number
): CliArgToken => {
  if (arg === "--json") {
    return { type: "json" };
  }

  if (arg === "--out") {
    return { type: "out", ...parseOutFlagValue(args, index) };
  }

  if (arg.startsWith("--")) {
    throw new Error(`Unknown flag: ${arg}`);
  }

  return { type: "version", value: arg.trim() };
};

interface CliParseState {
  json: boolean;
  outFile: string | undefined;
  versions: string[];
}

/** Applies a classified arg token to the parse state, returning the next loop index. */
const applyCliToken = (
  token: CliArgToken,
  index: number,
  state: CliParseState
): number => {
  if (token.type === "json") {
    state.json = true;
    return index;
  }

  if (token.type === "out") {
    state.outFile = token.value;
    return index + token.consumed;
  }

  state.versions.push(token.value);
  return index;
};

const parseCliOptions = (args: string[]): DiffCliOptions => {
  const state: CliParseState = {
    json: false,
    outFile: undefined,
    versions: [],
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg) {
      continue;
    }

    index = applyCliToken(classifyCliArg(arg, args, index), index, state);
  }

  const { json, outFile, versions } = state;

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

const resolveVersionPairFromHistory = async (): Promise<{
  next: string;
  prev: string;
}> => {
  const current = await readCurrentVersion();
  const versions = listVersions();

  if (versions.length < 2) {
    throw new Error("Need at least 2 token versions to run diff");
  }

  const index = versions.indexOf(current);

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

const resolveVersionPair = (
  args: string[]
): Promise<{
  next: string;
  prev: string;
}> => {
  const { versions: cliVersions } = parseCliOptions(args);

  if (cliVersions.length >= 2) {
    return Promise.resolve({
      next: getVersionOrThrow(cliVersions, 1),
      prev: getVersionOrThrow(cliVersions, 0),
    });
  }

  return resolveVersionPairFromHistory();
};

const createTokenMap = (tokens: FlatToken[]): Map<string, FlatToken> =>
  new Map(tokens.map((entry) => [entry.path, entry]));

const toComparable = (token: FlatToken["token"]): string =>
  JSON.stringify(token);

type NextEntryOutcome =
  | { type: "added"; token: FlatToken }
  | { type: "changed"; next: FlatToken; prev: FlatToken }
  | { type: "unchanged" };

const classifyNextEntry = (
  tokenPath: string,
  next: FlatToken,
  prevMap: Map<string, FlatToken>
): NextEntryOutcome => {
  const prev = prevMap.get(tokenPath);
  if (!prev) {
    return { token: next, type: "added" };
  }

  if (toComparable(prev.token) === toComparable(next.token)) {
    return { type: "unchanged" };
  }

  return { next, prev, type: "changed" };
};

const diffTokens = (
  prevTokens: FlatToken[],
  nextTokens: FlatToken[]
): TokenDiff => {
  const prevMap = createTokenMap(prevTokens);
  const nextMap = createTokenMap(nextTokens);

  const added: FlatToken[] = [];
  const changed: { next: FlatToken; prev: FlatToken }[] = [];

  for (const [tokenPath, next] of nextMap) {
    const outcome = classifyNextEntry(tokenPath, next, prevMap);

    if (outcome.type === "added") {
      added.push(outcome.token);
    } else if (outcome.type === "changed") {
      changed.push({ next: outcome.next, prev: outcome.prev });
    }
  }

  const removed = [...prevMap.entries()]
    .filter(([tokenPath]) => !nextMap.has(tokenPath))
    .map(([, prev]) => prev);

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
