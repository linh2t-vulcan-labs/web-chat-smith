"use client";

import { calloutsExtension } from "@tanstack/markdown/extensions/callouts";
import { streamingMarkdownExtension } from "@tanstack/markdown/extensions/streaming";
import { Markdown } from "@tanstack/markdown/react";
import { renderToString } from "katex";
import type { ComponentPropsWithoutRef } from "react";
import { memo, useEffect, useId, useState } from "react";
import type { BundledLanguage } from "shiki";

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockHeader,
  CodeBlockTitle,
} from "#components/ai-elements/code-block";
import {
  CODE_BLOCK_COMPONENT_TAG,
  MATH_BLOCK_COMPONENT_TAG,
  MATH_INLINE_HREF_PREFIX,
  MERMAID_COMPONENT_TAG,
  codeBlockExtension,
  mathExtension,
  mermaidExtension,
} from "#lib/markdown/extensions";
import { splitMarkdownIntoBlocks } from "#lib/markdown/split-blocks";

const nonAlphanumericPattern = /[^a-zA-Z0-9]/gu;

const useIsDarkMode = (): boolean => {
  const [isDark, setIsDark] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() =>
      setIsDark(root.classList.contains("dark"))
    );
    observer.observe(root, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
};

interface MermaidDiagramProps {
  source: string;
}

export const MermaidDiagram = ({ source }: MermaidDiagramProps) => {
  const rawId = useId().replaceAll(nonAlphanumericPattern, "");
  const isDarkMode = useIsDarkMode();
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    if (!source.trim()) {
      return;
    }

    let cancelled = false;

    const renderDiagram = async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
          startOnLoad: false,
          theme: isDarkMode ? "dark" : "default",
        });
        const { svg: renderedSvg } = await mermaid.render(
          `tm-mermaid-${rawId}`,
          source
        );
        if (!cancelled) {
          setSvg(renderedSvg);
        }
      } catch {
        // Likely an incomplete diagram while streaming; keep the last
        // successful render (or nothing) until the source completes.
      }
    };

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [source, isDarkMode, rawId]);

  if (!svg) {
    return <pre className="tm-mermaid-pending">{source}</pre>;
  }

  return (
    <div
      className="tm-mermaid"
      // oxlint-disable-next-line react/no-danger -- SVG markup produced by mermaid's own sanitizing renderer, not raw user input
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

interface MathBlockProps {
  source: string;
}

export const MathBlock = ({ source }: MathBlockProps) => {
  if (!source.trim()) {
    return null;
  }

  const html = renderToString(source, {
    displayMode: true,
    throwOnError: false,
  });

  return (
    <div
      className="tm-math-block"
      // oxlint-disable-next-line react/no-danger -- KaTeX-escaped markup, not raw user input
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

interface MarkdownCodeBlockProps {
  code: string;
  filename: string;
  lang: string;
  title: string;
}

export const MarkdownCodeBlock = ({
  code,
  filename,
  lang,
  title,
}: MarkdownCodeBlockProps) => {
  const label = filename || title || lang;

  return (
    <CodeBlock
      className="not-prose my-4"
      code={code}
      language={lang as BundledLanguage}
      showLineNumbers
    >
      <CodeBlockHeader>
        <CodeBlockTitle>
          {filename ? <CodeBlockFilename>{filename}</CodeBlockFilename> : label}
        </CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton />
        </CodeBlockActions>
      </CodeBlockHeader>
    </CodeBlock>
  );
};

type MarkdownAnchorProps = ComponentPropsWithoutRef<"a">;

export const MarkdownAnchor = ({
  href = "",
  children,
  ...props
}: MarkdownAnchorProps) => {
  if (href.startsWith(MATH_INLINE_HREF_PREFIX)) {
    const source = decodeURIComponent(
      href.slice(MATH_INLINE_HREF_PREFIX.length)
    );
    const html = renderToString(source, {
      displayMode: false,
      throwOnError: false,
    });

    return (
      <span
        className="tm-math-inline"
        // oxlint-disable-next-line react/no-danger -- KaTeX-escaped markup, not raw user input
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
};

export const markdownExtensions = [
  calloutsExtension(),
  mermaidExtension(),
  codeBlockExtension(),
  mathExtension(),
  streamingMarkdownExtension(),
];

export const markdownComponents = {
  a: MarkdownAnchor,
  [CODE_BLOCK_COMPONENT_TAG]: MarkdownCodeBlock,
  [MATH_BLOCK_COMPONENT_TAG]: MathBlock,
  [MERMAID_COMPONENT_TAG]: MermaidDiagram,
};

interface MarkdownBlockProps {
  content: string;
}

// Memoized per block so a growing message only re-parses and re-renders its
// still-streaming tail block; every earlier (now-static) block is skipped by
// this equality check instead of the whole message re-parsing every token.
const MarkdownBlock = memo(
  ({ content }: MarkdownBlockProps) => (
    <Markdown
      components={markdownComponents}
      extensions={markdownExtensions}
      frontmatter={false}
      headingIds={false}
    >
      {content}
    </Markdown>
  ),
  (prevProps, nextProps) => prevProps.content === nextProps.content
);
MarkdownBlock.displayName = "MarkdownBlock";

export interface MarkdownBlocksProps {
  content: string;
}

export const MarkdownBlocks = ({ content }: MarkdownBlocksProps) => {
  const blocks = splitMarkdownIntoBlocks(content);

  return (
    <>
      {blocks.map((block, index) => (
        // Index is the correct key here: blocks only ever mutate at the
        // tail while streaming, so position is a stable identity for every
        // earlier, now-frozen block — keying by content would defeat the
        // memoization above by remounting on every keystroke.
        // oxlint-disable-next-line react-doctor/no-array-index-as-key
        <MarkdownBlock content={block} key={index} />
      ))}
    </>
  );
};
