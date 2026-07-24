"use client";

import React, { useEffect, useRef, useState } from "react";

import { useMobileDetection } from "../../hooks/use-mobile-detection";

interface SectionBackgroundProps {
  backgroundImageUrl: string;
  backgroundImageMobileUrl?: string;
  fallback?: string;
  className?: string;
  threshold?: number;
  style?: React.CSSProperties;
}

/**
 * SectionBackground Component
 *
 * Reuse components to optimize loading heavy background images by:
 * 1. Only load when the component appears in the viewport (lazy loading)
 * 2. Use a lighter fallback image while waiting to load (if any)
 * 3. Smooth transition when the main image finishes loading
 * 4. Avoid loading heavy images immediately to improve PageSpeed
 *
 * @param backgroundImageUrl - URL of main background image (required)
 * @param backgroundImageMobileUrl - URL of mobile background image (optional)
 * @param fallback - URL of fallback image (optional)
 * @param className - CSS classes for container
 * @param threshold - Threshold to trigger lazy loading (0-1)
 * @param style - Custom inline styles (optional)
 */
const SectionBackground: React.FC<SectionBackgroundProps> = ({
  backgroundImageUrl,
  backgroundImageMobileUrl,
  fallback,
  className = "",
  threshold = 0.1,
  style,
}) => {
  const [isInView, setIsInView] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useMobileDetection();
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer to detect when component enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  // Load image when component enters viewport
  useEffect(() => {
    if (isInView && !imageLoaded && !isLoading) {
      // oxlint-disable-next-line react/react-compiler -- gates one-time image preload triggered by viewport entry; setState in effect is intentional
      setIsLoading(true);
      const img = new Image();
      const imageUrl =
        isMobile && backgroundImageMobileUrl
          ? backgroundImageMobileUrl
          : backgroundImageUrl;

      img.addEventListener("load", () => {
        setImageLoaded(true);
        setIsLoading(false);
      });
      img.addEventListener("error", () => {
        console.warn(`Failed to load background image: ${imageUrl}`);
        setIsLoading(false);
      });
      img.src = imageUrl;
    }
  }, [
    isInView,
    imageLoaded,
    isLoading,
    backgroundImageUrl,
    backgroundImageMobileUrl,
    isMobile,
  ]);

  // Create background image string
  const getBackgroundImage = () => {
    let currentImage;
    if (imageLoaded) {
      currentImage =
        isMobile && backgroundImageMobileUrl
          ? backgroundImageMobileUrl
          : backgroundImageUrl;
    } else {
      currentImage = fallback;
    }

    if (!currentImage) {
      return "none";
    }

    return `url("${currentImage}")`;
  };

  // Style default
  const defaultStyle: React.CSSProperties = {
    backgroundBlendMode: "multiply",
    backgroundImage: getBackgroundImage(),
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    inset: 0,
    position: "absolute",
    transition: "background-image 0.3s ease-in-out",
  };

  // Merge default style with custom style
  const finalStyle = style
    ? { ...defaultStyle, ...style, backgroundImage: getBackgroundImage() }
    : defaultStyle;

  return <div ref={containerRef} className={className} style={finalStyle} />;
};

export default SectionBackground;
