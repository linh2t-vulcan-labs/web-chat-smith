"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import { Link } from "@/i18n/navigation";
import { getBlogDetailUrl } from "@/utils/commons/helpers";

import BlogCardV2 from "./blog-card-v2";
import type { OptimizedBlog, TBlogCarouselProps } from "./types";

const BlogCarousel: React.FC<TBlogCarouselProps> = ({ posts }) => (
  <Swiper
    slidesPerView="auto"
    spaceBetween={24}
    className="blog-carousel size-full"
  >
    {posts.map((blog, idx) => {
      // Use optimized image if available, otherwise fallback
      const optimizedImage =
        (blog as OptimizedBlog).optimizedImage || blog.image?.url;
      const optimizedAuthorImage =
        (blog as OptimizedBlog).optimizedAuthorImage || blog.authorImage?.url;
      const { optimizedImageSrcSet } = blog as OptimizedBlog;

      return (
        <SwiperSlide className="w-4/5!" key={blog._id}>
          <Link
            href={getBlogDetailUrl(
              blog.category?.slug.current,
              blog.slug.current,
              blog.blogId
            )}
            key={blog._id}
          >
            <BlogCardV2
              imageIndex={idx}
              key={blog._id}
              title={blog.title}
              brief={blog.brief}
              image={optimizedImage}
              category={blog.category?.title || ""}
              createdAt={blog.createdAt}
              authorImage={optimizedAuthorImage}
              authorName={blog.authorName}
              publishedAt={blog.publishedAt}
              blurDataURL={blog.image.lqip}
              srcSet={optimizedImageSrcSet}
              className="h-full"
            />
          </Link>
        </SwiperSlide>
      );
    })}
  </Swiper>
);

export default BlogCarousel;
