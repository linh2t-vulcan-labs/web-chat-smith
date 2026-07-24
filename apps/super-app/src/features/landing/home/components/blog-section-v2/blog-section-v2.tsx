import { env } from "@cs/env";
import { getLocale, getTranslations } from "next-intl/server";
import React from "react";

import { LANDING_SECTION } from "@/config/landing-page";
import { Link } from "@/i18n/navigation";
import {
  buildSanityImageSrcSetFromTSanityImage,
  buildSanityImageUrlFromTSanityImageWithPreset,
  SanityImagePresets,
} from "@/libs/sanity/image-url";
import { LATEST_BLOGS_QUERY } from "@/libs/sanity/query";
import { safeSanityFetchWithFallback } from "@/libs/sanity/safe-fetch";
import type { TBlog, TSanityImage } from "@/libs/sanity/types";
import { TRACKING_ELEMENT_ID } from "@/libs/tracking-event/elements";
import { getBlogDetailUrl } from "@/utils/commons/helpers";
import { BLOGS_URL } from "@/utils/constants/url";

import { buttonV3Variants } from "../button-v3/consts";
import BlogCardV2 from "./blog-card-v2";
import { BlogHeading } from "./blog-heading";
import { BlogList } from "./blog-list";

type OptimizedBlog = TBlog & {
  optimizedImage: string;
  optimizedAuthorImage?: string;
  optimizedImageSrcSet?: string;
};

type ImagePreset = keyof typeof SanityImagePresets;

/**
 * Optimize a single image with fallback to original URL
 */
function optimizeImage(
  image: TSanityImage | null | undefined,
  preset: ImagePreset,
  fallbackUrl?: string
): Promise<string | null> {
  if (!image) {
    return Promise.resolve(fallbackUrl || null);
  }
  return buildSanityImageUrlFromTSanityImageWithPreset(image, preset).catch(
    () => fallbackUrl || image.url
  );
}

/**
 * Optimize blog images (main image and author image) with srcSet
 */
async function optimizeBlogImages(
  blog: TBlog,
  imagePreset: ImagePreset
): Promise<OptimizedBlog> {
  // Define breakpoints based on preset
  // For blogCard (568x321): mobile (320), tablet (568), desktop (1136 for 2x)
  // For blogCardHorizontal (318x180): mobile (318), tablet (636), desktop (1272 for 2x)
  const breakpoints =
    imagePreset === "blogCard" ? [320, 568, 1136] : [318, 636, 1272];

  const [optimizedImage, optimizedAuthorImage, optimizedImageSrcSet] =
    await Promise.all([
      optimizeImage(blog.image, imagePreset, blog?.image?.url),
      blog.authorImage
        ? optimizeImage(blog.authorImage, "avatar", blog.authorImage?.url)
        : null,
      buildSanityImageSrcSetFromTSanityImage(blog.image, breakpoints, {
        fit: SanityImagePresets[imagePreset].fit,
        format: "auto",
        quality: SanityImagePresets[imagePreset].quality,
      }).catch(() => ""),
    ]);

  return {
    ...blog,
    optimizedAuthorImage: optimizedAuthorImage || undefined,
    optimizedImage: optimizedImage || blog.image?.url,
    optimizedImageSrcSet: optimizedImageSrcSet || undefined,
  };
}

/**
 * Optimize multiple blog images in parallel
 */
function optimizeBlogs(
  blogs: TBlog[],
  imagePreset: ImagePreset
): Promise<OptimizedBlog[]> {
  return Promise.all(
    blogs.map((blog) => optimizeBlogImages(blog, imagePreset))
  );
}

