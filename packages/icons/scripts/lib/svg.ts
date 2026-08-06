const SVG_ROOT = /<svg\b(?<attrs>[^>]*)>(?<inner>[\s\S]*?)<\/svg>/iu;
const ATTR = /(?<name>[a-zA-Z_:][a-zA-Z0-9_:-]*)="(?<value>[^"]*)"/gu;
const SELF_CLOSING_ELEMENT =
  /<(?<tag>[a-zA-Z]+)(?<attrs>(?:\s+[a-zA-Z_:][a-zA-Z0-9_:-]*="[^"]*")*)\s*\/>/gu;

/** Hardcoded fills used across the source set; normalized to `currentColor` so icon color is controlled via CSS (theme tokens) instead of baked-in hex values. */
const HARDCODED_FILLS = new Set(["#262626", "black"]);

const ATTR_NAME_TO_JSX: Record<string, string> = {
  "clip-rule": "clipRule",
  "fill-rule": "fillRule",
};

const DECIMAL_NUMBER = /-?\d+\.\d+/gu;
const TRAILING_ZEROS = /\.?0+$/u;
const PATH_PRECISION = 2;

/** Source paths carry ~4 decimal places of design-tool precision that's invisible at render size; rounding trims bytes shipped to users (flagged by react-doctor/rendering-svg-precision). */
const roundPathPrecision = (value: string): string =>
  value.replace(DECIMAL_NUMBER, (numeral) =>
    Number(numeral).toFixed(PATH_PRECISION).replace(TRAILING_ZEROS, "")
  );

/** Named capture groups are typed as possibly-undefined; this asserts a group a matched pattern guarantees actually exists. */
const requireGroup = (
  match: RegExpMatchArray,
  name: string,
  fileLabel: string
): string => {
  const value = match.groups?.[name];
  if (value === undefined) {
    throw new Error(
      `${fileLabel}: expected capture group "${name}" to be present`
    );
  }
  return value;
};

const parseAttrs = (raw: string, fileLabel: string): [string, string][] => {
  const attrs: [string, string][] = [];
  for (const match of raw.matchAll(ATTR)) {
    attrs.push([
      requireGroup(match, "name", fileLabel),
      requireGroup(match, "value", fileLabel),
    ]);
  }
  return attrs;
};

const renderElement = (
  tag: string,
  rawAttrs: string,
  fileLabel: string
): string => {
  const jsxAttrs = parseAttrs(rawAttrs, fileLabel).map(([name, value]) => {
    const jsxName = ATTR_NAME_TO_JSX[name] ?? name;
    const jsxValue =
      jsxName === "fill" && HARDCODED_FILLS.has(value)
        ? "currentColor"
        : roundPathPrecision(value);
    return `${jsxName}="${jsxValue}"`;
  });
  return `<${tag} ${jsxAttrs.join(" ")} />`;
};

export interface ParsedSvg {
  viewBox: string;
  children: string;
}

/** Renders every self-closing `<path|circle .../>` child element found in `inner` to JSX-ready markup. */
const extractElements = (inner: string, fileLabel: string): string[] => {
  const elements: string[] = [];
  for (const match of inner.matchAll(SELF_CLOSING_ELEMENT)) {
    elements.push(
      renderElement(
        requireGroup(match, "tag", fileLabel),
        requireGroup(match, "attrs", fileLabel),
        fileLabel
      )
    );
  }
  return elements;
};

/** Throws unless `inner` was made up entirely of the self-closing elements already extracted into `elements` — i.e. nothing this generator doesn't understand was silently dropped. */
const assertFullyParsed = (
  inner: string,
  elements: string[],
  fileLabel: string
): void => {
  const whitespaceOnlyRemainder =
    inner.replace(SELF_CLOSING_ELEMENT, "").trim().length === 0;
  if (elements.length === 0 || !whitespaceOnlyRemainder) {
    throw new Error(
      `${fileLabel}: contains markup this generator doesn't understand (expected only self-closing <path>/<circle> children) — extend scripts/lib/svg.ts`
    );
  }
};

/** Parses the uniform `<svg><path|circle .../></svg>` shape used by every source icon and rewrites it to JSX-ready, theme-aware markup. Throws on anything it doesn't recognize instead of silently dropping markup. */
export const parseSvg = (source: string, fileLabel: string): ParsedSvg => {
  const rootMatch = SVG_ROOT.exec(source);
  if (!rootMatch) {
    throw new Error(`${fileLabel}: could not find a root <svg> element`);
  }

  const rootAttrsRaw = requireGroup(rootMatch, "attrs", fileLabel);
  const inner = requireGroup(rootMatch, "inner", fileLabel);
  const rootAttrs = new Map(parseAttrs(rootAttrsRaw, fileLabel));
  const viewBox = rootAttrs.get("viewBox");
  if (!viewBox) {
    throw new Error(`${fileLabel}: root <svg> is missing a viewBox`);
  }

  const trimmedInner = inner.trim();
  const elements = extractElements(trimmedInner, fileLabel);
  assertFullyParsed(trimmedInner, elements, fileLabel);

  return { children: elements.join("\n    "), viewBox };
};
