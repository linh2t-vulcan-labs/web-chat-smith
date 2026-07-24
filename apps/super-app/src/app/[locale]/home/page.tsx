import { env } from "@cs/env";
import { Suspense } from "react";

import BannerV2 from "@/features/landing/home/components/banner-v2/banner-v2";
import {
  BlogSectionV2,
  BlogSectionV2Skeleton,
} from "@/features/landing/home/components/blog-section-v2";
import { CommunitySection } from "@/features/landing/home/components/community-section";
import { FaqSectionV2 } from "@/features/landing/home/components/faq-section-v2";
import { FeatureSectionV2 } from "@/features/landing/home/components/feature-section-v2";
import { FeedBacksSectionV2 } from "@/features/landing/home/components/feedback-section-v2";
import { MadeForSection } from "@/features/landing/home/components/made-for-section";
import PaddleContainer from "@/features/landing/home/components/paddle-container/paddle-container";
import { WhatYouGet } from "@/features/landing/home/components/what-you-get";
import type { TSanityHomePage } from "@/libs/sanity";
import {
  HOMEPAGE_DATA_QUERY,
  safeSanityFetchWithFallback,
} from "@/libs/sanity";

export default async function Landing(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const lang = params.locale ?? "en";
  const homePageData = await safeSanityFetchWithFallback<TSanityHomePage>(
    HOMEPAGE_DATA_QUERY,
    {
      _id: "",
    } as TSanityHomePage,
    {
      lang,
    },
    {
      next: {
        revalidate: env.SANITY_REVALIDATE_TIME,
        tags: ["homepage-data"],
      },
    }
  );
  return (
    <main
      className="dark home bg-v1-surface-hierarchy-base"
      data-theme="dark"
      style={{
        colorScheme: "dark",
      }}
    >
      <PaddleContainer />
      <BannerV2 data={homePageData} />
      <FeatureSectionV2 data={homePageData} />
      <MadeForSection data={homePageData} />
      <WhatYouGet data={homePageData} />
      <FeedBacksSectionV2 />
      <Suspense fallback={<BlogSectionV2Skeleton />}>
        <BlogSectionV2 />
      </Suspense>
      <CommunitySection />
      <FaqSectionV2 data={homePageData} />
    </main>
  );
}
