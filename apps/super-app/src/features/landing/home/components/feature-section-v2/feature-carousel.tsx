import { useTranslations } from "next-intl";
import React, { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import { useRouter } from "@/i18n/navigation";
import type { TSanityHomePageFeatureItem } from "@/libs/sanity";
import { TRACKING_ELEMENT_ID } from "@/libs/tracking-event/elements";
import { LOGIN_PAGE_URL } from "@/utils/constants/url";

import { FEATURE_DATA_ICONS } from "../../constants/data";
import FeatureCard from "./feature-card";

const FeatureCarousel = ({
  featureData,
}: {
  featureData: TSanityHomePageFeatureItem[];
}) => {
  const router = useRouter();

  const landingPageT = useTranslations("landingPage");

  const moreFeatureItem = useMemo(
    () => featureData.find((item) => item.isMore),
    [featureData]
  );

  return (
    <Swiper
      slidesPerView="auto"
      spaceBetween={12}
      className="feedback-carousel size-full"
    >
      {featureData
        ?.filter((item) => !item?.isMore)
        ?.map((feature, idx) => (
          <SwiperSlide className="w-[88%]!" key={idx.toString()}>
            <FeatureCard
              key={idx.toString()}
              title={feature.name || ""}
              description={feature.description || ""}
              btnText={landingPageT("feature.CTA")}
              icon={FEATURE_DATA_ICONS[idx % 5]}
              onButtonClick={() => router.push(LOGIN_PAGE_URL)}
              btnId={feature.btnId || ""}
            />
          </SwiperSlide>
        ))}
      {moreFeatureItem && (
        <SwiperSlide className="w-[85%]">
          <FeatureCard
            title={moreFeatureItem.name || ""}
            description={moreFeatureItem.description || ""}
            btnText={landingPageT("feature.discoverCTA")}
            horizontalCentered={true}
            onButtonClick={() => router.push(LOGIN_PAGE_URL)}
            btnId={TRACKING_ELEMENT_ID.LANDING_PAGE.TRY_NOW_DISCOVER}
          />
        </SwiperSlide>
      )}
    </Swiper>
  );
};

export default FeatureCarousel;
