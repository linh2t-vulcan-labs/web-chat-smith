"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { Navigation, Pagination } from "swiper/modules";
import type { SwiperClass } from "swiper/react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperCore } from "swiper/types";

import { Button } from "@/components/button";
import { SVGIcon } from "@/components/svg-icon";
import { LANDING_SECTION } from "@/config/landing-page";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./styles.css";

import { useRouter } from "@/i18n/navigation";
import type { TSanityHomePage } from "@/libs/sanity";
import { TRACKING_ELEMENT_ID } from "@/libs/tracking-event/elements";
import { compositeStyles } from "@/utils/commons/styles";
import { LOGIN_PAGE_URL } from "@/utils/constants/url";

import { TASKS_IMAGES } from "../../constants/data";
import { ButtonAnimationV2 } from "../button-animation-v2";
import { HighlightText } from "../highlight-text";
import TaskDetail from "./task-detail";

import styles from "./styles.module.scss";

const swiperOptions: Omit<React.ComponentProps<typeof Swiper>, "children"> = {
  breakpoints: {
    0: {
      spaceBetween: 6,
    },
    768: {
      spaceBetween: 8,
    },
  },
  slidesPerGroup: 1,
  slidesPerView: 1,
  spaceBetween: 8,
};

const MakeForSection = ({ data }: { data: TSanityHomePage }) => {
  const { useCases } = data;
  const router = useRouter();
  const swiperRef = useRef<SwiperCore | null>(null);
  const t = useTranslations("landingPage");
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = (swiper: SwiperClass) => {
    setActiveIndex(swiper.activeIndex);
  };

  const handleInit = () => {
    setActiveIndex(0);
  };

  const handleClickTask = (activeIdx: number) => {
    swiperRef.current?.slideTo(activeIdx);
  };

  return (
    <section
      className="px-medium-2 pb-large-4 pt-large-5 md:pb-large-8 md:pt-large-10 mx-auto md:max-w-[1000px]"
      id={LANDING_SECTION.USE_CASES}
    >
      <h2 className="text-app-title-0 md:text-Heading-h2 text-center font-normal! text-white/75">
        {useCases?.title || ""}
      </h2>
      <div className="no-scrollbar my-medium-2.5 space-x-medium-3 border-y-thin md:my-large-6 flex justify-between overflow-x-auto border-white/20 md:overflow-x-hidden">
        {/* oxlint-disable-next-line react/react-compiler -- `useCases` is a data field (Sanity CMS content), not a hook; optional-chained access falsely matches the hook-naming heuristic */}
        {useCases?.items?.map((task, idx) => (
          <button
            id={idx.toString()}
            type="button"
            className={compositeStyles(
              "px-small-1 py-medium-1.5 text-Heading-h6 after:h-small-0.25 after:bg-text-highlight hover:text-text-highlight md:py-medium-2 relative w-max flex-1 whitespace-nowrap after:absolute after:-bottom-px after:left-0 after:w-full md:w-auto",
              activeIndex === idx
                ? "text-text-highlight after:bg-text-highlight"
                : "text-white/80 after:bg-transparent"
            )}
            key={idx.toString()}
            onClick={() => handleClickTask(idx)}
          >
            {task.title}
          </button>
        ))}
      </div>
      <div className={compositeStyles("group relative w-full")}>
        <Swiper
          className="made-for-carousel w-full pb-[42px]! md:pb-[66px]!"
          spaceBetween={8}
          onBeforeInit={(swiper) => {
            swiperRef.current = swiper;
          }}
          onInit={handleInit}
          onSlideChange={handleSlideChange}
          modules={[Navigation, Pagination]}
          pagination={{ clickable: true }}
          {...swiperOptions}
        >
          {/* oxlint-disable-next-line react/react-compiler -- `useCases` is a data field (Sanity CMS content), not a hook; optional-chained access falsely matches the hook-naming heuristic */}
          {useCases?.items?.map((task, idx) => (
            <SwiperSlide
              key={idx.toString()}
              className="flex! items-center justify-center"
            >
              <TaskDetail
                name={task.title || ""}
                description={
                  <HighlightText
                    text={task.content || ""}
                    highlights={task.highlight || []}
                  />
                }
                image={TASKS_IMAGES[idx % 6]?.image ?? ""}
                imageMobile={TASKS_IMAGES[idx % 6]?.imageMobile ?? ""}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <div
          className={compositeStyles(
            "bg-gradient-navigation-previous absolute inset-y-0 left-0 z-10 hidden w-[92px] items-center justify-start transition md:inline-block"
          )}
        >
          <Button
            className={compositeStyles(
              "p-medium-1.5 text-icon-general-tertiary absolute top-[calc(50%-24px)] left-0 z-10 -translate-y-1/2 rounded-full border-[1.5px] border-white/10 backdrop-blur-[60px]",
              styles["navigate-btn"]
            )}
            color="none"
            size="none"
            onClick={() => swiperRef.current && swiperRef.current.slidePrev()}
            startIcon={
              <SVGIcon
                src="/icons/outlined/long-arrow-left.svg"
                width={24}
                height={24}
              />
            }
          />
        </div>
        <div
          className={compositeStyles(
            "bg-gradient-navigation-next absolute inset-y-0 right-0 z-10 hidden w-[92px] items-center justify-end transition md:inline-block"
          )}
        >
          <Button
            className={compositeStyles(
              "p-medium-1.5 text-icon-general-tertiary absolute top-[calc(50%-24px)] right-0 z-10 -translate-y-1/2 rounded-full border-[1.5px] border-white/10 backdrop-blur-[60px]",
              styles["navigate-btn"]
            )}
            color="none"
            size="none"
            onClick={() => swiperRef.current && swiperRef.current.slideNext()}
            startIcon={
              <SVGIcon
                src="/icons/outlined/long-arrow-right.svg"
                width={24}
                height={24}
              />
            }
          />
        </div>
      </div>
      {/* CTA Button */}
      <div className="mt-small-1 md:mt-large-4 flex justify-center">
        <div
          className="backlight relative inline-block rounded-full shadow-[0_4px_32px_0_rgba(24,136,167,0.9)] md:shadow-[0_4px_52px_0_rgba(24,136,167,0.9)]"
          style={{
            backdropFilter: "blur(16px)",
          }}
        >
          {/* <div className="absolute inset-0 rounded-half bg-gradient-mint blur-[9px]"></div> */}
          <ButtonAnimationV2
            size="large"
            className="text-BodyM! px-large-4! text-text-highlight h-[56px] min-w-[184px] bg-[rgba(0,20,30,1)] pt-[14px] font-medium! uppercase"
            onClick={() => router.push(LOGIN_PAGE_URL)}
            id={TRACKING_ELEMENT_ID.LANDING_PAGE.MADE_FOR_CHAT_CTA}
          >
            {t("CTA")}
          </ButtonAnimationV2>
        </div>
      </div>
    </section>
  );
};

export default MakeForSection;
