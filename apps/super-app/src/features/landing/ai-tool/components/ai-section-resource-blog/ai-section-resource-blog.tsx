import type { TBlog } from "@/libs/sanity/types";
import { formatReadableDate } from "@/utils/commons/date-time";
import {
  formatTitleWithCurrentDate,
  getBlogDetailUrl,
} from "@/utils/commons/helpers";
import { BLOGS_URL } from "@/utils/constants/url";

import { getAIToolTranslation } from "../../translations/translattion";
import {
  DEFAULT_AUTHOR_IMAGE,
  getResourceBlogsForAiTool,
  optimizeResourceBlogImages,
  sanityBlogLanguageFromSiteLocale,
} from "../utils";
import type { OptimizedResourceBlog } from "../utils";
import type { BlogCarouselItem } from "./ai-section-resource-blog-carousel";
import { AISectionResourceBlogCarousel } from "./ai-section-resource-blog-carousel";
import { AISectionResourceBlogSeeMoreCta } from "./ai-section-resource-blog-see-more-cta";

import styles from "./styles.module.css";

export interface AISectionResourceBlogProps {
  locale: string;
  blogs?: TBlog[] | null;
  blogTags?: string[] | null;
}

/**
 * Blog resources for the AI tool landing.
 * Priority: curated `aiTool.blogs` > `aiTool.blogTags` (max 12) > latest by locale.
 * Design: Figma desktop 1:8326, mobile 12:9600. Desktop: 3-per-page carousel.
 */
export default async function AISectionResourceBlog({
  locale,
  blogs,
  blogTags,
}: AISectionResourceBlogProps) {
  const { t } = await getAIToolTranslation();
  const { posts, blogLang } = await getResourceBlogsForAiTool(
    locale,
    blogs,
    blogTags
  );

  if (!posts.length) {
    return null;
  }

  const optimizedResults = await Promise.all(
    posts.map((blog) => optimizeResourceBlogImages(blog))
  );
  const optimized = optimizedResults.filter(
    (b): b is OptimizedResourceBlog => b !== null && b !== undefined
  );

  if (!optimized.length) {
    return null;
  }

  const blogsBase = `/${sanityBlogLanguageFromSiteLocale(locale)}${BLOGS_URL}`;

  const carouselItems: BlogCarouselItem[] = optimized.map((blog) => {
    const displayTitle = formatTitleWithCurrentDate(blog.title);
    const postLang = blog.language?.trim() || blogLang;
    const href = `/${postLang}${getBlogDetailUrl(
      blog.category?.slug.current,
      blog.slug.current,
      blog.blogId
    )}`;
    const published = blog.publishedAt || blog.createdAt;

    return {
      authorName: blog.authorName?.trim() || t("resourceBlog.fallbackAuthor"),
      authorSrc:
        blog.optimizedAuthorImage ||
        blog.authorImage?.url ||
        DEFAULT_AUTHOR_IMAGE,
      categoryLabel:
        blog.category?.title?.trim() || t("resourceBlog.fallbackCategory"),
      href,
      id: blog._id,
      imageAlt: blog.image.alt || displayTitle,
      imageLqip: blog.image.lqip,
      imageUrl: blog.optimizedImage,
      published: formatReadableDate(published),
      title: displayTitle,
    };
  });

  return (
    <section
      className={styles.section}
      aria-label={t("resourceBlog.aria.section")}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 className={styles.title}>
            {t("resourceBlog.title.prefix")}
            <span className={styles.titleHighlight}>
              {t("resourceBlog.title.highlight")}
            </span>
            {t("resourceBlog.title.suffix")}
          </h2>
        </header>

        <AISectionResourceBlogCarousel
          items={carouselItems}
          listAria={t("resourceBlog.aria.blogList")}
          prevAriaLabel={t("horizontalCards.aria.previous")}
          nextAriaLabel={t("horizontalCards.aria.next")}
        />

        <AISectionResourceBlogSeeMoreCta
          href={blogsBase}
          className={styles.cta}
          ariaLabel={t("resourceBlog.aria.seeMoreLink")}
          label={t("resourceBlog.seeMore")}
          ctaLabelClassName={styles.ctaLabel}
          ctaIconClassName={styles.ctaIcon}
        />
      </div>
    </section>
  );
}
