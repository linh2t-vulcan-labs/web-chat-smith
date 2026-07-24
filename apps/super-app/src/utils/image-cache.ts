// Global cache for images to persist across component mounts/unmounts
class ImageCache {
  readonly cache = new Map<string, string>();

  async preloadImage(imagePath: string): Promise<string> {
    // Check if already cached
    const cached = this.cache.get(imagePath);
    if (cached !== undefined) {
      return cached;
    }

    try {
      // Fetch the image and convert to base64
      const response = await fetch(imagePath);
      if (response.ok) {
        const blob = await response.blob();
        const dataUrl = await ImageCache.blobToDataUrl(blob);

        // Cache the data URL
        this.cache.set(imagePath, dataUrl);
        return dataUrl;
      }
      // Fallback to original path if fetch fails
      this.cache.set(imagePath, imagePath);
      return imagePath;
    } catch (error) {
      console.warn(`Failed to preload ${imagePath}:`, error);
      // Fallback to original path
      this.cache.set(imagePath, imagePath);
      return imagePath;
    }
  }

  getCachedImage(imagePath: string): string | null {
    return this.cache.get(imagePath) || null;
  }

  isCached(imagePath: string): boolean {
    return this.cache.has(imagePath);
  }

  private static blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result as string));
      reader.addEventListener("error", reject);
      reader.readAsDataURL(blob);
    });
  }

  // Clear cache if needed (for memory management)
  clearCache(): void {
    this.cache.clear();
  }
}

// Global instance
export const imageCache = new ImageCache();
