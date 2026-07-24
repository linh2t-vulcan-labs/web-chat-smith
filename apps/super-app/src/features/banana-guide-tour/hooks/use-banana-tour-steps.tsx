import { useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo } from "react";
import type { Step } from "react-joyride";

import { GUIDE_TOUR_IDS } from "@/config/guide-tour";

import { CardContent } from "../components/card-content";
import { commonStepProps, tourSelector } from "../constants";

export const useBananaTourSteps = (): Step[] => {
  const t = useTranslations("conversationPage.guideTour");

  return useMemo(
    () => [
      {
        content: (
          <CardContent
            isNew
            title={t("model.title")}
            description={t("model.desc")}
            image={
              <div className="relative h-[136px] w-full">
                <Image
                  className="rounded-rounded object-cover"
                  src="/images/banana-pro.png"
                  alt="gemini banana pro"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  style={{ objectPosition: "50% 70%" }}
                  fill
                  priority
                />
              </div>
            }
          />
        ),
        placement: "top-end",
        spotlightPadding: 4,
        target: tourSelector(GUIDE_TOUR_IDS.SELECT_MODEL),
        ...commonStepProps,
      },
      {
        content: (
          <CardContent
            title={t("attachFiles.title")}
            description={t("attachFiles.desc")}
            image={
              <div className="relative mt-[10px] h-[68px] w-full">
                <Image
                  className="rounded-rounded object-contain"
                  src="/images/upload-file.png"
                  alt="attach file"
                  sizes="200px"
                  fill
                  priority
                />
              </div>
            }
          />
        ),
        placement: "top-start",
        spotlightPadding: 2,
        target: tourSelector(GUIDE_TOUR_IDS.ATTACH_FILE),
        ...commonStepProps,
      },
    ],
    [t]
  );
};
