import type { TBlog } from "@/libs/sanity/types";

export interface TBlogCardProps {
  authorImage?: string;
  authorName?: string;
  publishedAt?: string;
  image: string;
  title: string;
  brief: string;
  imageIndex: number;
  className?: string;
  category?: string;
  createdAt: string;
  align?: "vertical" | "horizontal";
  titleLarge?: boolean;
  blurDataURL?: string;
  srcSet?: string;
}

export type OptimizedBlog = TBlog & {
  optimizedImage: string;
  optimizedAuthorImage?: string;
  optimizedImageSrcSet?: string;
};

export interface BlogListProp {
  allPosts: (TBlog | OptimizedBlog)[];
  highlightSubPosts: (TBlog | OptimizedBlog)[];
}

export interface TBlogCarouselProps {
  posts: (TBlog | OptimizedBlog)[];
}
