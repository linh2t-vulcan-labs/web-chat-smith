"use client";

import { useTranslations } from "next-intl";
import type React from "react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { FEEDBACKS_SECTION } from "@/utils/constants/common";

import { FeedbackCardV2 } from "../feedback-card-v2";

import "swiper/css";
import "swiper/css/pagination";

import "./styles.css";

import { feedbacks } from "./consts";

const renderFeedbackBreakMobile = () => <br className="md:hidden" />;
const renderFeedbackBold = (chunks: React.ReactNode) => (
  <span className="font-bold">{chunks} </span>
);

function FeedBacksSectionV2() {
  const isDesktop = useMediaQuery("md");
  const t = useTranslations("landingPage.feedback");
  const subtitle = t.rich("subtitle", {
    breakMobile: renderFeedbackBreakMobile,
  });
  return (
    <section
      id={FEEDBACKS_SECTION}
      className="gap-large-4 py-large-5 md:gap-large-8 md:py-large-10 flex flex-col"
    >
      <div className="mx-auto w-full px-3 sm:px-6 md:max-w-7xl md:px-14">
        <div className="gap-medium-1.5 px-medium-2 flex flex-col items-center">
          <h2 className="text-app-title-0 md:text-Heading-h2 text-center font-normal! text-white/75">
            {t("title")}
          </h2>
          <p className="text-bodyM md:text-Body-l text-center text-white/80">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="md:mx-auto md:w-full md:max-w-7xl">
        {isDesktop ? (
          <div className="gap-large-4 flex px-4 sm:px-0 md:grid md:grid-cols-2 lg:grid-cols-3">
            {feedbacks.map(({ id, content, commenter, avatar, starCount }) => (
              <FeedbackCardV2
                key={id}
                content={t.rich(content, {
                  b: renderFeedbackBold,
                })}
                starCount={starCount}
                commenter={commenter}
                avatar={avatar}
              />
            ))}
          </div>
        ) : (
          <div className="ps-medium-2">
            <Swiper
              slidesPerView="auto"
              spaceBetween={24}
              pagination={{
                clickable: true,
              }}
              autoplay={{
                delay: 5000,
                pauseOnMouseEnter: true,
              }}
              modules={[Autoplay, Pagination]}
              className="feedback-carousel size-full pb-[42px]!"
            >
              {feedbacks.map(
                ({ id, content, commenter, starCount, avatar }) => (
                  <SwiperSlide className="w-[88%]!" key={id}>
                    <FeedbackCardV2
                      content={t.rich(content, {
                        b: renderFeedbackBold,
                      })}
                      starCount={starCount}
                      commenter={commenter}
                      avatar={avatar}
                    />
                  </SwiperSlide>
                )
              )}
            </Swiper>
          </div>
        )}
      </div>
    </section>
  );
}

export default FeedBacksSectionV2;
