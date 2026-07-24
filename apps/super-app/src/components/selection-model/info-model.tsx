import { useTranslations } from "next-intl";
import Image from "next/image";
import { Popover } from "radix-ui";
import type { Dispatch, SetStateAction } from "react";
import React, { forwardRef } from "react";

import Badge from "@/components/badge/badge";
import { ButtonV2 } from "@/components/button-v2";

interface TInfoModel {
  setHasSeenInfoPopover: Dispatch<SetStateAction<boolean>>;
}

const avoidDefaultDomBehavior = (e: Event) => {
  e.preventDefault();
};

const InfoModel = forwardRef<HTMLDivElement, TInfoModel>(
  ({ setHasSeenInfoPopover }, ref) => {
    const commonT = useTranslations("common");
    const conversationT = useTranslations("conversationPage");

    return (
      <Popover.Content
        ref={ref}
        align="end"
        className="z-50 focus:outline-hidden"
        sideOffset={5}
        onInteractOutside={avoidDefaultDomBehavior}
        onPointerDownOutside={avoidDefaultDomBehavior}
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
              src="/images/gemini-3-flash.png"
              alt="Info new model"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              priority
              fill
              style={{ objectFit: "cover", objectPosition: "50% 70%" }}
            />
          </div>
          <div className="p-small-1">
            <h4 className="gap-small-0.75 text-footnoteM-bold dark:text-text-general-inverse items-center leading-snug">
              {conversationT("newModel.title")}
              <Badge
                className="px-0! text-[8px]! leading-3 font-semibold uppercase"
                type="default"
                containerClassName="py-0! ml-small-0.5 align-middle"
                rounded="half"
                color="green"
              >
                {commonT("cta.new")}
              </Badge>
            </h4>
            {/* GU-1573 */}
            <p className="text-footnoteS-neutral dark:text-text-general-inverse">
              {conversationT("newModel.desc")}
            </p>
          </div>
          <div className="p-small-0.5">
            <ButtonV2
              className="text-footnoteM-highlight!"
              fullWidth
              onClick={() => setHasSeenInfoPopover(true)}
            >
              {commonT("cta.gotIt")}
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
