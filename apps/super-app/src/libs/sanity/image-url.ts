import imageUrlBuilder from "@sanity/image-url";
import type { ImageUrlBuilder, SanityImageSource } from "@sanity/image-url";

import { getSanityServerClient } from "./sanity-server-client";
import type { TSanityImage } from "./types";

/**
 * Image optimization options for Sanity images
 */
export interface SanityImageOptions {
  /** Width in pixels */
  width?: number;
  /** Height in pixels */
  height?: number;
  /** Image quality (0-100), default: 75 */
  quality?: number;
  /** Format: 'auto', 'webp', 'jpg', 'png', etc. */
  format?: "auto" | "webp" | "jpg" | "jpeg" | "png";
  /** Fit mode: 'clip', 'crop', 'fill', 'fillmax', 'max', 'scale', 'min' */
  fit?: "clip" | "crop" | "fill" | "fillmax" | "max" | "scale" | "min";
  /** Crop mode: 'top', 'bottom', 'left', 'right', 'center', 'focalpoint', 'entropy' */
  crop?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "center"
    | "focalpoint"
    | "entropy";
  /** Focal point X coordinate (0-1) */
  focalPointX?: number;
  /** Focal point Y coordinate (0-1) */
  focalPointY?: number;
  /** Blur amount (0-100) */
  blur?: number;
  /** Sharpen amount (0-100) */
  sharpen?: number;
  /** Flip horizontally */
  flipHorizontal?: boolean;
  /** Flip vertically */
  flipVertical?: boolean;
  /** Saturation adjustment (-100 to 100) */
  saturation?: number;
}

/**
 * Get the image URL builder instance
 * This function is memoized to reuse the same builder instance
 */
let imageBuilder: ReturnType<typeof imageUrlBuilder> | null = null;

async function getImageBuilder() {
  if (imageBuilder) {
    return imageBuilder;
  }

  const client = await getSanityServerClient();
  imageBuilder = imageUrlBuilder(client);
  return imageBuilder;
}

/**
 * Applies all Sanity image optimization options to a builder instance,
 * mirroring the exact order previously inlined in `buildSanityImageUrl`.
 */
function applySanityImageOptions(
  initialImageBuilder: ImageUrlBuilder,
  options: SanityImageOptions
): ImageUrlBuilder {
  let imageBuilder = initialImageBuilder;

  // Apply dimensions
  if (options.width) {
    imageBuilder = imageBuilder.width(options.width);
  }
  if (options.height) {
    imageBuilder = imageBuilder.height(options.height);
  }

  // Apply quality
  if (options.quality !== undefined) {
    imageBuilder = imageBuilder.quality(options.quality);
  }

  // Apply format
  if (options.format) {
    // Type assertion needed as format() accepts specific types
    imageBuilder =
      options.format === "auto"
        ? imageBuilder.auto("format")
        : imageBuilder.format(options.format as "jpg" | "png" | "webp");
  } else {
    // Default to auto format for better performance
    imageBuilder = imageBuilder.auto("format");
  }

  // Apply fit mode
  if (options.fit) {
    imageBuilder = imageBuilder.fit(options.fit);
  }

  // Apply crop
  if (options.crop) {
    imageBuilder = imageBuilder.crop(options.crop);
  }

  // Apply focal point
  if (options.focalPointX !== undefined && options.focalPointY !== undefined) {
    imageBuilder = imageBuilder.focalPoint(
      options.focalPointX,
      options.focalPointY
    );
  }

  // Apply blur
  if (options.blur !== undefined) {
    imageBuilder = imageBuilder.blur(options.blur);
  }

  // Apply sharpen
  if (options.sharpen !== undefined) {
    imageBuilder = imageBuilder.sharpen(options.sharpen);
  }

  // Apply flip
  if (options.flipHorizontal) {
    imageBuilder = imageBuilder.flipHorizontal();
  }
  if (options.flipVertical) {
    imageBuilder = imageBuilder.flipVertical();
  }

  // Apply saturation
  if (options.saturation !== undefined) {
    imageBuilder = imageBuilder.saturation(options.saturation);
  }

  return imageBuilder;
}

/**
 * Build an optimized image URL from a Sanity image source
 *
 * @param source - Sanity image source (can be image object, asset reference, or URL string)
 * @param options - Image optimization options
 * @returns Optimized image URL string
 *
 * @example
 * ```ts
 * const optimizedUrl = await buildSanityImageUrl(blog.image, {
 *   width: 800,
 *   height: 600,
 *   quality: 85,
 *   format: 'auto'
 * });
 * ```
 */
