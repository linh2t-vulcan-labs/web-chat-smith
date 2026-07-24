import React from "react";

import { SVGIcon } from "@/components/svg-icon";
import { compositeStyles } from "@/utils/commons/styles";

import { ButtonV3 } from "../button-v3";
import type { FeatureCardProps } from "./type";

import styles from "./styles.module.scss";

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  btnText,
  horizontalCentered,
  btnId,
  onButtonClick,
}) => (
  <div
    className={compositeStyles(
      "gap-medium-2 thickness-thin p-large-4 flex h-full flex-col items-center rounded-full border-white/10 backdrop-blur-[32px]",
      styles["feature-card-item"],
      horizontalCentered ? "justify-center" : "md:items-start"
    )}
  >
    {icon && (
      <SVGIcon
        className="text-text-general-primary"
        src={icon}
        width={32}
        height={32}
      />
    )}
    <h5 className="text-Heading-h4 text-white/75">{title}</h5>
    <p
      className={compositeStyles(
        "text-bodyM text-white/75 opacity-85",
        horizontalCentered
          ? "lg:px-large-4 text-center"
          : "min-h-[96px] text-center sm:min-h-[72px] md:min-h-[84px] md:text-start"
      )}
    >
      {description}
    </p>
    <div className={compositeStyles("flex justify-start")}>
      <ButtonV3
        className={compositeStyles(
          "px-medium-2.5 text-Body-s h-[40px] min-w-[140px] font-light text-[#E8FFFA]",
          horizontalCentered ? "min-w-[172px]" : "min-w-[140px]"
        )}
        color="teal"
        onClick={onButtonClick}
        id={btnId}
      >
        {btnText}
      </ButtonV3>
    </div>
  </div>
);

export default FeatureCard;
