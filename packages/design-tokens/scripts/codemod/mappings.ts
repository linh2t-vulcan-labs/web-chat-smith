import { readFileSync } from "node:fs";
import path from "node:path";

const { resolve } = path;

const LEGACY_PALETTE_CLASS =
  /^(?<utility>bg|text|border|ring|fill|stroke)-(?<family>slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?<shade>50|100|200|300|400|500|600|700|800|900|950)$/u;

const LEGACY_NUMERIC_SPACING =
  /^(?<negative>-)?(?<utility>p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y)-(?<size>\d+)$/u;

interface DesignTokenMap {
  legacyClassMap?: Record<string, string>;
  paletteMap?: Record<string, Record<string, string>>;
  spacingMap?: Record<string, string>;
}

const FIXTURE_PATH = resolve(
  import.meta.dir,
  "../../../../tools/oxlint/design-tokens-plugin/fixtures/design-token-map.json"
);

const loadDesignTokenMap = (): DesignTokenMap => {
  try {
    const raw = readFileSync(FIXTURE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) {
      return {};
    }

    return parsed as DesignTokenMap;
  } catch {
    return {};
  }
};

const tokenMap = loadDesignTokenMap();
const COLOR_MAPPING: Record<
  string,
  Record<string, string>
> = tokenMap.paletteMap ?? {};
const SPACING_MAPPING: Record<string, string> = tokenMap.spacingMap ?? {};

export const codemodMappings: Record<string, string> =
  tokenMap.legacyClassMap ?? {};

const migratePaletteToken = (token: string): string | null => {
  const match = token.match(LEGACY_PALETTE_CLASS);
  if (!match) {
    return null;
  }

  const [, utility, family, shade] = match;
  if (!utility || !family || !shade) {
    return null;
  }

  const mapped = COLOR_MAPPING[family]?.[shade];
  if (!mapped) {
    return null;
  }

  return `${utility}-${mapped}`;
};

const migrateSpacingToken = (token: string): string | null => {
  const match = token.match(LEGACY_NUMERIC_SPACING);
  if (!match) {
    return null;
  }

  const [, negative, utility, size] = match;
  if (!utility || !size) {
    return null;
  }

  if (negative) {
    return null;
  }

  const mapped = SPACING_MAPPING[size];
  if (!mapped) {
    return null;
  }

  return `${utility}-${mapped}`;
};

export const migrateLegacyClassToken = (token: string): string | null => {
  if (!token) {
    return null;
  }

  const important = token.startsWith("!") ? "!" : "";
  const cleanToken = important ? token.slice(1) : token;

  const parts = cleanToken.split(":");
  const base = parts.at(-1);
  if (!base) {
    return null;
  }

  const variantPrefix = parts.slice(0, -1).join(":");
  const directMapped = codemodMappings[base];
  const dynamicMapped = migratePaletteToken(base) ?? migrateSpacingToken(base);
  const mappedBase = directMapped ?? dynamicMapped;

  if (!mappedBase || mappedBase === base) {
    return null;
  }

  const withVariant = variantPrefix
    ? `${variantPrefix}:${mappedBase}`
    : mappedBase;

  return `${important}${withVariant}`;
};