const BlogSectionV2 = async () => {
  const lang = await getLocale();
  const latestPosts = await safeSanityFetchWithFallback<TBlog[]>(
    LATEST_BLOGS_QUERY,
    [],
    { lang },
    {
      next: {
        revalidate: env.SANITY_REVALIDATE_TIME,
        tags: ["blogs"],
      },
    }
  );

  const highlightPost = latestPosts?.[0];
  const highlightSubPosts = latestPosts.slice(1, 4);
  const bottomSubPosts = latestPosts.slice(4, 7);

  const t = await getTranslations("landingPage");
  // Optimize images in parallel (including bottom posts)
  const [
    highlightPostOptimized,
    highlightSubPostsOptimized,
    bottomSubPostsOptimized,
  ] = await Promise.all([
    highlightPost ? optimizeBlogImages(highlightPost, "blogCard") : null,
    optimizeBlogs(highlightSubPosts, "blogCardHorizontal"),
    optimizeBlogs(bottomSubPosts, "blogCard"),
  ]);

  return (
    <section
      className="py-large-5 md:px-medium-2 md:py-large-10 mx-auto max-w-[1200px]"
      id={LANDING_SECTION.BLOG}
    >
      <BlogHeading />
      {/* Top blog post */}
      <div className="gap-large-4 pt-large-4 md:pt-large-6 w-full lg:flex">
        <div className="px-medium-2 md:px-small-0 flex-1">
          {highlightPostOptimized && (
            <Link
              href={getBlogDetailUrl(
                highlightPostOptimized.category?.slug.current,
                highlightPostOptimized.slug.current,
                highlightPostOptimized.blogId
              )}
            >
              <BlogCardV2
                imageIndex={0}
                authorImage={
                  highlightPostOptimized.optimizedAuthorImage ||
                  highlightPostOptimized.authorImage?.url
                }
                authorName={highlightPostOptimized.authorName}
                publishedAt={highlightPostOptimized.publishedAt}
                titleLarge
                className="bg-surface-general-secondary! h-full"
                title={highlightPostOptimized?.title}
                brief={highlightPostOptimized?.brief}
                category={highlightPostOptimized.category?.title || ""}
                image={highlightPostOptimized?.optimizedImage}
                createdAt={highlightPostOptimized?.createdAt}
                blurDataURL={highlightPostOptimized?.image?.lqip}
                srcSet={highlightPostOptimized?.optimizedImageSrcSet}
              />
            </Link>
          )}
        </div>
        <div className="gap-medium-2 hidden flex-1 flex-col md:flex">
          {highlightSubPostsOptimized.slice(0, 3).map((blog, idx) => (
            <Link
              key={blog._id}
              href={getBlogDetailUrl(
                blog.category?.slug.current,
                blog.slug.current,
                blog.blogId
              )}
            >
              <BlogCardV2
                authorImage={blog.optimizedAuthorImage || blog.authorImage?.url}
                authorName={blog.authorName}
                publishedAt={blog.publishedAt}
                imageIndex={idx + 1}
                align="horizontal"
                title={blog.title}
                brief={blog.brief}
                category={blog.category?.title || ""}
                image={blog.optimizedImage}
                createdAt={blog.createdAt}
                className="h-full md:w-1/2 lg:w-full"
                blurDataURL={blog.image.lqip}
                srcSet={blog.optimizedImageSrcSet}
              />
            </Link>
          ))}
        </div>
      </div>
      {/* Bottom blog post */}

      <BlogList
        highlightSubPosts={bottomSubPostsOptimized}
        allPosts={latestPosts.map((blog, idx) => {
          // Map to optimized versions
          if (idx === 0) {
            return highlightPostOptimized || blog;
          }
          if (idx >= 1 && idx <= 3) {
            return highlightSubPostsOptimized[idx - 1] || blog;
          }
          if (idx >= 4 && idx <= 6) {
            return bottomSubPostsOptimized[idx - 4] || blog;
          }
          return blog;
        })}
      />

      <div className="pt-large-4 md:pt-large-6 flex justify-center">
        <Link
          href={BLOGS_URL}
          aria-label={t("seeMoreLink")}
          className={buttonV3Variants({
            className:
              "text-bodyM px-medium-2.5 inline-flex h-[48px] min-w-[177px] items-center justify-center font-medium text-[#E8FFFA] uppercase",
            color: "teal",
          })}
          id={TRACKING_ELEMENT_ID.LANDING_PAGE.BLOG_ACCESS_CTA}
        >
          {t("seeMore")}
        </Link>
      </div>
    </section>
  );
};

export default BlogSectionV2;
