import type { RefObject } from "react";

const HEADER_HEIGHT = 150; // Prevent Fixed header Overlap

// Determine the scroll target (the question article)
const findScrollTarget = (
  element: HTMLElement | RefObject<HTMLElement | null> | null
) => {
  // Handle both direct DOM elements and React refs
  const currentElement =
    element && "current" in element ? element.current : element;
  if (!currentElement) {
    return null;
  }

  // Find the parent article of the answer with data-align="left"
  const answerArticle = currentElement.closest('article[data-align="left"]');
  if (!answerArticle) {
    return null;
  }

  // Find the previous article
  let previousSibling = answerArticle.previousElementSibling;

  while (previousSibling) {
    if (previousSibling.tagName === "ARTICLE") {
      const { align } = (previousSibling as HTMLElement).dataset;

      // If the previous article is also an answer (left) -> this is regenerated
      // Scroll to the current (newest) answer
      if (align === "left") {
        return answerArticle as HTMLElement;
      }

      // If the previous article is a question (right) -> scroll to the question
      if (align === "right") {
        return previousSibling as HTMLElement;
      }
    }
    previousSibling = previousSibling.previousElementSibling;
  }

  return null;
};

export const scrollToQuestion = (
  element: HTMLElement | RefObject<HTMLElement | null> | null
) => {
  // Handle both direct DOM elements and React refs
  const currentElement =
    element && "current" in element ? element.current : element;

  const questionArticle = findScrollTarget(element);

  if (questionArticle) {
    // Find container with scroll
    let scrollContainer: HTMLElement | null = currentElement;
    while (scrollContainer && scrollContainer.parentElement) {
      const overflow = window.getComputedStyle(scrollContainer).overflowY;
      if (overflow === "auto" || overflow === "scroll") {
        break;
      }
      scrollContainer = scrollContainer.parentElement;
    }

    // If no scrollable container is found, use window
    if (
      !scrollContainer ||
      scrollContainer === document.body ||
      scrollContainer === document.documentElement
    ) {
      scrollContainer = null;
    }

    if (scrollContainer) {
      // Save current scroll behavior
      const originalBehavior = scrollContainer.style.scrollBehavior;
      // Force instant scroll
      scrollContainer.style.scrollBehavior = "auto";

      // Scroll within container
      const containerRect = scrollContainer.getBoundingClientRect();
      const questionRect = questionArticle.getBoundingClientRect();
      const relativeTop = questionRect.top - containerRect.top;
      const targetScrollPosition = scrollContainer.scrollTop + relativeTop - 20;

      scrollContainer.scrollTop = targetScrollPosition;

      // Restore scroll behavior
      setTimeout(() => {
        scrollContainer.style.scrollBehavior = originalBehavior;
      }, 0);
    } else {
      // Save current scroll behavior
      const originalBehavior = document.documentElement.style.scrollBehavior;
      // Force instant scroll
      document.documentElement.style.scrollBehavior = "auto";

      // Scroll window (fallback)
      const questionRect = questionArticle.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const targetScrollPosition =
        questionRect.top + scrollTop - HEADER_HEIGHT - 20;

      window.scrollTo(0, targetScrollPosition);

      // Restore scroll behavior
      setTimeout(() => {
        document.documentElement.style.scrollBehavior = originalBehavior;
      }, 0);
    }
  }
};
