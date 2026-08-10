import { existsSync } from "node:fs";

import { styleText } from "../lib/console-colors";
import {
  listVersions,
  readCurrentVersion,
  versionDir,
} from "../lib/figma-icons-version";
import { byKind, resolveDump } from "../lib/icon-importer";
import { loadNamesOverride } from "../lib/names-override";

const resolvedSlugs = async (version: string): Promise<Set<string>> => {
  const dumpDir = versionDir(version);
  if (!existsSync(dumpDir)) {
    throw new Error(`figma-icons/${version} does not exist`);
  }
  const namesOverride = await loadNamesOverride(dumpDir);
  const { resolutions } = await resolveDump(dumpDir, namesOverride);
  const slugs = byKind(resolutions, "resolved").map(
    (resolution) => resolution.slug
  );
  return new Set(slugs.filter((slug): slug is string => Boolean(slug)));
};

const defaultPair = async (): Promise<[string, string]> => {
  const current = await readCurrentVersion();
  const versions = listVersions();
  const index = versions.indexOf(current);
  const previous = index > 0 ? versions[index - 1] : versions[0];
  return [previous ?? current, current];
};

/** Diffs which icon slugs two `figma-icons/icons_vX` dumps resolve to —
 * defaults to the version before `.current` vs `.current`. */
export const run = async (args: string[]): Promise<void> => {
  const [prevArg, nextArg] = args;
  const [prev, next] =
    prevArg && nextArg ? [prevArg, nextArg] : await defaultPair();

  const [prevSlugs, nextSlugs] = await Promise.all([
    resolvedSlugs(prev),
    resolvedSlugs(next),
  ]);

  const added = [...nextSlugs]
    .filter((slug) => !prevSlugs.has(slug))
    .toSorted();
  const removed = [...prevSlugs]
    .filter((slug) => !nextSlugs.has(slug))
    .toSorted();

  console.log(styleText("cyan", `${prev} -> ${next}`));
  console.log(styleText("green", `Added (${added.length}):`));
  for (const slug of added) {
    console.log(`  + ${slug}`);
  }
  console.log(styleText("yellow", `Removed (${removed.length}):`));
  for (const slug of removed) {
    console.log(`  - ${slug}`);
  }
};
