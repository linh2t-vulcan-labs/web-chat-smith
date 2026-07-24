import { useTranslations } from "next-intl";
import Image from "next/image";
import { Popover } from "radix-ui";
import type { Dispatch, SetStateAction } from "react";
import React, { forwardRef } from "react";

import Badge from "@/components/badge/badge";
import { ButtonV2 } from "@/components/button-v2";
import { compositeStyles } from "@/utils/commons/styles";

interface TInfoModel {
  setHasSeenInfoPopover: Dispatch<SetStateAction<boolean>>;
}

const InfoModel = forwardRef<HTMLDivElement, TInfoModel>(
  ({ setHasSeenInfoPopover }, ref) => {
    const commonT = useTranslations("common");

    return (
      <Popover.Content
        ref={ref}
        align="end"
        className={compositeStyles(
          "z-50 focus:outline-hidden",
          // Pop-out effects
          "data-[side=bottom]:origin-top-right data-[side=top]:origin-bottom-right",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in data-[state=open]:zoom-in-50",
          "data-[state=open]:duration-700"
        )}
        sideOffset={5}
        onInteractOutside={() => {
          setHasSeenInfoPopover(true);
        }}
      >
        <div className="rounded-rounded p-small-0.25 max-w-[246px] bg-[#EDEDED]">
          <div
            style={{
              height: "136px",
              position: "relative",
              width: "100%",
            }}
          >
            <Image
              className="rounded-rounded"
              src="/images/new-models.png"
              alt="Description of my image"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              priority
              fill
              style={{ objectFit: "cover", objectPosition: "50% 70%" }}
            />
          </div>
          <div className="p-small-1">
            <h4 className="gap-small-0.75 text-footnoteM-bold text-text-general-inverse inline-flex items-center">
              Smarter Al models just dropped!{" "}
              <Badge
                className="px-0! text-[8px]! leading-3 font-semibold uppercase"
                type="default"
                containerClassName="py-0!"
                rounded="half"
                color="green"
              >
                {commonT("cta.new")}
              </Badge>
            </h4>
            <p className="text-footnoteS-neutral text-text-general-inverse">
              Tap here to explore the latest reasoning models for your daily
              tasks
            </p>
          </div>
          <div className="p-small-0.5">
            <ButtonV2 fullWidth onClick={() => setHasSeenInfoPopover(true)}>
              Got It
            </ButtonV2>
          </div>
        </div>
        <Popover.Arrow className="fill-[#EDEDED]" width={12} height={6} />
      </Popover.Content>
    );
  }
);

InfoModel.displayName = "InfoModel";

export default InfoModel;
