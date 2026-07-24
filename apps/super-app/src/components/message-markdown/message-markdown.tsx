"use client";

import { marked } from "marked";
import React, { memo, useCallback, useMemo } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";

import { Badge } from "@/components/badge";
import { compositeStyles } from "@/utils/commons/styles";

import { MessageCodeBlock } from "../message-code-block";
import { proseTextStyles } from "./consts";
import type { TMessageMarkdownProps } from "./types";

import styles from "./styles.module.css";

function remarkBadgeLink() {
  return (tree: unknown) => {
    visit(
      tree as { type: string; children?: unknown[] },
      "text",
      (node: unknown, index: number | undefined, parent: unknown) => {
        const textNode = node as { value?: unknown };
        if (typeof textNode.value !== "string") {
          return;
        }

        const regex = /badgeLink\[(?<label>\d+)\]/gu;
        const parts: unknown[] = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(textNode.value)) !== null) {
          const [fullMatch, label] = match;
          const startIndex = match.index;

          // Push text before match
          if (startIndex > lastIndex) {
            parts.push({
              type: "text",
              value: textNode.value.slice(lastIndex, startIndex),
            });
          }

          // Create a custom node type instead of HTML element
          parts.push({
            children: [
              {
                type: "text",
                value: label,
              },
            ],
            data: {
              hName: "badgeLink", // This tells ReactMarkdown to use the badgeLink component
              hProperties: {
                label,
              },
            },
            type: "badgeLink",
          });

          lastIndex = startIndex + fullMatch.length;
        }

        // Push remaining text
        if (lastIndex < textNode.value.length) {
          parts.push({
            type: "text",
            value: textNode.value.slice(lastIndex),
          });
        }

        if (parts.length > 0 && typeof index === "number") {
          const parentNode = parent as { children?: unknown[] };
          if (parentNode?.children) {
            parentNode.children.splice(index, 1, ...parts);
          }
        }
      }
    );
  };
}

function parseMarkdownIntoBlocks(markdown: string): string[] {
  if (!markdown.trim()) {
    return [];
  }

  try {
    const tokens = marked.lexer(markdown);
    return tokens.map((token) => token.raw);
  } catch {
    return [markdown];
  }
}

interface MarkdownLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  node?: unknown;
}

function renderMarkdownLink(props: MarkdownLinkProps) {
  const { children, node: _node, ...anchorProps } = props;
  return (
    <a target="_blank" {...anchorProps}>
      {children}
    </a>
  );
}

interface MarkdownCodeProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  children: React.ReactNode;
  node?: unknown;
}

function renderMarkdownCode(props: MarkdownCodeProps) {
  const { className, children, ...rest } = props;
  const match = /language-(?<lang>\w+)/u.exec(className || "");

  // oxlint-disable-next-line react/no-react-children -- children is an arbitrary ReactNode from react-markdown (string, single element, or array); Children.toArray normalizes all shapes safely
  const childArray = React.Children.toArray(children);
  const firstChild = childArray[0] as React.ReactElement;
  const firstChildAsString = React.isValidElement(firstChild)
    ? (
        firstChild as React.ReactElement<{
          children?: React.ReactNode;
        }>
      ).props.children
    : firstChild;

  if (
    typeof firstChildAsString === "string" &&
    !firstChildAsString.includes("\n")
  ) {
    return (
      <code className="rounded-soft bg-surface-general-bright-overlay px-small-0.75 py-small-0.5 text-footnoteM-highlight">
        {children}
      </code>
    );
  }

  return (
    <MessageCodeBlock
      language={match?.groups?.lang || "markdown"}
      value={String(children).replace(/\n$/u, "")}
      {...rest}
    />
  );
}

interface BadgeLinkProps {
  node?: { properties?: { label?: unknown } };
}

function createBadgeLinkComponent(
  onBadgeClick?: TMessageMarkdownProps["onBadgeClick"]
) {
  return function renderBadgeLink({ node }: BadgeLinkProps) {
    const properties = (node as BadgeLinkProps["node"])?.properties;
    const label = String(properties?.label ?? "");

    return (
      <Badge
        type="dot"
        size="small"
        onClick={() => onBadgeClick?.(label)}
        className="hover:bg-neutral-150 dark:hover:text-text-general-inverse inline-block min-w-[18px] cursor-pointer"
      >
        {label}
      </Badge>
    );
  };
}

const MemoizedMarkdownBlock = memo(
  ({
    content,
    onBadgeClick,
  }: TMessageMarkdownProps & { blockIndex: number }) => {
    const components = useMemo(
      () =>
        ({
          a: renderMarkdownLink as unknown as Components["a"],
          badgeLink: createBadgeLinkComponent(
            onBadgeClick
          ) as unknown as Components["code"],
          code: renderMarkdownCode as unknown as Components["code"],
        }) as Components,
      [onBadgeClick]
    );

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBadgeLink]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) =>
    prevProps.content === nextProps.content &&
    prevProps.conversationId === nextProps.conversationId &&
    prevProps.messageId === nextProps.messageId &&
    prevProps.blockIndex === nextProps.blockIndex
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

const MemoizedMarkdown = memo(
  ({
    content,
    onBadgeClick,
    conversationId,
    messageId,
  }: TMessageMarkdownProps) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

    const memoizeBlockKey = useCallback(
      (index: string) =>
        [conversationId, messageId, "block", index]
          .filter((item) => !!item)
          .join("_"),
      [conversationId, messageId]
    );

    return (
      <div
        className={compositeStyles(
          "prose max-w-none wrap-break-word whitespace-normal",
          proseTextStyles,
          styles.tableMarkdown
        )}
      >
        {blocks.map((block, index) => (
          <MemoizedMarkdownBlock
            content={block}
            key={memoizeBlockKey(String(index))}
            onBadgeClick={onBadgeClick}
            blockIndex={index}
          />
        ))}
      </div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.content === nextProps.content &&
    prevProps.messageId === nextProps.messageId &&
    prevProps.conversationId === nextProps.conversationId
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";

export default MemoizedMarkdown;
