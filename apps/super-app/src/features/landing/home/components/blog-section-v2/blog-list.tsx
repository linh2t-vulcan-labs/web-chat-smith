"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { Link } from "@/i18n/navigation";
import { getBlogDetailUrl } from "@/utils/commons/helpers";

import BlogCardV2 from "./blog-card-v2";
import type { BlogListProp, OptimizedBlog } from "./types";

const BlogCarousel = dynamic(() => import("./blog-carousel"), {
  loading: () => (
    <div className="mt-large-4 ps-medium-2">
      <div className="flex gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-4/5 animate-pulse">
            <div className="h-64 rounded-lg bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  ),
  ssr: false,
});

export const BlogList: React.FC<BlogListProp> = ({
  allPosts,
  highlightSubPosts,
}) => {
  const [mounted, setMounted] = useState(false);
  const isDesktop = useMediaQuery("md");

  useEffect(() => {
    // oxlint-disable-next-line react/react-compiler -- mount-detection flag set from an effect with empty deps; intentional one-time client-only state sync
    setMounted(true);
  }, []);

  const desktopPosts = (
    <div className="mt-large-4 gap-large-4 grid grid-cols-3">
      {highlightSubPosts.map((blog, idx) => {
        // Use optimized image if available, otherwise fallback
        const optimizedImage =
          (blog as OptimizedBlog).optimizedImage || blog.image?.url;
        const optimizedAuthorImage =
          (blog as OptimizedBlog).optimizedAuthorImage || blog.authorImage?.url;
        const { optimizedImageSrcSet } = blog as OptimizedBlog;

        return (
          <Link
            href={getBlogDetailUrl(
              blog.category?.slug.current,
              blog.slug.current,
              blog.blogId
            )}
            key={blog._id}
          >
            <BlogCardV2
              imageIndex={idx + 4} // Continue from where top section left off (0-3 are used above)
              authorImage={optimizedAuthorImage}
              authorName={blog.authorName}
              publishedAt={blog.publishedAt}
              key={blog._id}
              title={blog.title}
              brief={blog.brief}
              category={blog.category?.title || ""}
              image={optimizedImage}
              createdAt={blog.createdAt}
              blurDataURL={blog.image.lqip}
              srcSet={optimizedImageSrcSet}
            />
          </Link>
        );
      })}
    </div>
  );

  // Render desktop version by default to prevent layout shift
  if (!mounted) {
    return desktopPosts;
  }

  return isDesktop ? (
    desktopPosts
  ) : (
    // render mobile blog carousel
    <div className="mt-large-4 ps-medium-2">
      <BlogCarousel posts={allPosts.slice(1)} />
    </div>
  );
};