export async function buildSanityImageUrl(
  source: SanityImageSource | null | undefined,
  options: SanityImageOptions = {}
): Promise<string | null> {
  if (!source) {
    return null;
  }

  try {
    const builder = await getImageBuilder();
    const imageBuilder = applySanityImageOptions(
      builder.image(source),
      options
    );

    return imageBuilder.url();
  } catch (error) {
    console.error("[Sanity Image URL Error]", error);
    // Fallback to original URL if it's an object with url property
    if (typeof source === "object" && source !== null && "url" in source) {
      return (source as { url: string }).url;
    }
    return null;
  }
}

/**
 * Preset configurations for common image use cases
 */
export const SanityImagePresets = {
  /** AI tool feature card icon: 1:1, 48px display — upload 64×64 or 128×128 */
  aiToolFeatureIcon: {
    crop: "center" as const,
    fit: "crop" as const,
    format: "auto" as const,
    height: 128,
    quality: 80,
    width: 128,
  },
  /** AI tool hero list item: 3:2, ~2× desktop column (570×380), center crop */
  aiToolHeroItem: {
    crop: "center" as const,
    fit: "crop" as const,
    format: "auto" as const,
    height: 760,
    quality: 85,
    width: 1140,
  },
  /**
   * More resource carousel card: square display is CSS `aspect-ratio` + `object-fit: cover`.
   * CDN bounds 512×512 with `fit: max` — never upscale sources smaller than 512 (e.g. 300×300).
   * Non-square sources (e.g. 521×512) are letterboxed within 512; CSS crops to 1:1.
   */
  aiToolMoreResource: {
    fit: "max" as const,
    format: "auto" as const,
    height: 512,
    quality: 100,
    width: 512,
  },
  /** AI tool resource blog strip: one URL, landscape bounds; `fit: max` keeps full image for CSS `contain` */
  aiToolResourceBlogCard: {
    fit: "max" as const,
    format: "auto" as const,
    height: 206,
    quality: 80,
    width: 388,
  },
  /** Avatar: 100x100, quality 80, circular crop */
  avatar: {
    crop: "center" as const,
    fit: "crop" as const,
    format: "auto" as const,
    height: 100,
    quality: 80,
    width: 100,
  },
  /** Blog card: 568x321 (aspect ratio from blog-card-v2.tsx), quality 80 */
  blogCard: {
    fit: "crop" as const,
    format: "auto" as const,
    height: 321,
    quality: 80,
    width: 568,
  },
  /** Blog card horizontal: 318x180, quality 80 */
  blogCardHorizontal: {
    fit: "crop" as const,
    format: "auto" as const,
    height: 180,
    quality: 80,
    width: 318,
  },
  /** Hero: 1920x1080, quality 90 */
  hero: {
    fit: "max" as const,
    format: "auto" as const,
    height: 1080,
    quality: 90,
    width: 1920,
  },
  /** Large: 1200x900, quality 85 */
  large: {
    fit: "max" as const,
    format: "auto" as const,
    height: 900,
    quality: 85,
    width: 1200,
  },
  /** Medium: 800x600, quality 80 */
  medium: {
    fit: "max" as const,
    format: "auto" as const,
    height: 600,
    quality: 80,
    width: 800,
  },
  /** Small: 400x300, quality 75 */
  small: {
    fit: "max" as const,
    format: "auto" as const,
    height: 300,
    quality: 75,
    width: 400,
  },
  /** Thumbnail: 150x150, quality 70 */
  thumbnail: {
    fit: "crop" as const,
    format: "auto" as const,
    height: 150,
    quality: 70,
    width: 150,
  },
} as const;

/**
 * Build an optimized image URL using a preset configuration
 *
 * @param source - Sanity image source
 * @param preset - Preset name from SanityImagePresets
 * @param overrides - Optional overrides to the preset
 * @returns Optimized image URL string
 *
 * @example
 * ```ts
 * const url = await buildSanityImageUrlWithPreset(blog.image, 'blogCard');
 * ```
 */
export function buildSanityImageUrlWithPreset(
  source: SanityImageSource | null | undefined,
  preset: keyof typeof SanityImagePresets,
  overrides?: Partial<SanityImageOptions>
): Promise<string | null> {
  const presetOptions = SanityImagePresets[preset];
  return buildSanityImageUrl(source, { ...presetOptions, ...overrides });
}

/**
 * Build responsive image URLs for different screen sizes
 * Returns an object with URLs for different breakpoints
 *
 * @param source - Sanity image source
 * @param breakpoints - Array of width breakpoints
 * @param options - Base image options
 * @returns Object with breakpoint keys and optimized URLs
 *
 * @example
 * ```ts
 * const responsive = await buildResponsiveSanityImageUrls(blog.image, [400, 800, 1200]);
 * // Returns: { '400': '...', '800': '...', '1200': '...' }
 * ```
 */
