import type {
  BlockNode,
  ComponentNode,
  InlineNode,
  MarkdownDocument,
  MarkdownExtension,
  TextNode,
} from "@tanstack/markdown";

export const MERMAID_COMPONENT_TAG = "tanstack-mermaid-diagram";
export const CODE_BLOCK_COMPONENT_TAG = "tanstack-code-block";
export const MATH_BLOCK_COMPONENT_TAG = "tanstack-math-block";
export const MATH_INLINE_HREF_PREFIX = "tanstack-math-inline:";

/** Recurses `transform` into every container that can hold block children. */
const mapBlocksDeep = (
  blocks: BlockNode[],
  transform: (block: BlockNode) => BlockNode
): BlockNode[] =>
  blocks.map((block) => {
    const mapped = transform(block);
    if (mapped !== block) {
      return mapped;
    }
    switch (block.type) {
      case "blockquote":
      case "callout":
      case "component": {
        return {
          ...block,
          children: mapBlocksDeep(block.children, transform),
        };
      }
      case "list": {
        return {
          ...block,
          items: block.items.map((item) => ({
            ...item,
            children: mapBlocksDeep(item.children, transform),
          })),
        };
      }
      default: {
        return block;
      }
    }
  });

const toMermaidComponent = (source: string): ComponentNode => ({
  attributes: {},
  children: [],
  name: "mermaid",
  properties: { source },
  tagName: MERMAID_COMPONENT_TAG,
  type: "component",
});

export const mermaidExtension = (): MarkdownExtension => ({
  name: "mermaid",
  transformDocument(document: MarkdownDocument) {
    return {
      ...document,
      children: mapBlocksDeep(document.children, (block) =>
        block.type === "code" && block.lang === "mermaid"
          ? toMermaidComponent(block.value)
          : block
      ),
    };
  },
});

const toCodeBlockComponent = (block: {
  file?: string;
  lang?: string;
  title?: string;
  value: string;
}): ComponentNode => ({
  attributes: {},
  children: [],
  name: "code-block",
  properties: {
    code: block.value,
    filename: block.file ?? "",
    lang: block.lang ?? "plaintext",
    title: block.title ?? "",
  },
  tagName: CODE_BLOCK_COMPONENT_TAG,
  type: "component",
});

/**
 * Renders fenced code blocks through this app's own shiki-based CodeBlock
 * component (frame, language label, copy button) instead of a bare `<pre>`.
 * Must run after `mermaidExtension` so mermaid fences are already converted
 * and don't get double-wrapped as plain code blocks.
 */
export const codeBlockExtension = (): MarkdownExtension => ({
  name: "code-block",
  transformDocument(document: MarkdownDocument) {
    return {
      ...document,
      children: mapBlocksDeep(document.children, (block) =>
        block.type === "code" ? toCodeBlockComponent(block) : block
      ),
    };
  },
});

const toMathBlockComponent = (source: string): ComponentNode => ({
  attributes: {},
  children: [],
  name: "math-block",
  properties: { source },
  tagName: MATH_BLOCK_COMPONENT_TAG,
  type: "component",
});

/**
 * `$$...$$` has no native block syntax in @tanstack/markdown, so this parses
 * it manually. While streaming and the closing `$$` hasn't arrived yet, it
 * consumes the rest of the input as a placeholder rather than letting it fall
 * through to paragraph parsing (avoids a flash of raw `$$` source).
 */
const findMathBlockClose = (
  lines: readonly string[],
  startIndex: number
): { body: string[]; cursor: number; closed: boolean } => {
  const body: string[] = [];
  let cursor = startIndex;

  while (cursor < lines.length) {
    const line = lines[cursor] ?? "";
    if (line.trim() === "$$") {
      return { body, cursor: cursor + 1, closed: true };
    }
    body.push(line);
    cursor += 1;
  }
  return { body, cursor, closed: false };
};

const parseMathBlock = (
  context: Parameters<NonNullable<MarkdownExtension["parseBlock"]>>[0]
) => {
  const first = context.lines[context.index] ?? "";
  if (first.trim() !== "$$") {
    return;
  }

  const { body, cursor, closed } = findMathBlockClose(
    context.lines,
    context.index + 1
  );

  if (!closed) {
    context.consume(context.lines.length - context.index);
    return toMathBlockComponent("");
  }

  context.consume(cursor - context.index);
  return toMathBlockComponent(body.join("\n"));
};

const inlineMathPattern = /\$(?<source>[^\s$](?:[^$\n]*[^\s$])?)\$/gu;

const toInlineMathNode = (source: string): InlineNode => ({
  children: [{ type: "text", value: source }],
  href: `${MATH_INLINE_HREF_PREFIX}${encodeURIComponent(source)}`,
  type: "link",
});

interface InlineMathMatch {
  index: number;
  length: number;
  source: string;
}

const collectInlineMathMatches = (value: string): InlineMathMatch[] => {
  const matches: InlineMathMatch[] = [];
  inlineMathPattern.lastIndex = 0;

  for (const match of value.matchAll(inlineMathPattern)) {
    const source = match.groups?.source;
    if (source === undefined) {
      continue;
    }
    matches.push({
      index: match.index ?? 0,
      length: match[0].length,
      source,
    });
  }
  return matches;
};

const buildInlineMathNodes = (
  value: string,
  matches: InlineMathMatch[]
): InlineNode[] => {
  const result: InlineNode[] = [];
  let lastIndex = 0;

  for (const match of matches) {
    if (match.index > lastIndex) {
      result.push({ type: "text", value: value.slice(lastIndex, match.index) });
    }
    result.push(toInlineMathNode(match.source));
    lastIndex = match.index + match.length;
  }

  if (lastIndex < value.length) {
    result.push({ type: "text", value: value.slice(lastIndex) });
  }
  return result;
};

const splitTextNodeForInlineMath = (node: TextNode): InlineNode[] => {
  const { value } = node;
  if (!value.includes("$")) {
    return [node];
  }

  const matches = collectInlineMathMatches(value);
  if (matches.length === 0) {
    return [node];
  }

  return buildInlineMathNodes(value, matches);
};

const transformInlineMath = (nodes: InlineNode[]): InlineNode[] =>
  nodes.flatMap((node) =>
    node.type === "text" ? splitTextNodeForInlineMath(node) : node
  );

/**
 * Block (`$$...$$`) and inline (`$...$`) math. Inline math has no native
 * node type in @tanstack/markdown's closed InlineNode union, so it's encoded
 * as a `link` with a sentinel href scheme and intercepted at render time by
 * the `a` component override (see markdown-plugins.tsx).
 */
export const mathExtension = (): MarkdownExtension => ({
  name: "math",
  parseBlock: parseMathBlock,
  transformInline: transformInlineMath,
});
