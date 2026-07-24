import type { ReactNode } from "react";

import type { SanityBlock, TextAlign } from "./types";

/**
 * Check if a React node is empty
 */
export function isEmptyNode(node: ReactNode): boolean {
  if (node === null || node === undefined || node === false) {
    return true;
  }
  if (typeof node === "string" && node.trim() === "") {
    return true;
  }
  if (Array.isArray(node)) {
    return node.every(isEmptyNode);
  }
  return false;
}

/**
 * Check if a block is a heading
 */
export function isHeading(block: SanityBlock): boolean {
  return Boolean(
    block.style && ["h1", "h2", "h3", "h4", "h5", "h6"].includes(block.style)
  );
}

/**
 * Get text alignment class
 */
export function getAlignmentClass(textAlign?: TextAlign): string {
  switch (textAlign) {
    case "center": {
      return "text-center";
    }
    case "right": {
      return "text-end";
    }
    default: {
      return "text-start";
    }
  }
}
