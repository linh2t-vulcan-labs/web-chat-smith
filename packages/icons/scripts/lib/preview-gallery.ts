import path from "node:path";

import { tryRenderGenerated } from "./generated-render";
import { escapeHtml } from "./html-escape";
import { byKind } from "./icon-importer";
import type { Entry, Resolution } from "./icon-importer";
import { writeNamesStub } from "./names-override";

export const PREVIEW_GALLERY_FILENAME = "preview.html";

const rawSvgCard = async (
  dumpDir: string,
  relPath: string,
  caption: string
): Promise<string> => {
  const svg = await Bun.file(path.join(dumpDir, relPath)).text();
  return `<figure>${svg}<figcaption>${escapeHtml(caption)}</figcaption></figure>`;
};

/** One card for a resolved, generatable shape. Prefers the real generated
 * component (imported and server-rendered — exactly what `@cs/icons/<slug>`
 * hands a consumer) so a bug in the parse/JSX-emit pipeline shows up here
 * even though the raw dump SVG would look fine. Falls back to the raw
 * source only when nothing's been generated yet (e.g. previewing a version
 * before its first `bun run gen`) — a real render error gets its own
 * visible card instead of silently masking as the raw shape. */
const generatedOrRawSvgCard = async (
  dumpDir: string,
  generatedVersionDir: string,
  entry: Entry,
  category: string,
  slug: string
): Promise<string> => {
  const rendered = await tryRenderGenerated(
    generatedVersionDir,
    category,
    slug
  );
  if (rendered.ok) {
    return `<figure>${rendered.markup}<figcaption>${escapeHtml(slug)}</figcaption></figure>`;
  }
  if (rendered.reason === "error") {
    return `<figure class="render-error"><p class="error-mark">⚠</p><figcaption>${escapeHtml(slug)}<br><span class="error-msg">${escapeHtml(rendered.message)}</span></figcaption></figure>`;
  }
  return rawSvgCard(dumpDir, entry.relPath, slug);
};

const grid = (cards: string[]): string =>
  `<div class="grid">${cards.join("\n")}</div>`;

const buildUnresolvedGrid = async (
  dumpDir: string,
  resolutions: Resolution[]
): Promise<string> => {
  const entries = resolutions.flatMap((resolution) => resolution.entries);
  if (entries.length === 0) {
    return "";
  }
  const cards = await Promise.all(
    entries.map((entry) => rawSvgCard(dumpDir, entry.relPath, entry.relPath))
  );
  return `<h3>Unresolved (${entries.length})</h3>
<p class="hint">No real name anywhere in this dump — fill in a slug per shape in names.json (same folder), then re-run "bun run gen".</p>
${grid(cards)}`;
};

const buildDuplicateGrid = async (
  dumpDir: string,
  duplicates: Resolution[]
): Promise<string> => {
  if (duplicates.length === 0) {
    return "";
  }
  const groups = await Promise.all(
    duplicates.map(async (resolution) => {
      const cards = await Promise.all(
        resolution.entries.map((entry) =>
          rawSvgCard(dumpDir, entry.relPath, entry.relPath)
        )
      );
      return `<div class="dup-group">
  <p class="hint">${resolution.entries.length} shapes all want the slug "${escapeHtml(resolution.slug ?? "")}" — rename all but one in names.json.</p>
  ${grid(cards)}
</div>`;
    })
  );
  const total = duplicates.reduce(
    (sum, resolution) => sum + resolution.entries.length,
    0
  );
  return `<h3>Duplicate names (${total})</h3>
${groups.join("\n")}`;
};

const buildResolvedGrid = async (
  dumpDir: string,
  generatedVersionDir: string,
  resolved: Resolution[],
  unparsedRelPaths: Set<string>
): Promise<string> => {
  if (resolved.length === 0) {
    return "";
  }
  const generatable = resolved.filter(
    (resolution) => !unparsedRelPaths.has(resolution.entries[0]?.relPath ?? "")
  );
  const unparsed = resolved.filter((resolution) =>
    unparsedRelPaths.has(resolution.entries[0]?.relPath ?? "")
  );

  const [generatableCards, unparsedCards] = await Promise.all([
    Promise.all(
      generatable.map((resolution) => {
        const entry = resolution.entries[0] as Entry;
        const slug = resolution.slug ?? entry.base;
        return generatedOrRawSvgCard(
          dumpDir,
          generatedVersionDir,
          entry,
          entry.category,
          slug
        );
      })
    ),
    Promise.all(
      unparsed.map((resolution) => {
        const entry = resolution.entries[0] as Entry;
        return rawSvgCard(
          dumpDir,
          entry.relPath,
          resolution.slug ?? entry.base
        );
      })
    ),
  ]);

  const resolvedHtml =
    generatable.length > 0
      ? `<h3>Resolved (${generatable.length})</h3>
${grid(generatableCards)}`
      : "";
  const unparsedHtml =
    unparsed.length > 0
      ? `<h3>Named, but couldn't parse (${unparsed.length})</h3>
<p class="hint">Markup beyond what lib/svg.ts understands — gradients, groups, embedded images. These won't generate a component until lib/svg.ts is extended.</p>
${grid(unparsedCards)}`
      : "";
  return `${resolvedHtml}${unparsedHtml}`;
};

