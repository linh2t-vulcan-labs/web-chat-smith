import { useEffect, useState } from "react";

import { imageCache } from "@/utils/image-cache";

export const useImageCache = (imagePath: string) => {
  const [cachedImage, setCachedImage] = useState<string>(imagePath);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      // Check if already cached
      const cached = imageCache.getCachedImage(imagePath);
      if (cached) {
        setCachedImage(cached);
        return;
      }

      // If not cached, try to preload
      setIsLoading(true);
      try {
        const dataUrl = await imageCache.preloadImage(imagePath);
        setCachedImage(dataUrl);
      } catch (error) {
        console.warn(`Failed to load image ${imagePath}:`, error);
        setCachedImage(imagePath); // Fallback to original path
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [imagePath]);

  return { cachedImage, isLoading };
};
