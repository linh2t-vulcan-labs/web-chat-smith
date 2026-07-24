import Image from "next/image";
import React from "react";

import { formatTitleWithCurrentDate } from "@/utils/commons/helpers";
import { compositeStyles } from "@/utils/commons/styles";

import { DEFAULT_AUTHOR_IMAGE, DEFAULT_AUTHOR_NAME } from "./constants";
import FooterBlog from "./footer-blog";
import type { TBlogCardProps } from "./types";

const BlogCardV2: React.FC<TBlogCardProps> = ({
  image,
  title,
  brief,
  imageIndex,
  category,
  createdAt,
  authorImage = DEFAULT_AUTHOR_IMAGE,
  authorName = DEFAULT_AUTHOR_NAME,
  publishedAt = createdAt,
  className,
  titleLarge,
  align = "vertical",
  blurDataURL,
  srcSet,
}) => {
  const isVertical = align !== "horizontal";
  return (
    <div
      className={compositeStyles(
        "gap-medium-300 group rounded-default flex bg-white/5 hover:cursor-pointer",
        isVertical && "flex-col",
        className
      )}
    >
      <div
        className={compositeStyles(
          "rounded-ss-default relative w-full shrink-0 basis-[56%] overflow-hidden",
          isVertical
            ? "rounded-se-default aspect-568/321"
            : "rounded-es-default aspect-318/180"
        )}
      >
        <Image
          src={image}
          alt={`${title} - blog image`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          priority={imageIndex < 3} // Priority for first 3 images
          loading={imageIndex < 3 ? "eager" : "lazy"}
          placeholder="blur"
          blurDataURL={
            blurDataURL ||
            "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          }
          {...(srcSet && { srcSet })}
        />
      </div>
      <div
        className={compositeStyles(
          "px-medium-2 pb-medium-2 pt-medium-2 flex flex-1 basis-[44%] flex-col justify-between",
          titleLarge ? "gap-medium-2" : "gap-medium-1.5"
        )}
      >
        <div className="gap-medium-1.5 flex flex-col">
          <span
            className="rounded-soft px-small-1 py-small-0.5 text-headingS-Highlight line-clamp-1 inline-block w-fit max-w-full font-light text-nowrap text-white group-hover:bg-[rgba(41,255,251,0.20)]! md:mb-1"
            style={{ background: "rgba(186, 186, 186, 0.20)" }}
          >
            {category}
          </span>

          <h4
            className={compositeStyles(
              "text-text-general-primary hover:text-text-general-brand-identity group-hover:text-text-highlight line-clamp-2 min-h-[48px] w-full overflow-hidden text-ellipsis md:min-h-auto",
              titleLarge ? "text-web-h4" : "text-Heading-h5"
            )}
          >
            {formatTitleWithCurrentDate(title)}
          </h4>
        </div>
        {isVertical && (
          <p className="text-bodyM line-clamp-2 text-white/80">{brief}</p>
        )}
        <div className="gap-small-1 flex items-center">
          <FooterBlog
            authorImage={authorImage || DEFAULT_AUTHOR_IMAGE}
            authorName={authorName || DEFAULT_AUTHOR_NAME}
            publishedAt={publishedAt}
          />
        </div>
      </div>
    </div>
  );
};

export default BlogCardV2;
