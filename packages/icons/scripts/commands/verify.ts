import { existsSync } from "node:fs";
import path from "node:path";

import { styleText } from "../lib/console-colors";
import { readCurrentVersion, versionDir } from "../lib/figma-icons-version";
import { tryRenderGenerated } from "../lib/generated-render";
import type { RenderResult } from "../lib/generated-render";
import { byKind, resolveDump } from "../lib/icon-importer";
import { loadNamesOverride } from "../lib/names-override";
import { PREVIEW_GALLERY_FILENAME } from "../lib/preview-gallery";
import { tryParseEntry } from "../lib/svg-entry";

const PACKAGE_ROOT = path.join(import.meta.dir, "..", "..");
const GENERATED_ICONS_ROOT = path.join(PACKAGE_ROOT, "generated-icons");

const listGeneratedFiles = async (
  versionDirPath: string
): Promise<string[]> => {
  const glob = new Bun.Glob("*/*.tsx");
  const files: string[] = [];
  for await (const file of glob.scan({ cwd: versionDirPath })) {
    files.push(file);
  }
  return files.toSorted();
};

/** Terminal-only sanity check (no HTML — `bun run icons preview`/`gen`
 * already render every generated component visually in `preview.html`):
 * imports every file in `generated-icons/<version>/` and confirms it
 * actually renders, then cross-checks the count against how many parseable
 * resolved shapes the dump has. Exits non-zero on any render failure or
 * count mismatch, so it's usable as a CI gate. */
export const run = async (args: string[]): Promise<void> => {
  const version = args[0] ?? (await readCurrentVersion());
  const dumpDir = versionDir(version);
  const versionDirPath = path.join(GENERATED_ICONS_ROOT, version);
  if (!existsSync(dumpDir)) {
    throw new Error(`figma-icons/${version} does not exist`);
  }
  if (!existsSync(versionDirPath)) {
    throw new Error(
      `generated-icons/${version} does not exist — run "bun run gen" first`
    );
  }

  const namesOverride = await loadNamesOverride(dumpDir);
  const { resolutions, unparsed } = await resolveDump(dumpDir, namesOverride);
  const resolved = byKind(resolutions, "resolved");
  const duplicateCount = byKind(resolutions, "duplicate").reduce(
    (sum, resolution) => sum + resolution.entries.length,
    0
  );
  const unresolvedCount = byKind(resolutions, "unresolved").length;

  const parseChecks = await Promise.all(
    resolved.map(async (resolution) => {
      const [entry] = resolution.entries;
      if (!entry) {
        return true;
      }
      const parsed = await tryParseEntry(dumpDir, entry);
      return parsed.ok;
    })
  );
  const unparseableCount = parseChecks.filter((ok) => !ok).length;
  const expectedGeneratedCount = resolved.length - unparseableCount;

  const files = await listGeneratedFiles(versionDirPath);
  const results = await Promise.all(
    files.map(async (relFile) => {
      const [category, filename] = relFile.split(path.sep);
      const slug = (filename ?? "").replace(/\.tsx$/u, "");
      const result = await tryRenderGenerated(
        versionDirPath,
        category ?? "",
        slug
      );
      return { relFile, result };
    })
  );
  const failed = results.filter(
    (
      item
    ): item is {
      relFile: string;
      result: Extract<RenderResult, { ok: false }>;
    } => !item.result.ok
  );

  console.log(
    styleText(
      "green",
      `Imported + rendered ${files.length - failed.length} of ${files.length} generated component(s).`
    )
  );
  if (failed.length > 0) {
    console.log(styleText("red", `Failed to render: ${failed.length}`));
    for (const item of failed) {
      const detail =
        item.result.reason === "error" ? item.result.message : "missing";
      console.log(styleText("red", `  ${item.relFile}: ${detail}`));
    }
  }

  const dumpVsGenerated = expectedGeneratedCount - files.length;
  if (dumpVsGenerated === 0) {
    console.log(
      styleText(
        "green",
        `generated-icons/ matches every parseable resolved shape in the dump (${files.length}).`
      )
    );
  } else {
    console.log(
      styleText(
        "yellow",
        `Dump has ${expectedGeneratedCount} parseable resolved shape(s) but generated-icons/ has ${files.length} file(s) (diff ${dumpVsGenerated}) — run "bun run gen" to resync.`
      )
    );
  }
  console.log(
    `Dump-side gaps: ${duplicateCount} duplicate(s), ${unresolvedCount} unresolved, ${unparseableCount} named-but-unparseable, ${unparsed.length} unreadable dump file(s) — see "bun run icons audit".`
  );
  console.log(
    `Open ${path.join(dumpDir, PREVIEW_GALLERY_FILENAME)} to see every generated icon rendered.`
  );

  if (failed.length > 0 || dumpVsGenerated !== 0) {
    process.exitCode = 1;
  }
};
