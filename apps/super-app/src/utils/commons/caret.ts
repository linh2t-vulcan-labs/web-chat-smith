function moveCaretToEnd(el: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

function getTextBeforeCaret(container: HTMLElement): string {
  const sel = window.getSelection();
  if (!sel || !sel.anchorNode || sel.rangeCount === 0) {
    return "";
  }

  const range = sel.getRangeAt(0);
  const preRange = range.cloneRange();
  preRange.selectNodeContents(container);
  preRange.setEnd(range.endContainer, range.endOffset);

  return preRange.toString();
}

function getCaretCoordinates(): DOMRect | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) {
    return null;
  }

  const range = sel.getRangeAt(0).cloneRange();
  range.collapse(false);

  const span = document.createElement("span");
  span.textContent = "\u200B"; // zero-width space
  range.insertNode(span);

  const rect = span.getBoundingClientRect();
  span.remove();

  return rect;
}

function saveCaretSelection(): Range | null {
  const sel = window.getSelection();
  return sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;
}

function restoreCaretSelection(range: Range | null) {
  if (!range) {
    return;
  }
  const sel = window.getSelection();
  if (!sel) {
    return;
  }
  sel.removeAllRanges();
  sel.addRange(range);
}

function saveCaretOffset(container: HTMLElement): number {
  const sel = window.getSelection();
  if (!sel || !sel.anchorNode) {
    return 0;
  }

  const range = sel.getRangeAt(0);
  const preRange = range.cloneRange();
  preRange.selectNodeContents(container);
  preRange.setEnd(range.endContainer, range.endOffset);
  return preRange.toString().length;
}

function setCaretAtOffset(container: HTMLElement, offset: number) {
  let currentOffset = 0;
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null
  );

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const length = node.textContent?.length ?? 0;

    if (currentOffset + length >= offset) {
      const range = document.createRange();
      const position = offset - currentOffset;
      range.setStart(node, position);
      range.collapse(true);

      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
      return;
    }

    currentOffset += length;
  }

  // If offset exceeds content, move caret to end
  moveCaretToEnd(container);
}

export {
  getTextBeforeCaret,
  getCaretCoordinates,
  saveCaretSelection,
  restoreCaretSelection,
  moveCaretToEnd,
  saveCaretOffset,
  setCaretAtOffset,
};
