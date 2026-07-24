import type { PortableTextBlock } from "@portabletext/react";
import type { SanityDocument } from "next-sanity";

export interface TSanityImage {
  _key?: string;
  _type: "image";
  asset: {
    _ref: string;
    _id?: string;
  };
  mimeType?: string;
  url: string;
  alt?: string | null;
  lqip?: string;
}

export interface TCategory {
  createdAt: string;
  description: string | null;
  slug: {
    current: string;
  };
  title: string;
}

export interface TBlog {
  authorImage?: TSanityImage;
  authorName?: string;
  title: string;
  brief: string;
  image: TSanityImage;
  blogId: number;
  content: unknown;
  tags: string[];
  category: TCategory | null;
  slug: { current: string };
  language?: string | null;
  createdAt: string;
  publishedAt: string;
  _key: string;
  _id: string;
}

export type TSanityBlog = TBlog & SanityDocument;
export interface TTotalBlogResponse {
  total: number;
}

/** Row shape for sitemap entries under `/{group}/{slug}`. */
export type TSanityAiToolPageSitemap = {
  _id: string;
  _updatedAt: string;
  language?: string | null;
  slug: string;
  groupId?: string | null;
} & SanityDocument;

export interface TSanityFooterLink {
  label: string;
  href: string;
}

export interface TSanityMobileStore {
  id: string;
  url: string;
  alt: string;
  link: string;
}

export interface TSanitySocialLink {
  id: string;
  logo: string;
  href: string;
}

export interface TSanityFooter {
  _id: string;
  _type: "footer";
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  logoText?: string;
  aboutTitle?: string;
  aboutDescription?: string;
  followTitle?: string;
  copyrightText?: string;
  footerLinks: TSanityFooterLink[];
  mobileStores?: TSanityMobileStore[];
  socialLinks?: TSanitySocialLink[];
  backgroundImage?: TSanityImage;
}

export interface THeaderCTAHeaderLabel {
  desktop: string;
  mobile: string;
}

interface TPlatformNavigation {
  desktop: string;
  ios: string;
  android: string;
}

export type TSanityHeader = SanityDocument & {
  logo: TSanityImage;
  ctaLabels: THeaderCTAHeaderLabel;
  navigationConfigs: TPlatformNavigation;
};

export type TSanityLayout = SanityDocument & {
  header: TSanityHeader;
  footer: TSanityFooter;
};

export type TSanityPolicy = SanityDocument & {
  createdAt: string;
  title: string;
  slug: string;
};

export interface TSanityHomePageHero {
  title: string | null;
  subtitle: string | null;
  cta: string | null;
  highlight: string | null;
}

export interface TSanityHomePageFeatureItem {
  name: string | null;
  description: string | null;
  link: string | null;
  btnId: string | null;
  isMore: boolean;
}

export interface TSanityHomePageFeatures {
  title: string | null;
  subtitle: string | null;
  items: TSanityHomePageFeatureItem[];
}

export interface TSanityHomePageUseCaseItem {
  title: string | null;
  content: string | null;
  highlight: string[];
}

export interface TSanityHomePageUseCases {
  title: string | null;
  items: TSanityHomePageUseCaseItem[];
}

export interface TSanityHomePagePlanBenefit {
  title: string | null;
  description: string | null;
  isProPlan: boolean;
  isLimit: boolean;
}

export interface TSanityHomePagePlan {
  title: string | null;
  benefits: TSanityHomePagePlanBenefit[];
}

export interface TSanityHomePageFaqItem {
  question: string | null;
  answer: PortableTextBlock[] | null;
}

/** Response shape of HOMEPAGE_DATA_QUERY (*[_type == "homePage"][0] { ... }) */
export interface TSanityHomePage {
  _id: string;
  _type: "homePage";
  language: string | null;
  appStoreLink: string | null;
  chPlayLink: string | null;
  hero: TSanityHomePageHero | null;
  features: TSanityHomePageFeatures | null;
  useCases: TSanityHomePageUseCases | null;
  plan: TSanityHomePagePlan | null;
  faq: TSanityHomePageFaqItem[] | null;
}
export interface TSanityMetadata {
  title: string;
  description: string | null;
  keywords: string | null;
}
