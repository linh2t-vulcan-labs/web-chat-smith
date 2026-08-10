import { existsSync } from "node:fs";

import { styleText } from "../lib/console-colors";
import { listVersions, versionDir } from "../lib/figma-icons-version";
import { byKind, resolveDump } from "../lib/icon-importer";
import { loadNamesOverride } from "../lib/names-override";

const auditVersion = async (version: string): Promise<string> => {
  const dumpDir = versionDir(version);
  if (!existsSync(dumpDir)) {
    throw new Error(`figma-icons/${version} does not exist`);
  }

  const namesOverride = await loadNamesOverride(dumpDir);
  const { resolutions, unparsed } = await resolveDump(dumpDir, namesOverride);

  const duplicateCount = byKind(resolutions, "duplicate").reduce(
    (sum, resolution) => sum + resolution.entries.length,
    0
  );

  const lines = [
    styleText("cyan", `\n${version}`),
    `  Resolved:   ${byKind(resolutions, "resolved").length}`,
    `  Duplicates: ${duplicateCount}`,
    `  Unresolved: ${byKind(resolutions, "unresolved").length}`,
  ];
  if (unparsed.length > 0) {
    lines.push(styleText("yellow", `  Couldn't parse: ${unparsed.length}`));
  }
  return lines.join("\n");
};

/** Read-only: reports what `gen` would resolve for one or every version,
 * without writing to generated-icons/, the preview gallery, or names.json. */
export const run = async (args: string[]): Promise<void> => {
  const [target] = args;
  const versions = target && target !== "--all" ? [target] : listVersions();

  const reports = await Promise.all(versions.map(auditVersion));
  for (const report of reports) {
    console.log(report);
  }
};
