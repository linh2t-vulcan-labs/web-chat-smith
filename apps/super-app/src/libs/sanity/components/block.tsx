import type { PortableTextComponentProps } from "@portabletext/react";

import { compositeStyles } from "@/utils/commons/styles";

import type { SanityBlock } from "./types";
import { getAlignmentClass, isEmptyNode } from "./utils";

/**
 * Block component for rendering different block types with alignment support
 */
export function BlockComponent(props: PortableTextComponentProps<SanityBlock>) {
  const { value, children } = props;
  const { style, textAlign } = value;
  const alignmentClass = getAlignmentClass(textAlign);

  switch (style) {
    case "h1": {
      return (
        <h1
          className={compositeStyles(
            "pb-medium-3 text-[2.75em] font-bold",
            alignmentClass
          )}
          id={value._key}
        >
          {children}
        </h1>
      );
    }

    case "h2": {
      return (
        <h2
          className={compositeStyles(
            "py-medium-3 text-[2em] font-bold",
            alignmentClass
          )}
          id={value._key}
        >
          {children}
        </h2>
      );
    }

    case "h3": {
      return (
        <h3
          className={compositeStyles(
            "py-medium-3 text-[1.5em] font-bold",
            alignmentClass
          )}
          id={value._key}
        >
          {children}
        </h3>
      );
    }

    case "h4": {
      return (
        <h4
          className={compositeStyles(
            "py-medium-3 text-[1.25em] font-bold",
            alignmentClass
          )}
          id={value._key}
        >
          {children}
        </h4>
      );
    }

    case "h5": {
      return (
        <h5
          className={compositeStyles(
            "py-medium-3 text-[1.125em] font-bold",
            alignmentClass
          )}
          id={value._key}
        >
          {children}
        </h5>
      );
    }

    case "h6": {
      return (
        <h6
          className={compositeStyles(
            "py-medium-2 text-[1em] font-bold",
            alignmentClass
          )}
          id={value._key}
        >
          {children}
        </h6>
      );
    }

    case "blockquote": {
      return (
        <blockquote
          className={compositeStyles(
            "mb-medium-2 py-small-1 border-s-4 border-gray-300 ps-4 italic",
            alignmentClass
          )}
        >
          {children}
        </blockquote>
      );
    }

    case "normal": {
      if (isEmptyNode(children)) {
        return null;
      }
      return (
        <p
          className={compositeStyles(
            "text-content-bodyM-neutral mb-medium-2 last:mb-small-0",
            alignmentClass
          )}
        >
          {children}
        </p>
      );
    }

    default: {
      return null;
    }
  }
}
