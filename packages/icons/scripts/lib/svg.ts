const SVG_ROOT = /<svg\b(?<attrs>[^>]*)>(?<inner>[\s\S]*?)<\/svg>/iu;
const ATTR = /(?<name>[a-zA-Z_:][a-zA-Z0-9_:-]*)="(?<value>[^"]*)"/gu;
/** Matches an opening tag (with or without a trailing `/`) or a closing tag —
 * covers every element form actually used across the dump: self-closing
 * (`<path .../>`), container (`<g ...>...</g>`), and closing (`</g>`). */
const TAG_TOKEN =
  /<(?<closing>\/)?(?<tag>[a-zA-Z][a-zA-Z0-9]*)(?<attrs>(?:\s+[a-zA-Z_:][a-zA-Z0-9_:-]*="[^"]*")*)\s*(?<selfClosing>\/)?>/gu;

/** Elements actually used across `figma-icons/**` (icons + graphics). A new
 * one showing up throws a clear "not supported yet" error instead of
 * silently dropping markup — add it here once you've checked what attributes
 * it needs. `<use>`/`<image>`/`<pattern>` (embedded base64 raster fills) are
 * deliberately not supported: the only dump files that use them are junk
 * test assets (a 🍌 emoji filename), not real icons. */
const SUPPORTED_TAGS = new Set([
  "circle",
  "defs",
  "ellipse",
  "g",
  "linearGradient",
  "mask",
  "path",
  "rect",
  "stop",
]);

/** Hardcoded fills used across the source set; normalized to `currentColor` so icon color is controlled via CSS (theme tokens) instead of baked-in hex values. */
const HARDCODED_FILLS = new Set(["#262626", "black"]);

const ATTR_NAME_TO_JSX: Record<string, string> = {
  "clip-rule": "clipRule",
  "fill-opacity": "fillOpacity",
  "fill-rule": "fillRule",
  "stop-color": "stopColor",
  "stop-opacity": "stopOpacity",
  "stroke-dasharray": "strokeDasharray",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-miterlimit": "strokeMiterlimit",
  "stroke-width": "strokeWidth",
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

/** Converts a plain CSS declaration string (`"mask-type:alpha"`) into a JSX
 * `style={{ ... }}` object-literal body — JSX rejects a string `style`
 * attribute on SVG elements, unlike plain HTML/SVG source. */
const toStyleObjectLiteral = (raw: string): string => {
  const props = raw
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => {
      const [property, value] = declaration
        .split(":")
        .map((part) => part.trim());
      const camelProperty = (property ?? "").replaceAll(
        /-(?<letter>[a-z])/gu,
        (_, letter: string) => letter.toUpperCase()
      );
      return `${camelProperty}: "${value ?? ""}"`;
    });
  return `{ ${props.join(", ")} }`;
};

const renderAttr = ([name, value]: [string, string]): string => {
  if (name === "style") {
    return `style={${toStyleObjectLiteral(value)}}`;
  }
  const jsxName = ATTR_NAME_TO_JSX[name] ?? name;
  const jsxValue =
    jsxName === "fill" && HARDCODED_FILLS.has(value)
      ? "currentColor"
      : roundPathPrecision(value);
  return `${jsxName}="${jsxValue}"`;
};

interface ElementNode {
  tag: string;
  attrs: [string, string][];
  children: ElementNode[];
}

/** Builds an element tree from `inner`'s tag stream. Throws on any text
 * content between tags, an unclosed element, or a mismatched closing tag —
 * every file in the dump is pure markup (no text nodes, comments, or CDATA),
 * so anything else means a shape this generator hasn't seen the like of. */
const parseElementTree = (inner: string, fileLabel: string): ElementNode[] => {
  const root: ElementNode = { attrs: [], children: [], tag: "#root" };
  const stack: ElementNode[] = [root];
  let cursor = 0;

  for (const match of inner.matchAll(TAG_TOKEN)) {
    const between = inner.slice(cursor, match.index).trim();
    if (between.length > 0) {
      throw new Error(
        `${fileLabel}: unexpected text content "${between}" — extend scripts/lib/svg.ts`
      );
    }
    cursor = (match.index ?? 0) + match[0].length;

    const tag = requireGroup(match, "tag", fileLabel);
    if (match.groups?.closing) {
      const top = stack.pop();
      if (top?.tag !== tag) {
        throw new Error(
          `${fileLabel}: mismatched closing tag </${tag}> — extend scripts/lib/svg.ts`
        );
      }
      continue;
    }

    const node: ElementNode = {
      attrs: parseAttrs(match.groups?.attrs ?? "", fileLabel),
      children: [],
      tag,
    };
    const parent = stack.at(-1);
    if (!parent) {
      throw new Error(`${fileLabel}: no open parent for <${tag}>`);
    }
    parent.children.push(node);
    if (!match.groups?.selfClosing) {
      stack.push(node);
    }
  }

  const trailing = inner.slice(cursor).trim();
  if (trailing.length > 0) {
    throw new Error(
      `${fileLabel}: unexpected trailing content — extend scripts/lib/svg.ts`
    );
  }
  if (stack.length !== 1) {
    throw new Error(
      `${fileLabel}: unclosed element <${stack.at(-1)?.tag}> — extend scripts/lib/svg.ts`
    );
  }
  return root.children;
};

const renderNode = (node: ElementNode, fileLabel: string): string => {
  if (!SUPPORTED_TAGS.has(node.tag)) {
    throw new Error(
      `${fileLabel}: <${node.tag}> is not supported yet — extend scripts/lib/svg.ts`
    );
  }
  const jsxAttrs = node.attrs.map(renderAttr).join(" ");
  const openTag = jsxAttrs ? `<${node.tag} ${jsxAttrs}` : `<${node.tag}`;
  if (node.children.length === 0) {
    return `${openTag} />`;
  }
  const childrenJsx = node.children
    .map((child) => renderNode(child, fileLabel))
    .join("\n");
  return `${openTag}>\n${childrenJsx}\n</${node.tag}>`;
};

export interface ParsedSvg {
  viewBox: string;
  children: string;
}

/** Parses a source icon/graphic's `<svg>` markup and rewrites it to
 * JSX-ready, theme-aware markup — any element tree made up of
 * `SUPPORTED_TAGS`, not just the flat self-closing `<path>/<circle>` shape
 * every simple icon happens to use. Throws on anything it doesn't recognize
 * instead of silently dropping markup. */
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

  const tree = parseElementTree(inner.trim(), fileLabel);
  if (tree.length === 0) {
    throw new Error(`${fileLabel}: <svg> has no children`);
  }
  const children = tree.map((node) => renderNode(node, fileLabel)).join("\n");

  return { children, viewBox };
};
