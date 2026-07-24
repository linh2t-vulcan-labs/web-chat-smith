import type { PortableTextBlock } from "@portabletext/react";

// Text alignment types
export type TextAlign = "left" | "right" | "center";

// Sanity link value type
export interface SanityLinkValue {
  _type: "link";
  href: string;
  blank?: boolean;
}

// Block style types
export type BlockStyle =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "normal"
  | "blockquote";

// Extended block type with alignment support
export interface SanityBlock extends Omit<
  PortableTextBlock,
  "_key" | "children"
> {
  _key: string;
  _type: string;
  style?: BlockStyle;
  textAlign?: TextAlign;
  children: {
    _type: string;
    text: string;
    marks?: string[];
    _key: string;
    [key: string]: unknown;
  }[];
  markDefs?: {
    _key: string;
    _type: string;
    href?: string;
    [key: string]: unknown;
  }[];
}

// Content section types
export interface ContentSection {
  id: string;
  heading: SanityBlock | null;
  content: SanityBlock[];
}

// Legacy types for backward compatibility
export interface TBlockElement {
  _key: string;
  _type: string;
  style: string;
  children: TChildren[];
  markDefs: TMarkDef[];
  caption?: string;
  textAlign?: TextAlign;
}

export interface TMarkDef {
  _key: string;
  _type: string;
  href: string;
}

export interface TChildren {
  _key: string;
  _type: string;
  marks: string[];
  text: string;
}
