import { useEffect, useState } from "react";

interface UseInViewportOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook to detect when element appears in viewport
 *
 * @param ref - Ref of the element to observe
 * @param options - Configuration for Intersection Observer
 * @param options.threshold - Trigger threshold (0-1), default: 0.1
 * @param options.rootMargin - Margin for root element, default: "0px"
 * @param options.triggerOnce - Trigger only once, default: false
 * @returns isInView - whether the element is in the viewport or not
 */
export const useInViewport = (
  ref: React.RefObject<HTMLElement | null>,
  options: UseInViewportOptions = {}
) => {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = false } = options;

  const [isInView, setIsInView] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    // If triggered once and triggerOnce = true, no need to observe anymore
    if (triggerOnce && hasTriggered) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry?.isIntersecting ?? false;
        setIsInView(inView);

        if (inView && triggerOnce) {
          setHasTriggered(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, threshold, rootMargin, triggerOnce, hasTriggered]);

  return isInView;
};
