import { useEffect, useState } from "react";

/**
 * Custom hook to detect mobile devices
 *
 * Detects mobile devices based on:
 * 1. User agent string (Android, iOS, etc.)
 * 2. Screen width (<= 768px)
 *
 * @returns {boolean} isMobile - true if device is mobile
 */
export const useMobileDetection = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const { userAgent } = navigator;
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/iu.test(
          userAgent
        );
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    // Check on mount
    checkIsMobile();

    // Listen for resize events
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
};
