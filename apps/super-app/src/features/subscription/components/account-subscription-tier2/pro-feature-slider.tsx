import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { useMemo } from "react";

import { compositeStyles } from "@/utils/commons/styles";

import { SUBSCRIPTION_PRO_FEATURES_TIER2 } from "../../constants/subscription";

import styles from "../../styles/styles.module.scss";

const ProFeatureSlider = ({ isDesktop = false }: { isDesktop?: boolean }) => {
  const dsT = useTranslations("ds");
  const subscriptionFeatureData = useMemo(() => {
    if (isDesktop) {
      return SUBSCRIPTION_PRO_FEATURES_TIER2;
    }
    //  Duplicate items for infinite marquee on mobile/tablet
    return [
      ...SUBSCRIPTION_PRO_FEATURES_TIER2,
      ...SUBSCRIPTION_PRO_FEATURES_TIER2,
    ];
  }, [isDesktop]);

  return (
    <div
      className={compositeStyles(
        "flex w-full lg:justify-center",
        styles["marquee-wrapper"]
      )}
    >
      <div
        className={compositeStyles(
          "no-scrollbar gap-medium-2 md:px-small-1 lg:gap-medium-2.5 lg:px-small-1 xl:gap-large-4 xl:px-small-0 flex lg:max-w-[1080px] lg:flex-wrap lg:justify-center lg:overflow-x-visible",
          styles["mobile-marquee"]
        )}
      >
        {subscriptionFeatureData.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className={compositeStyles(
              "rounded-rounded flex w-1/2 min-w-1/2 shrink-0 flex-col lg:w-[calc(20%-26px)] lg:min-w-0",
              styles["feature-card-gradient"]
            )}
          >
            <Image
              alt="feature"
              className="w-full"
              width={190}
              height={120}
              src={item.image}
            />
            <div className="gap-small-1 p-medium-2 md:gap-medium-1.5 flex flex-col">
              <div className="text-bodyS-highlight text-text-general-primary md:text-bodyL-highlight">
                {dsT(item.feature)}
              </div>
              <div className="text-footnoteS-neutral text-text-general-tertiary md:text-footnoteM-neutral md:text-text-general-secondary">
                {dsT(item.brief)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProFeatureSlider;
