"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { useInViewport } from "@/features/landing/home/hooks/use-in-viewport";
import { useMobileDetection } from "@/features/landing/home/hooks/use-mobile-detection";
import { debounce } from "@/libs/lodash-es";
import { compositeStyles } from "@/utils/commons/styles";

import styles from "./background-styles.module.scss";

interface FeatureBackgroundProps {
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  onScreenWidthChange?: (screenWidth: number) => void;
}

const FEATURE_BG_URL = `/images/landing-page-v2/background/feature-bg.gif`;
const FEATURE_BG_MOBILE_URL = `/images/landing-page-v2/background/feature-background-mobile.gif`;

const FeatureBackground: React.FC<FeatureBackgroundProps> = ({
  buttonRef,
  onScreenWidthChange,
}) => {
  const [backgroundPosition, setBackgroundPosition] = useState("center -272px");
  const [isLoaded, setIsLoaded] = useState(false);
  const [backgroundImageLoaded, setBackgroundImageLoaded] = useState(false); // Track if background image is actually loaded
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Use useInViewport hook to detect when component is in viewport
  const isInViewport = useInViewport(viewportRef, {
    threshold: 0.1,
    triggerOnce: true,
  });

  // Use mobile detection hook
  const isMobile = useMobileDetection();

  // Calculate background position based on button position
  const calculateBackgroundPosition = useCallback(() => {
    if (!containerRef.current || !buttonRef.current) {
      return;
    }

    const container = containerRef.current;
    const button = buttonRef.current;

    // Get the size and position of the container and button
    const containerRect = container.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();

    // Calculate the relative position of the button within the container
    const buttonCenterY =
      buttonRect.top + buttonRect.height / 2 - containerRect.top;

    // Standard parameters on screen 1440px:
    // - Button center away from top container: 256px
    // - Background position to center the button: -272px
    // Standard parameters on screen 1920px:
    // - Background position to center the button: -284px
    // Standard parameters at tablet/mobile:
    // - Button center away from top container: 260px
    // - Background position to center the button: -102px (adjective -272 + 170)
    // Standard parameters at iPad:
    // - Background position to center the button: -412px
    const baseButtonCenterY = 256; // px
    const baseBackgroundPosition = -272; // px
    const targetBackgroundPosition1920 = -284; // px
    const targetBackgroundPositionMobile = -102; // px (-272 + 170)
    const targetBackgroundPositionIpad = -412; // px

    // General formula for all screen ratios
    // Use interpolation between two benchmarks
    const ratio = buttonCenterY / baseButtonCenterY;

    // Calculate basic background position
    let backgroundPositionY = baseBackgroundPosition * ratio;

    // Adjust based on actual screen width
    const currentScreenWidth = window.innerWidth;

    if (currentScreenWidth >= 1920) {
      // For screen >= 1920px, use fixed value -284px
      backgroundPositionY = targetBackgroundPosition1920;
    } else if (currentScreenWidth < 768) {
      // For mobile, use a fixed value of -102px
      backgroundPositionY = targetBackgroundPositionMobile;
    } else if (currentScreenWidth >= 768 && currentScreenWidth <= 1024) {
      // For iPad (768px - 1024px), use a fixed value of -412px
      backgroundPositionY = targetBackgroundPositionIpad;
    } else if (ratio > 1) {
      // For screens larger than 1440px but < 1920px, use interpolation
      const screenProgress = (currentScreenWidth - 1440) / (1920 - 1440);
      const positionDifference =
        targetBackgroundPosition1920 - baseBackgroundPosition;
      backgroundPositionY =
        baseBackgroundPosition + positionDifference * screenProgress;
    } else if (ratio < 1) {
      // For 1025px - 1439px screens, use interpolation between iPad and desktop
      const screenProgress = (currentScreenWidth - 1025) / (1440 - 1025);
      const positionDifference =
        baseBackgroundPosition - targetBackgroundPositionIpad; // 140px
      backgroundPositionY =
        targetBackgroundPositionIpad + positionDifference * screenProgress;
    }

    setBackgroundPosition(`center ${backgroundPositionY}px`);
  }, [buttonRef]);

  // Only load background when component is in viewport
  useEffect(() => {
    if (isInViewport && !isLoaded) {
      // oxlint-disable-next-line react/react-compiler -- gates one-time background image preload; setState in effect is intentional viewport-triggered load
      setIsLoaded(true);

      // Preload the background image to ensure it loads before showing overlay
      const bgUrl = isMobile ? FEATURE_BG_MOBILE_URL : FEATURE_BG_URL;
      const img = new Image();
      img.addEventListener("load", () => {
        setBackgroundImageLoaded(true);
      });
      img.addEventListener("error", () => {
        setBackgroundImageLoaded(true); // Even on error, mark as loaded to prevent infinite loading
      });
      img.src = bgUrl;
    }
  }, [isInViewport, isLoaded, isMobile]);

  useEffect(() => {
    // Only calculated when the component is loaded
    if (!isLoaded) {
      return;
    }

    // Calculation function
    const calculation = () => {
      const currentScreenWidth = window.innerWidth;
      onScreenWidthChange?.(currentScreenWidth);
      calculateBackgroundPosition();
    };

    // Debounce function with delay 100ms
    const debouncedCalculation = debounce(calculation, 100);

    // Initial calculation
    calculation();

    // Listen for resize event
    const handleResize = () => {
      debouncedCalculation();
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      debouncedCalculation.cancel();
      window.removeEventListener("resize", handleResize);
    };
  }, [calculateBackgroundPosition, onScreenWidthChange, isLoaded]);

  // Combine refs to be able to observe viewport and access container
  const combinedRef = useCallback((node: HTMLDivElement | null) => {
    // Use type assertion to bypass readonly restriction
    (containerRef as React.MutableRefObject<HTMLDivElement | null>).current =
      node;
    (viewportRef as React.MutableRefObject<HTMLDivElement | null>).current =
      node;
  }, []);

  const bgUrl = isMobile ? `${FEATURE_BG_MOBILE_URL}` : `${FEATURE_BG_URL}`;

  const backgroundImage =
    isLoaded && backgroundImageLoaded ? `url("${bgUrl}")` : undefined;

  return (
    <div
      ref={combinedRef}
      className={compositeStyles(
        "feature-bg-style absolute inset-0 mx-auto w-full max-w-[1920px] bg-cover py-large-5 md:py-large-10",
        isLoaded && backgroundImageLoaded && styles["background-animate"]
      )}
      style={{
        backgroundBlendMode:
          isLoaded && backgroundImageLoaded ? "darken" : undefined,
        backgroundImage,
        backgroundPosition: isLoaded ? backgroundPosition : "center -272px",
      }}
    >
      <div
        className={compositeStyles(
          isLoaded && backgroundImageLoaded && styles["background-mask"]
        )}
      />
      <div
        className={compositeStyles(
          isLoaded && backgroundImageLoaded && styles["background-overlay"]
        )}
      />
    </div>
  );
};

export default FeatureBackground;
