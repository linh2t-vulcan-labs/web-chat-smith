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

const codemodMappings: Record<string, string> = tokenMap.legacyClassMap ?? {};

interface PaletteClassGroups {
  family: string;
  shade: string;
  utility: string;
}

interface SpacingClassGroups {
  negative?: string;
  size: string;
  utility: string;
}

const lookupPaletteMapping = (groups: PaletteClassGroups): string | null =>
  COLOR_MAPPING[groups.family]?.[groups.shade] ?? null;

const migratePaletteToken = (token: string): string | null => {
  const groups = LEGACY_PALETTE_CLASS.exec(token)?.groups as
    | PaletteClassGroups
    | undefined;
  if (!groups) {
    return null;
  }

  const mapped = lookupPaletteMapping(groups);
  return mapped ? `${groups.utility}-${mapped}` : null;
};

const hasUsableSpacingMatch = (
  groups: SpacingClassGroups | undefined
): groups is SpacingClassGroups => {
  if (!groups) {
    return false;
  }

  return !groups.negative;
};

const lookupSpacingMapping = (groups: SpacingClassGroups): string | null =>
  SPACING_MAPPING[groups.size] ?? null;

const migrateSpacingToken = (token: string): string | null => {
  const groups = LEGACY_NUMERIC_SPACING.exec(token)?.groups as
    | SpacingClassGroups
    | undefined;
  if (!hasUsableSpacingMatch(groups)) {
    return null;
  }

  const mapped = lookupSpacingMapping(groups);
  return mapped ? `${groups.utility}-${mapped}` : null;
};

const splitImportantPrefix = (
  token: string
): { clean: string; important: string } => {
  const important = token.startsWith("!") ? "!" : "";
  return { clean: important ? token.slice(1) : token, important };
};

const splitVariantPrefix = (
  token: string
): { base: string | undefined; variantPrefix: string } => {
  const parts = token.split(":");
  return {
    base: parts.at(-1),
    variantPrefix: parts.slice(0, -1).join(":"),
  };
};

const resolveMappedBase = (base: string): string | null =>
  codemodMappings[base] ??
  migratePaletteToken(base) ??
  migrateSpacingToken(base);

const applyVariantPrefix = (variantPrefix: string, base: string): string =>
  variantPrefix ? `${variantPrefix}:${base}` : base;

const isNewMapping = (
  mappedBase: string | null,
  base: string
): mappedBase is string => {
  if (!mappedBase) {
    return false;
  }

  return mappedBase !== base;
};

export const migrateLegacyClassToken = (token: string): string | null => {
  if (!token) {
    return null;
  }

  const { clean, important } = splitImportantPrefix(token);
  const { base, variantPrefix } = splitVariantPrefix(clean);
  if (!base) {
    return null;
  }

  const mappedBase = resolveMappedBase(base);
  if (!isNewMapping(mappedBase, base)) {
    return null;
  }

  return `${important}${applyVariantPrefix(variantPrefix, mappedBase)}`;
};
