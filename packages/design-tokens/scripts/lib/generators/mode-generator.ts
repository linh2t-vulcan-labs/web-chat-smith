import type { TokenMap, TokenValue } from "../resolver";
import { toRootCssBlock } from "../utils/css-formatter";
import type { CssVariable } from "../utils/css-formatter";
import { tokenPathToCssVar as toSafeCssVar } from "../utils/naming";
import { flattenTokenMap, isObjectRecord } from "../utils/token-tree";
import type { FlatTokenEntry } from "../utils/token-tree";

export type FlatToken = FlatTokenEntry;

interface ThemeAlias {
  name: string;
  sourceVar: string;
}

interface TypographyDeclaration {
  property: string;
  value: string;
}

export const tokenPathToCssVar = (path: string): string => toSafeCssVar(path);

export interface ModeOverrideSources {
  densityCompact?: TokenMap;
  densityDefault?: TokenMap;
  densitySpacious?: TokenMap;
  deviceDesktop?: TokenMap;
  deviceMobile?: TokenMap;
  deviceTablet?: TokenMap;
}

const asCssValue = (value: unknown): string | null => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return `${value}`;
  }

  return null;
};

const COLOR_VALUE_REGEX =
  /^(?:#(?:[\da-f]{3,8})|(?:rgb|rgba|hsl|hsla|oklch|oklab|lch|lab)\(|color\(|var\(--)[^\n]*$/iu;
const LENGTH_VALUE_REGEX =
  /^(?:0|(?:-?\d*\.?\d+)(?:px|r?em|vh|vw|svh|svw|lvh|lvw|dvh|dvw|%|ch|ex|cm|mm|in|pt|pc))$/iu;
const FONT_SIZE_HINTS = [
  "display",
  "heading",
  "title",
  "body",
  "label",
  "caption",
];
const TYPOGRAPHY_PROPERTY_TO_CSS = {
  fontFamily: "font-family",
  fontSize: "font-size",
  fontStyle: "font-style",
  fontWeight: "font-weight",
  letterSpacing: "letter-spacing",
  lineHeight: "line-height",
  textDecoration: "text-decoration",
  textTransform: "text-transform",
} as const;

const isColorValue = (value: string): boolean => COLOR_VALUE_REGEX.test(value);
const isLengthValue = (value: string): boolean =>
  LENGTH_VALUE_REGEX.test(value);

const normalizePathForThemeName = (path: string): string =>
  path.replaceAll(".", "-").replaceAll("_", "-").toLowerCase();

const normalizePathForUtilityName = (path: string): string => {
  const normalized = normalizePathForThemeName(path)
    .replaceAll(/[^a-z0-9-]+/gu, "-")
    .replaceAll(/-+/gu, "-")
    .replaceAll(/^-|-$/gu, "");

  return normalized || "token";
};

const isColorToken = (entry: FlatToken, cssValue: string): boolean =>
  entry.token.$type === "color" || isColorValue(cssValue);

const isSpacingToken = (entry: FlatToken, cssValue: string): boolean => {
  if (!entry.path.startsWith("spacing.")) {
    return false;
  }

  if (entry.path.includes("negative")) {
    return false;
  }

  return isLengthValue(cssValue);
};

const isRadiusToken = (entry: FlatToken, cssValue: string): boolean => {
  if (!entry.path.startsWith("radius.")) {
    return false;
  }

  return isLengthValue(cssValue);
};

const isShadowToken = (entry: FlatToken): boolean =>
  entry.token.$type === "shadow";

const isTypographyToken = (
  entry: FlatToken
): entry is FlatToken & {
  token: TokenValue & { $value: Record<string, unknown> };
} => entry.token.$type === "typography" && isObjectRecord(entry.token.$value);

const toTypographyClassName = (path: string): string =>
  `type-${normalizePathForUtilityName(path)}`;

const toTypographyDeclarations = (
  value: Record<string, unknown>
): TypographyDeclaration[] => {
  const declarations: TypographyDeclaration[] = [];

  for (const [tokenProperty, cssProperty] of Object.entries(
    TYPOGRAPHY_PROPERTY_TO_CSS
  )) {
    const raw = value[tokenProperty];
    const cssValue = asCssValue(raw);
    if (!cssValue) {
      continue;
    }

    declarations.push({ property: cssProperty, value: cssValue });
  }

  return declarations;
};

const createThemeAliases = (flatTokens: FlatToken[]): ThemeAlias[] => {
  const aliases = new Map<string, string>();

  for (const entry of flatTokens) {
    const cssValue = asCssValue(entry.token.$value);
    if (!cssValue) {
      continue;
    }

    const cssVar = toSafeCssVar(entry.path);
    const normalizedPath = normalizePathForThemeName(entry.path);

    if (isColorToken(entry, cssValue)) {
      aliases.set(`--color-cs-${normalizedPath}`, cssVar);
      continue;
    }

    if (isSpacingToken(entry, cssValue)) {
      aliases.set(`--spacing-cs-${normalizedPath}`, cssVar);
      continue;
    }

    if (isRadiusToken(entry, cssValue)) {
      aliases.set(`--radius-cs-${normalizedPath}`, cssVar);
      continue;
    }

    if (isShadowToken(entry)) {
      aliases.set(`--shadow-cs-${normalizedPath}`, cssVar);
      continue;
    }

    if (
      entry.path.startsWith("font_size.") &&
      FONT_SIZE_HINTS.some((hint) => entry.path.includes(hint)) &&
      isLengthValue(cssValue)
    ) {
      aliases.set(`--text-cs-${normalizedPath}`, cssVar);
    }
  }

  return [...aliases.entries()]
    .map(([name, sourceVar]) => ({ name, sourceVar }))
    .toSorted((a, b) => a.name.localeCompare(b.name));
};

const renderThemeInlineBlock = (aliases: ThemeAlias[]): string => {
  if (aliases.length === 0) {
    return "";
  }

  const lines = ["@theme inline {"];

  for (const alias of aliases) {
    lines.push(`  ${alias.name}: var(${alias.sourceVar});`);
  }

  lines.push("}", "");
  return `${lines.join("\n")}`;
};

const renderTypographyUtilities = (flatTokens: FlatToken[]): string => {
  const blocks: string[] = [];

  for (const entry of flatTokens) {
    if (!isTypographyToken(entry)) {
      continue;
    }

    const declarations = toTypographyDeclarations(entry.token.$value);
    if (declarations.length === 0) {
      continue;
    }

    const className = toTypographyClassName(entry.path);
    blocks.push(`@utility ${className} {`);
    for (const declaration of declarations) {
      blocks.push(`  ${declaration.property}: ${declaration.value};`);
    }
    blocks.push("}", "");
  }

  return blocks.join("\n");
};

const shadowLayerToCss = (value: Record<string, unknown>): string => {
  const offsetX = asCssValue(value.offsetX) ?? "0px";
  const offsetY = asCssValue(value.offsetY) ?? "0px";
  const blur = asCssValue(value.blur) ?? "0px";
  const spread = asCssValue(value.spread) ?? "0px";
  const color = asCssValue(value.color) ?? "#000000";

  return `${offsetX} ${offsetY} ${blur} ${spread} ${color}`;
};

const toScalarMap = (flatTokens: FlatToken[]): Map<string, string> => {
  const output = new Map<string, string>();

  for (const entry of flatTokens) {
    const cssValue = asCssValue(entry.token.$value);
    if (cssValue === null) {
      continue;
    }

    output.set(entry.path, cssValue);
  }

  return output;
};

const flattenScalarTokens = (current: TokenMap): Map<string, string> =>
  toScalarMap(flattenTokenMap(current));

const toCssVarAssignments = (
  baseline: Map<string, string>,
  target: Map<string, string>
): string[] => {
  const lines: string[] = [];

  for (const [path, value] of target) {
    if (baseline.get(path) === value) {
      continue;
    }

    lines.push(`  ${tokenPathToCssVar(path)}: ${value};`);
  }

  return lines;
};

const wrapRule = (selector: string, lines: string[]): string => {
  if (lines.length === 0) {
    return "";
  }

  return [`${selector} {`, ...lines, "}", ""].join("\n");
};

const wrapMediaRule = (query: string, lines: string[]): string => {
  if (lines.length === 0) {
    return "";
  }

  return [
    `@media ${query} {`,
    "  :root {",
    ...lines.map((line) => `  ${line}`),
    "  }",
    "}",
    "",
  ].join("\n");
};

export const flattenTokens = (
  current: TokenMap,
  parentPath = "",
  output: FlatToken[] = []
): FlatToken[] => flattenTokenMap(current, parentPath, output);

export const generateTokensCss = (flatTokens: FlatToken[]): string => {
  const variables: CssVariable[] = [];

  for (const entry of flatTokens) {
    const cssValue = asCssValue(entry.token.$value);
    if (cssValue === null) {
      continue;
    }

    variables.push({
      name: tokenPathToCssVar(entry.path),
      value: cssValue,
    });
  }

  const rootVars = toRootCssBlock(variables);
  const themeInline = renderThemeInlineBlock(createThemeAliases(flatTokens));

  return `${rootVars}${themeInline}`;
};

export const generateModeOverridesCss = (
  sources: ModeOverrideSources
): string => {
  const chunks: string[] = [];

  if (
    sources.densityDefault &&
    sources.densityCompact &&
    sources.densitySpacious
  ) {
    const defaultFlat = flattenScalarTokens(sources.densityDefault);
    const compactFlat = flattenScalarTokens(sources.densityCompact);
    const spaciousFlat = flattenScalarTokens(sources.densitySpacious);

    const compactLines = toCssVarAssignments(defaultFlat, compactFlat);
    const spaciousLines = toCssVarAssignments(defaultFlat, spaciousFlat);

    const compactBlock = wrapRule('[data-density="compact"]', compactLines);
    if (compactBlock) {
      chunks.push(compactBlock);
    }

    const spaciousBlock = wrapRule('[data-density="spacious"]', spaciousLines);
    if (spaciousBlock) {
      chunks.push(spaciousBlock);
    }
  }

  if (sources.deviceDesktop && sources.deviceTablet && sources.deviceMobile) {
    const desktopFlat = flattenScalarTokens(sources.deviceDesktop);
    const tabletFlat = flattenScalarTokens(sources.deviceTablet);
    const mobileFlat = flattenScalarTokens(sources.deviceMobile);

    const tabletLines = toCssVarAssignments(desktopFlat, tabletFlat);
    const mobileLines = toCssVarAssignments(desktopFlat, mobileFlat);

    const tabletBlock = wrapMediaRule("(max-width: 1024px)", tabletLines);
    if (tabletBlock) {
      chunks.push(tabletBlock);
    }

    const mobileBlock = wrapMediaRule("(max-width: 768px)", mobileLines);
    if (mobileBlock) {
      chunks.push(mobileBlock);
    }
  }

  return chunks.join("\n");
};

/**
 * Diffs a dark-resolved token tree against the light (baseline) tree and
 * emits only the `--cs-*` variables whose value actually changes, scoped to
 * `.dark`. Any shadcn variable built on top of one of these `--cs-*` paths
 * (see shadcn-bridge.ts) automatically inherits the correct dark value
 * through the CSS custom-property cascade — no separate dark mapping needed.
 */
export const generateDarkModeCss = (
  lightFlatTokens: FlatToken[],
  darkFlatTokens: FlatToken[]
): string => {
  const lightScalars = toScalarMap(lightFlatTokens);
  const darkScalars = toScalarMap(darkFlatTokens);
  const lines = toCssVarAssignments(lightScalars, darkScalars);

  return wrapRule(".dark", lines);
};

export const generateTypographyCss = (flatTokens: FlatToken[]): string => {
  const variables: CssVariable[] = [];

  for (const entry of flatTokens) {
    if (
      entry.token.$type !== "typography" ||
      !isObjectRecord(entry.token.$value)
    ) {
      continue;
    }

    for (const [property, value] of Object.entries(entry.token.$value)) {
      const cssValue = asCssValue(value);
      if (cssValue === null) {
        continue;
      }

      variables.push({
        name: tokenPathToCssVar(`${entry.path}.${property}`),
        value: cssValue,
      });
    }
  }

  const rootVars = toRootCssBlock(variables);
  const utilities = renderTypographyUtilities(flatTokens);
  if (!utilities) {
    return rootVars;
  }

  return `${rootVars}\n${utilities}`;
};

export const generateShadowsCss = (flatTokens: FlatToken[]): string => {
  const variables: CssVariable[] = [];

  for (const entry of flatTokens) {
    if (entry.token.$type !== "shadow") {
      continue;
    }

    const value = entry.token.$value;
    let shadowValue: string | null = null;

    if (typeof value === "string") {
      shadowValue = value.trim();
    } else if (Array.isArray(value)) {
      const layers = value
        .filter((layer): layer is Record<string, unknown> =>
          isObjectRecord(layer)
        )
        .map((layer) => shadowLayerToCss(layer));

      shadowValue = layers.length > 0 ? layers.join(", ") : null;
    } else if (isObjectRecord(value)) {
      shadowValue = shadowLayerToCss(value);
    }

    if (!shadowValue) {
      continue;
    }

    variables.push({
      name: tokenPathToCssVar(entry.path),
      value: shadowValue,
    });
  }

  return toRootCssBlock(variables);
};

export const generateIndexCss = (): string =>
  [
    '@import "./tokens.css";',
    '@import "./shadcn.css";',
    '@import "./typography.css";',
    '@import "./shadows.css";',
    '@import "./recipes.css";',
    "",
  ].join("\n");
