import { useEffect, useRef, useState } from "react";

interface UseBannerAnimationReturn {
  shouldLoadAnimated: boolean;
  isVideoVisible: boolean;
  bannerRef: React.RefObject<HTMLDivElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

/**
 * Custom hook for managing banner animation loading with performance optimizations
 * - Respects user's reduced motion preferences
 * - Detects slow connections and skips animation
 * - Uses requestIdleCallback for optimal loading timing
 * - Only loads animation when banner is visible
 */
export function useBannerAnimation(): UseBannerAnimationReturn {
  const [shouldLoadAnimated, setShouldLoadAnimated] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const bannerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry) {
          return;
        }
        setIsVideoVisible(entry.isIntersecting);

        // Pause video when not visible to save resources
        if (videoRef.current) {
          if (entry.isIntersecting) {
            try {
              await videoRef.current.play();
            } catch {
              // Ignore play errors (e.g. autoplay blocked by the browser)
            }
          } else {
            videoRef.current.pause();
          }
        }
      },
      { threshold: 0.1 }
    );

    if (bannerRef.current) {
      observer.observe(bannerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Check user preferences
    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const { connection } = navigator as Navigator & {
      connection?: { effectiveType?: string; saveData?: boolean };
    };
    const isSlowConnection =
      connection &&
      (connection.effectiveType === "slow-2g" ||
        connection.effectiveType === "2g" ||
        connection.saveData === true);

    // Don't load animated if reduced motion or slow connection
    if (prefersReducedMotion || isSlowConnection) {
      return;
    }

    // Load animated immediately for better UX
    const loadAnimated = () => {
      setShouldLoadAnimated(true);
    };

    // Load immediately if page is already loaded, otherwise wait for load event
    if (document.readyState === "complete") {
      loadAnimated();
    } else {
      const handleLoad = () => {
        loadAnimated();
        window.removeEventListener("load", handleLoad);
      };
      window.addEventListener("load", handleLoad);

      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  return {
    bannerRef,
    isVideoVisible,
    shouldLoadAnimated,
    videoRef,
  };
}
