// hooks/useCopySanitizedHtml.ts
import { useEffect } from "react";

/**
 * Recursively remove all attributes (e.g., style, class) from an element
 * except for 'href' if you want to preserve links.
 */
function sanitizeElement(el: HTMLElement) {
  // Loop through each attribute on the element
  for (const attr of el.attributes) {
    // Remove every attribute except 'href'
    if (attr.name !== "href") {
      el.removeAttribute(attr.name);
    }
  }
  // Recurse into child elements
  for (const child of el.children) {
    sanitizeElement(child as HTMLElement);
  }
}

/**
 * useCopySanitizedHtml
 * --------------------
 * Listens for the global copy event and overrides clipboard data:
 * - Strips out all inline styles and classes
 * - Preserves basic HTML structure (e.g., headings, <strong>, <em>)
 * - Also sets plain text fallback
 */
export function useCopySanitizedHtml() {
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        return; // Do nothing if there is no selection
      }

      // Clone the selected HTML fragment
      const range = selection.getRangeAt(0);
      const fragment = range.cloneContents();

      // Create a temporary container to sanitize the fragment
      const container = document.createElement("div");
      container.append(fragment);
      sanitizeElement(container);

      // Prepare sanitized HTML and plain text
      const cleanHtml = container.innerHTML;
      const plainText = selection.toString();

      // Prevent default copy behavior (which would include styles)
      e.preventDefault();
      // Write sanitized HTML to the clipboard
      e.clipboardData?.setData("text/html", cleanHtml);
      // Write plain text to the clipboard as a fallback
      e.clipboardData?.setData("text/plain", plainText);
    };

    // Attach the copy handler globally
    document.addEventListener("copy", handleCopy);
    return () => {
      // Clean up on unmount
      document.removeEventListener("copy", handleCopy);
    };
  }, []);
}