const buildCategorySection = async (
  dumpDir: string,
  generatedVersionDir: string,
  category: string,
  resolutions: Resolution[],
  unparsedRelPaths: Set<string>
): Promise<string> => {
  const [unresolvedHtml, duplicatesHtml, resolvedHtml] = await Promise.all([
    buildUnresolvedGrid(dumpDir, byKind(resolutions, "unresolved")),
    buildDuplicateGrid(dumpDir, byKind(resolutions, "duplicate")),
    buildResolvedGrid(
      dumpDir,
      generatedVersionDir,
      byKind(resolutions, "resolved"),
      unparsedRelPaths
    ),
  ]);
  const total = resolutions.reduce(
    (sum, resolution) => sum + resolution.entries.length,
    0
  );
  return `<section>
  <h2>${escapeHtml(category)} (${total})</h2>
  ${unresolvedHtml}${duplicatesHtml}${resolvedHtml}
</section>`;
};

const groupByCategory = (
  resolutions: Resolution[]
): Map<string, Resolution[]> => {
  const groups = new Map<string, Resolution[]>();
  for (const resolution of resolutions) {
    const category = resolution.entries[0]?.category ?? "";
    const list = groups.get(category) ?? [];
    list.push(resolution);
    groups.set(category, list);
  }
  return groups;
};

const buildPreviewGalleryHtml = async (
  dumpDir: string,
  generatedVersionDir: string,
  resolutions: Resolution[],
  unparsedRelPaths: Set<string>
): Promise<string> => {
  const groups = groupByCategory(resolutions);
  const sections = await Promise.all(
    [...groups.entries()]
      .toSorted(([a], [b]) => a.localeCompare(b))
      .map(([category, categoryResolutions]) =>
        buildCategorySection(
          dumpDir,
          generatedVersionDir,
          category,
          categoryResolutions,
          unparsedRelPaths
        )
      )
  );

  return `<!doctype html>
<html><head><meta charset="utf-8" /><title>Icon preview</title>
<style>
  body { font-family: system-ui, sans-serif; background: #111; color: #eee; padding: 2rem; }
  h1 { font-size: 1.1rem; color: #eee; }
  h2 { font-size: 1rem; color: #fff; margin-top: 2.5rem; border-bottom: 1px solid #333; padding-bottom: 0.5rem; }
  h3 { font-size: 0.85rem; color: #ccc; margin-top: 1.5rem; }
  .hint { font-size: 0.8rem; color: #999; max-width: 60rem; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem; margin-top: 0.75rem; }
  .dup-group { margin-top: 1rem; padding: 0.75rem; background: #181818; border-radius: 8px; }
  figure { margin: 0; background: #1c1c1c; border-radius: 8px; padding: 1rem; text-align: center; }
  figure svg { width: 40px; height: 40px; }
  figcaption { margin-top: 0.5rem; font-size: 11px; color: #999; word-break: break-all; }
  figure.render-error { background: #2a1414; border: 1px solid #722; }
  .error-mark { margin: 0; font-size: 20px; color: #f66; }
  .error-msg { color: #f99; font-size: 10px; }
</style></head>
<body>
<h1>Every icon in this dump, grouped by category then status. Resolved shapes render the real generated component when one exists.</h1>
${sections.join("\n")}
</body></html>`;
};

/** Writes everything a human needs to review a dump: the preview gallery
 * (grouped by category, then by resolved/duplicate/unresolved, with
 * resolved further split against `unparsedRelPaths` so a shape that won't
 * actually generate shows up as such) plus the `names.json` stub. Resolved
 * shapes prefer rendering the actual generated component from
 * `generatedVersionDir` over the raw dump SVG — falls back to raw only when
 * nothing's been generated yet, so this is still safe to call before
 * generating anything (the whole dump just renders from source, same as
 * before). It's what both `preview` and `gen` call. */
export const writePreviewArtifacts = async (
  dumpDir: string,
  generatedVersionDir: string,
  resolutions: Resolution[],
  unparsedRelPaths: Set<string>
): Promise<void> => {
  const [html] = await Promise.all([
    buildPreviewGalleryHtml(
      dumpDir,
      generatedVersionDir,
      resolutions,
      unparsedRelPaths
    ),
    writeNamesStub(dumpDir, resolutions),
  ]);
  await Bun.write(path.join(dumpDir, PREVIEW_GALLERY_FILENAME), html);
};
