import { useTranslations } from "next-intl";
import Image from "next/image";
import type { FC } from "react";

import { SVGIcon } from "@/components/svg-icon";
import { compositeStyles } from "@/utils/commons/styles";

type TBenefitStatus = "limited" | "blocked";

interface TBenefitRow {
  label: string;
  free: TBenefitStatus;
}

interface Props {
  className?: string;
}

const BENEFIT_ROWS: TBenefitRow[] = [
  { free: "limited", label: "unlimitedChat" },
  { free: "limited", label: "topTierModels" },
  { free: "blocked", label: "AIAgents" },
  { free: "blocked", label: "imageGeneration" },
  { free: "blocked", label: "deepResearch" },
  { free: "blocked", label: "voiceInteraction" },
  { free: "limited", label: "syncAcrossDevices" },
];

const AVATAR_ITEMS = [
  { className: "", imageSrc: "/images-v2/avatar1.png" },
  { className: "bg-[#f3ad72] text-[#5b2a08]", label: "KN" },
  { className: "", imageSrc: "/images-v2/avatar2.png" },
  { className: "", imageSrc: "/images-v2/avatar3.png" },
  {
    className: "bg-[#82f4b1] text-[#003a2c] text-footnoteS-highlight",
    label: "+8.5k",
  },
];

export const BenefitSection: FC<Props> = ({ className = "" }) => {
  const dsT = useTranslations("ds");
  const commonT = useTranslations("common");

  return (
    <div
      className={compositeStyles(
        "rounded-default border-border-brand-identity bg-surface-general-highlight thickness-standard gap-medium-2 p-medium-2 flex w-full flex-col overflow-hidden",
        className
      )}
    >
      <p className="text-title3 text-text-general-secondary text-center">
        {dsT("userJoinDescription")}
      </p>

      <div className="pb-small-0.5 flex items-center justify-center">
        {AVATAR_ITEMS.map((item, index) => (
          <span
            key={item.label ?? item.imageSrc}
            className={compositeStyles(
              "inline-flex h-10 w-10 min-w-10 shrink-0 items-center justify-center overflow-hidden rounded-full",
              item.imageSrc
                ? "bg-[rgba(255,255,255,0.45)]"
                : "border-text-conversation-user-default border",
              item.className,
              index > 0 && "-ml-small-1"
            )}
          >
            {item.imageSrc ? (
              <Image
                src={item.imageSrc}
                alt="avatar"
                width={40}
                height={40}
                className="h-full w-full rounded-full object-none"
              />
            ) : (
              item.label
            )}
          </span>
        ))}
      </div>

      <div className="pt-small-1 flex items-center justify-between">
        <span
          className={compositeStyles(
            "text-bodyS-highlight text-text-general-secondary font-bold uppercase"
          )}
        >
          {dsT("benefits")}
        </span>
        <div className="grid w-22 grid-cols-2">
          <span
            className={compositeStyles(
              "text-bodyS-highlight text-text-general-secondary text-center font-bold uppercase"
            )}
          >
            {commonT("free")}
          </span>
          <span
            className={compositeStyles(
              "text-bodyS-highlight text-text-action-primary-default text-center font-bold uppercase"
            )}
          >
            {commonT("pro")}
          </span>
        </div>
      </div>

      <div className="gap-small-0.5 flex flex-col">
        {BENEFIT_ROWS.map((row) => (
          <div
            key={row.label}
            className="py-small-0.5 flex items-center justify-between"
          >
            <span className="text-bodyS-neutral text-text-general-secondary">
              {dsT(row.label)}
            </span>
            <div className="grid w-22 grid-cols-2">
              <div className="flex items-center justify-center">
                {row.free === "limited" ? (
                  <span className="text-footnoteS-neutral text-text-general-tertiary">
                    {dsT("limited")}
                  </span>
                ) : (
                  <span className="bg-surface-general-tertiary/80 inline-flex size-5 items-center justify-center rounded-full opacity-60 dark:opacity-35">
                    <SVGIcon
                      src="/icons/v2-limited-icon.svg"
                      width={16}
                      height={16}
                    />
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center">
                <SVGIcon
                  src="/icons/v2-pro-access-icon.svg"
                  width={16}
                  height={16}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
