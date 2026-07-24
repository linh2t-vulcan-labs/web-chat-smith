"use client";

import { PortableText } from "@portabletext/react";
import type {
  PortableTextBlock,
  PortableTextComponents,
} from "@portabletext/react";

interface Props {
  value: PortableTextBlock | PortableTextBlock[] | null | undefined;
}

const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => (
      <h1 className="text-Heading-h5 font-bold lg:text-Heading-h4">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-Heading-h5 font-semibold lg:text-Heading-h4">
        {children}
      </h2>
    ),
    normal: ({ children }) => <p className="mb-medium-2">{children}</p>,
  },

  list: {
    bullet: ({ children }) => (
      <ul className="ms-medium-2 list-disc">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="ms-medium-2 list-decimal">{children}</ol>
    ),
  },

  marks: {
    link: ({ value, children }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  },
};

function SanityBlockContent({ value }: Props) {
  if (!value) {
    return null;
  }

  return <PortableText value={value} components={components} />;
}

export default SanityBlockContent;
