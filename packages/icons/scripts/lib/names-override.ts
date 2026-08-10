import path from "node:path";

import type { Resolution } from "./icon-importer";

/** Human-filled answers for shapes the dump couldn't name on its own —
 * `{ "icons/usecase/action/meaning-21.svg": "link" }`. Lives inside the
 * version folder so it travels with that dump and is committed like the
 * rest of it. */
const NAMES_OVERRIDE_FILENAME = "names.json";

const namesOverridePath = (versionDir: string): string =>
  path.resolve(versionDir, NAMES_OVERRIDE_FILENAME);

export const loadNamesOverride = async (
  versionDir: string
): Promise<Map<string, string>> => {
  const file = Bun.file(namesOverridePath(versionDir));
  if (!(await file.exists())) {
    return new Map();
  }

  const raw = (await file.json()) as Record<string, string>;
  const entries = Object.entries(raw).filter(([, slug]) => slug.trim());
  return new Map(entries);
};

/** Regenerates `names.json` from every resolution, not just the unresolved
 * ones: an answer that came from a previous `names.json` (`viaOverride`)
 * must round-trip back into the file even if it still doesn't resolve
 * cleanly — nothing else remembers it, so dropping it here would silently
 * un-name the shape on the next run. A shape whose own dump filename is
 * already unique and real doesn't need an entry at all. Unresolved shapes
 * and duplicate-slug shapes (two files that resolved to the same name) get
 * a blank slot to fill in. */
export const writeNamesStub = async (
  versionDir: string,
  allResolutions: Resolution[]
): Promise<void> => {
  const existing = await loadNamesOverride(versionDir);
  const stub: Record<string, string> = {};
  for (const resolution of allResolutions) {
    for (const entry of resolution.entries) {
      if (entry.viaOverride) {
        stub[entry.relPath] = existing.get(entry.relPath) ?? "";
      } else if (resolution.kind !== "resolved") {
        stub[entry.relPath] = "";
      }
    }
  }
  await Bun.write(
    namesOverridePath(versionDir),
    `${JSON.stringify(stub, null, 2)}\n`
  );
};