async function buildResponsiveSanityImageUrls(
  source: SanityImageSource | null | undefined,
  breakpoints: number[],
  options: Omit<SanityImageOptions, "width"> = {}
): Promise<Record<string, string | null>> {
  if (!source) {
    return {};
  }

  const entries = await Promise.all(
    breakpoints.map(
      async (width) =>
        [
          width.toString(),
          await buildSanityImageUrl(source, { ...options, width }),
        ] as const
    )
  );

  return Object.fromEntries(entries);
}

/**
 * Generate a srcSet string for responsive images
 *
 * @param source - Sanity image source
 * @param breakpoints - Array of width breakpoints
 * @param options - Base image options
 * @returns srcSet string (e.g., "url1 400w, url2 800w, url3 1200w")
 *
 * @example
 * ```ts
 * const srcSet = await buildSanityImageSrcSet(blog.image, [400, 800, 1200]);
 * // Returns: "url1 400w, url2 800w, url3 1200w"
 * ```
 */
async function buildSanityImageSrcSet(
  source: SanityImageSource | null | undefined,
  breakpoints: number[],
  options: Omit<SanityImageOptions, "width"> = {}
): Promise<string> {
  if (!source) {
    return "";
  }

  const urls = await buildResponsiveSanityImageUrls(
    source,
    breakpoints,
    options
  );
  return Object.entries(urls)
    .filter(([, url]) => url !== null)
    .map(([width, url]) => `${url} ${width}w`)
    .join(", ");
}

/**
 * Type-safe helper for TSanityImage from the codebase
 * This function works specifically with the TSanityImage type structure
 */

/**
 * Build an optimized image URL from a TSanityImage object
 * This is a convenience wrapper that handles the TSanityImage structure
 *
 * @param image - TSanityImage object from Sanity queries
 * @param options - Image optimization options
 * @returns Optimized image URL string or null
 *
 * @example
 * ```ts
 * const optimizedUrl = await buildSanityImageUrlFromTSanityImage(blog.image, {
 *   width: 800,
 *   height: 600,
 *   quality: 85
 * });
 * ```
 */
function buildSanityImageUrlFromTSanityImage(
  image: TSanityImage | null | undefined,
  options: SanityImageOptions = {}
): Promise<string | null> {
  if (!image) {
    return Promise.resolve(null);
  }

  // Use the asset reference if available, otherwise fall back to the image object
  const source = image.asset?._ref ? image.asset : image;
  return buildSanityImageUrl(source, options);
}

/**
 * Build an optimized image URL from a TSanityImage using a preset
 *
 * @param image - TSanityImage object from Sanity queries
 * @param preset - Preset name from SanityImagePresets
 * @param overrides - Optional overrides to the preset
 * @returns Optimized image URL string or null
 *
 * @example
 * ```ts
 * const url = await buildSanityImageUrlFromTSanityImageWithPreset(blog.image, 'blogCard');
 * ```
 */
export function buildSanityImageUrlFromTSanityImageWithPreset(
  image: TSanityImage | null | undefined,
  preset: keyof typeof SanityImagePresets,
  overrides?: Partial<SanityImageOptions>
): Promise<string | null> {
  if (!image) {
    return Promise.resolve(null);
  }

  const presetOptions = SanityImagePresets[preset];
  return buildSanityImageUrlFromTSanityImage(image, {
    ...presetOptions,
    ...overrides,
  });
}

/**
 * Build a srcSet string from a TSanityImage object
 * This is a convenience wrapper that handles the TSanityImage structure
 *
 * @param image - TSanityImage object from Sanity queries
 * @param breakpoints - Array of width breakpoints
 * @param options - Base image options
 * @returns srcSet string (e.g., "url1 400w, url2 800w, url3 1200w")
 *
 * @example
 * ```ts
 * const srcSet = await buildSanityImageSrcSetFromTSanityImage(blog.image, [400, 800, 1200]);
 * ```
 */
export function buildSanityImageSrcSetFromTSanityImage(
  image: TSanityImage | null | undefined,
  breakpoints: number[],
  options: Omit<SanityImageOptions, "width"> = {}
): Promise<string> {
  if (!image) {
    return Promise.resolve("");
  }

  // Use the asset reference if available, otherwise fall back to the image object
  const source = image.asset?._ref ? image.asset : image;
  return buildSanityImageSrcSet(source, breakpoints, options);
}
