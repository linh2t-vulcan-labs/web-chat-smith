import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";

import { SVGIcon } from "@/components/svg-icon";
import { compositeStyles } from "@/utils/commons/styles";

import type { TTaskCardProps } from "./types";

import styles from "./styles.module.scss";

export const TaskCard: React.FC<TTaskCardProps> = ({
  icon,
  feature,
  description,
  limit,
}) => {
  const t = useTranslations("landingPage.plan");
  return (
    <div
      className={compositeStyles(
        "flex items-center justify-between gap-small-1 rounded-default border border-white/10 bg-white/5 opacity-85 backdrop-blur-lg",
        styles["task-card"],
        limit ? styles["task-card-without-block"] : styles["task-card-block"]
      )}
    >
      <div className="flex flex-1 items-center gap-medium-2 px-medium-2 py-small-1">
        <Image
          className="h-6 rounded-soft opacity-50"
          width={24}
          height={24}
          src={icon}
          alt="logo"
        />
        <div className="flex flex-col gap-small-0.25">
          <h3 className="text-Body-s font-medium text-white/90">{feature}</h3>
          <p className="text-bodyXS text-white/75">{description}</p>
        </div>
      </div>
      <div className="hidden w-[180px] justify-center md:flex">
        {limit ? (
          <span className="text-Body-s font-medium text-text-highlight">
            {t("limited")}
          </span>
        ) : (
          <SVGIcon
            className="me-small-0.25 text-text-general-primary"
            src="/icons/outlined/block.svg"
            width={21}
            height={21}
          />
        )}
      </div>
      <div className="hidden w-[180px] justify-center md:flex">
        <SVGIcon
          className="me-small-0.25 text-text-general-primary"
          src="/icons/filled/crown-mint-green.svg"
          width={36}
          height={36}
        />
      </div>
    </div>
  );
};
