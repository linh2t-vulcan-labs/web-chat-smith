import { existsSync } from "node:fs";
import path from "node:path";

import { styleText } from "../lib/console-colors";
import { readCurrentVersion, versionDir } from "../lib/figma-icons-version";
import { byKind, resolveDump } from "../lib/icon-importer";
import { loadNamesOverride } from "../lib/names-override";
import {
  PREVIEW_GALLERY_FILENAME,
  writePreviewArtifacts,
} from "../lib/preview-gallery";
import { tryParseEntry } from "../lib/svg-entry";

/** Read-only like `audit`, but also writes `_preview.html` plus the
 * `names.json` stub — lets you eyeball and start naming a dump before
 * switching `.current` to it. `bun run gen` is what actually writes into
 * `generated-icons/`. */
export const run = async (args: string[]): Promise<void> => {
  const version = args[0] ?? (await readCurrentVersion());
  const dumpDir = versionDir(version);
  if (!existsSync(dumpDir)) {
    throw new Error(`figma-icons/${version} does not exist`);
  }

  const namesOverride = await loadNamesOverride(dumpDir);
  const { resolutions } = await resolveDump(dumpDir, namesOverride);
  const resolved = byKind(resolutions, "resolved");

  const parseResults = await Promise.all(
    resolved.map(async (resolution) => {
      const [entry] = resolution.entries;
      if (!entry) {
        return null;
      }
      const parsed = await tryParseEntry(dumpDir, entry);
      return parsed.ok ? null : entry.relPath;
    })
  );
  const unparsedRelPaths = new Set(
    parseResults.filter((relPath): relPath is string => Boolean(relPath))
  );

  await writePreviewArtifacts(dumpDir, resolutions, unparsedRelPaths);

  console.log(
    styleText(
      "green",
      `Resolved: ${resolved.length - unparsedRelPaths.size} (+ ${unparsedRelPaths.size} named but unparseable)`
    )
  );
  const duplicateCount = byKind(resolutions, "duplicate").reduce(
    (sum, resolution) => sum + resolution.entries.length,
    0
  );
  console.log(styleText("yellow", `Duplicates: ${duplicateCount}`));
  console.log(
    styleText(
      "yellow",
      `Unresolved: ${byKind(resolutions, "unresolved").length}`
    )
  );
  console.log(
    `Open ${path.join(dumpDir, PREVIEW_GALLERY_FILENAME)} to see them all.`
  );
};
