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

interface ModeOverrideSources {
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

const FONT_SIZE_PATH_PREFIX = "font_size.";

const isFontSizeToken = (entry: FlatToken, cssValue: string): boolean =>
  entry.path.startsWith(FONT_SIZE_PATH_PREFIX) &&
  FONT_SIZE_HINTS.some((hint) => entry.path.includes(hint)) &&
  isLengthValue(cssValue);

type AliasClassifier = (entry: FlatToken, cssValue: string) => boolean;

const ALIAS_CLASSIFIERS: [prefix: string, matches: AliasClassifier][] = [
  ["color", isColorToken],
  ["spacing", isSpacingToken],
  ["radius", isRadiusToken],
  ["shadow", (entry) => isShadowToken(entry)],
  ["text", isFontSizeToken],
];

/** Classifies a token into the `@theme inline` alias prefix it should emit, if any. */
const classifyAliasPrefix = (
  entry: FlatToken,
  cssValue: string
): string | null => {
  const classifier = ALIAS_CLASSIFIERS.find(([, matches]) =>
    matches(entry, cssValue)
  );

  return classifier ? classifier[0] : null;
};

const createThemeAliases = (flatTokens: FlatToken[]): ThemeAlias[] => {
  const aliases = new Map<string, string>();

  for (const entry of flatTokens) {
    const cssValue = asCssValue(entry.token.$value);
    if (!cssValue) {
      continue;
    }

    const prefix = classifyAliasPrefix(entry, cssValue);
    if (!prefix) {
      continue;
    }

    const cssVar = toSafeCssVar(entry.path);
    const normalizedPath = normalizePathForThemeName(entry.path);
    aliases.set(`--${prefix}-cs-${normalizedPath}`, cssVar);
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

const renderTypographyBlock = (entry: FlatToken): string | null => {
  if (!isTypographyToken(entry)) {
    return null;
  }

  const declarations = toTypographyDeclarations(entry.token.$value);
  if (declarations.length === 0) {
    return null;
  }

  const className = toTypographyClassName(entry.path);
  const lines = [`@utility ${className} {`];
  for (const declaration of declarations) {
    lines.push(`  ${declaration.property}: ${declaration.value};`);
  }
  lines.push("}", "");

  return lines.join("\n");
};

const renderTypographyUtilities = (flatTokens: FlatToken[]): string => {
  const blocks = flatTokens
    .map((entry) => renderTypographyBlock(entry))
    .filter((block): block is string => block !== null);

  return blocks.join("\n");
};

const cssFieldValue = (value: unknown, fallback: string): string =>
  asCssValue(value) ?? fallback;

const shadowLayerToCss = (value: Record<string, unknown>): string => {
  const offsetX = cssFieldValue(value.offsetX, "0px");
  const offsetY = cssFieldValue(value.offsetY, "0px");
  const blur = cssFieldValue(value.blur, "0px");
  const spread = cssFieldValue(value.spread, "0px");
  const color = cssFieldValue(value.color, "#000000");

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

    lines.push(`  ${toSafeCssVar(path)}: ${value};`);
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
      name: toSafeCssVar(entry.path),
      value: cssValue,
    });
  }

  const rootVars = toRootCssBlock(variables);
  const themeInline = renderThemeInlineBlock(createThemeAliases(flatTokens));

  return `${rootVars}${themeInline}`;
};

interface ModeOverrideVariant {
  source: TokenMap;
  wrap: (lines: string[]) => string;
}

const buildModeOverrideChunks = (
  baseline: TokenMap,
  variants: ModeOverrideVariant[]
): string[] => {
  const baselineFlat = flattenScalarTokens(baseline);
  const chunks: string[] = [];

  for (const variant of variants) {
    const variantFlat = flattenScalarTokens(variant.source);
    const lines = toCssVarAssignments(baselineFlat, variantFlat);
    const block = variant.wrap(lines);
    if (block) {
      chunks.push(block);
    }
  }

  return chunks;
};

const pickDensitySources = (
  sources: ModeOverrideSources
): [defaultTokens: TokenMap, compact: TokenMap, spacious: TokenMap] | null => {
  const { densityDefault, densityCompact, densitySpacious } = sources;
  if (!(densityDefault && densityCompact && densitySpacious)) {
    return null;
  }

  return [densityDefault, densityCompact, densitySpacious];
};

const pickDeviceSources = (
  sources: ModeOverrideSources
): [desktop: TokenMap, tablet: TokenMap, mobile: TokenMap] | null => {
  const { deviceDesktop, deviceTablet, deviceMobile } = sources;
  if (!(deviceDesktop && deviceTablet && deviceMobile)) {
    return null;
  }

  return [deviceDesktop, deviceTablet, deviceMobile];
};

export const generateModeOverridesCss = (
  sources: ModeOverrideSources
): string => {
  const chunks: string[] = [];

  const density = pickDensitySources(sources);
  if (density) {
    const [defaultTokens, compact, spacious] = density;
    chunks.push(
      ...buildModeOverrideChunks(defaultTokens, [
        {
          source: compact,
          wrap: (lines) => wrapRule('[data-density="compact"]', lines),
        },
        {
          source: spacious,
          wrap: (lines) => wrapRule('[data-density="spacious"]', lines),
        },
      ])
    );
  }

  const device = pickDeviceSources(sources);
  if (device) {
    const [desktop, tablet, mobile] = device;
    chunks.push(
      ...buildModeOverrideChunks(desktop, [
        {
          source: tablet,
          wrap: (lines) => wrapMediaRule("(max-width: 1024px)", lines),
        },
        {
          source: mobile,
          wrap: (lines) => wrapMediaRule("(max-width: 768px)", lines),
        },
      ])
    );
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

const typographyEntryToVariables = (entry: FlatToken): CssVariable[] => {
  if (!isTypographyToken(entry)) {
    return [];
  }

  const variables: CssVariable[] = [];
  for (const [property, value] of Object.entries(entry.token.$value)) {
    const cssValue = asCssValue(value);
    if (cssValue === null) {
      continue;
    }

    variables.push({
      name: toSafeCssVar(`${entry.path}.${property}`),
      value: cssValue,
    });
  }

  return variables;
};

export const generateTypographyCss = (flatTokens: FlatToken[]): string => {
  const variables = flatTokens.flatMap((entry) =>
    typographyEntryToVariables(entry)
  );

  const rootVars = toRootCssBlock(variables);
  const utilities = renderTypographyUtilities(flatTokens);
  if (!utilities) {
    return rootVars;
  }

  return `${rootVars}\n${utilities}`;
};

const shadowLayersToCss = (value: unknown[]): string | null => {
  const layers = value
    .filter((layer): layer is Record<string, unknown> => isObjectRecord(layer))
    .map((layer) => shadowLayerToCss(layer));

  return layers.length > 0 ? layers.join(", ") : null;
};

const toShadowCssValue = (value: TokenValue["$value"]): string | null => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return shadowLayersToCss(value);
  }

  if (isObjectRecord(value)) {
    return shadowLayerToCss(value);
  }

  return null;
};

export const generateShadowsCss = (flatTokens: FlatToken[]): string => {
  const variables: CssVariable[] = [];

  for (const entry of flatTokens) {
    if (entry.token.$type !== "shadow") {
      continue;
    }

    const shadowValue = toShadowCssValue(entry.token.$value);
    if (!shadowValue) {
      continue;
    }

    variables.push({
      name: toSafeCssVar(entry.path),
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
