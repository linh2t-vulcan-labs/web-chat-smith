import path from "node:path";

import type { FlatToken } from "./generators";
import { escapeHtml } from "./utils/html-escape";

export const TOKEN_PREVIEW_FILENAME = "_preview.html";

const isColorValue = (value: unknown): value is string =>
  typeof value === "string";

const renderValue = (value: FlatToken["token"]["$value"]): string =>
  typeof value === "string" ? value : JSON.stringify(value);

const buildColorCard = (token: FlatToken, dark?: FlatToken): string => {
  const light = token.token.$value;
  const darkValue = dark?.token.$value;
  const swatch = isColorValue(light)
    ? `<span class="swatch" style="background:${escapeHtml(light)}"></span>`
    : "";
  const darkSwatch =
    darkValue && isColorValue(darkValue)
      ? `<span class="swatch" style="background:${escapeHtml(darkValue)}"></span>`
      : "";
  return `<figure>
  <div class="swatches">${swatch}${darkSwatch}</div>
  <figcaption>${escapeHtml(token.path)}<br /><span class="value">${escapeHtml(renderValue(light))}</span></figcaption>
</figure>`;
};

const buildValueRow = (token: FlatToken): string =>
  `<tr><td>${escapeHtml(token.path)}</td><td class="value">${escapeHtml(renderValue(token.token.$value))}</td></tr>`;

const groupByType = (tokens: FlatToken[]): Map<string, FlatToken[]> => {
  const groups = new Map<string, FlatToken[]>();
  for (const token of tokens) {
    const list = groups.get(token.token.$type) ?? [];
    list.push(token);
    groups.set(token.token.$type, list);
  }
  return groups;
};

const buildColorSection = (
  colorTokens: FlatToken[],
  darkByPath: Map<string, FlatToken>
): string => {
  if (colorTokens.length === 0) {
    return "";
  }
  const cards = colorTokens.map((token) =>
    buildColorCard(token, darkByPath.get(token.path))
  );
  return `<section>
  <h2>Colors (${colorTokens.length})</h2>
  <div class="grid">${cards.join("\n")}</div>
</section>`;
};

const buildTableSection = (
  type: string,
  tokens: FlatToken[]
): string => `<section>
  <h2>${escapeHtml(type)} (${tokens.length})</h2>
  <table><tbody>${tokens.map(buildValueRow).join("\n")}</tbody></table>
</section>`;

const buildTokenPreviewHtml = (
  version: string,
  flatLight: FlatToken[],
  flatDark: FlatToken[]
): string => {
  const darkByPath = new Map(flatDark.map((token) => [token.path, token]));
  const groups = groupByType(flatLight);
  const colorTokens = groups.get("color") ?? [];
  groups.delete("color");

  const otherSections = [...groups.entries()]
    .toSorted(([a], [b]) => a.localeCompare(b))
    .map(([type, tokens]) => buildTableSection(type, tokens))
    .join("\n");

  return `<!doctype html>
<html><head><meta charset="utf-8" /><title>Token preview: ${escapeHtml(version)}</title>
<style>
  body { font-family: system-ui, sans-serif; background: #111; color: #eee; padding: 2rem; }
  h1 { font-size: 1.1rem; }
  h2 { font-size: 0.95rem; color: #ccc; margin-top: 2rem; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; margin-top: 0.75rem; }
  figure { margin: 0; background: #1c1c1c; border-radius: 8px; padding: 0.75rem; }
  .swatches { display: flex; gap: 0.4rem; }
  .swatch { display: block; width: 40px; height: 40px; border-radius: 6px; border: 1px solid #333; }
  figcaption { margin-top: 0.5rem; font-size: 11px; color: #999; word-break: break-all; }
  table { width: 100%; border-collapse: collapse; margin-top: 0.75rem; font-size: 12px; }
  td { padding: 0.25rem 0.5rem; border-bottom: 1px solid #222; }
  .value { color: #999; font-family: monospace; }
</style></head>
<body>
<h1>${escapeHtml(version)} — light values, dark swatch shown next to light where the token has both</h1>
${buildColorSection(colorTokens, darkByPath)}
${otherSections}
</body></html>`;
};

export const writeTokenPreview = async (
  versionDir: string,
  version: string,
  flatLight: FlatToken[],
  flatDark: FlatToken[]
): Promise<void> => {
  const html = buildTokenPreviewHtml(version, flatLight, flatDark);
  await Bun.write(path.join(versionDir, TOKEN_PREVIEW_FILENAME), html);
};
