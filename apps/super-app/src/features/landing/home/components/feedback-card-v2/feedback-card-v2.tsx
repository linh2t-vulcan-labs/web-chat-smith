import { IconsFilledQuoteIcon } from "@cs/icons/icons-filled-quote";
import { IconsFilledStarIcon } from "@cs/icons/icons-filled-star";
import { useLocale } from "next-intl";
import Image from "next/image";
import React from "react";

import { LIST_LANGUAGE_SUPPORTED } from "@/i18n/constant";
import { compositeStyles } from "@/utils/commons/styles";

interface TFeedbackCard {
  starCount: number;
  content: React.ReactNode;
  commenter: string;
  avatar: string;
}

function FeedbackCardV2(props: Readonly<TFeedbackCard>) {
  const { starCount, content, commenter, avatar } = props;
  const locale = useLocale();
  const cardCls =
    locale === LIST_LANGUAGE_SUPPORTED.ES ? "h-[354px]" : "h-[306px]";
  const contentCls =
    locale === LIST_LANGUAGE_SUPPORTED.ES
      ? "line-clamp-7 md:line-clamp-6"
      : "line-clamp-5";
  return (
    <div
      className={compositeStyles(
        "gap-medium-2.5 rounded-pill-soft thickness-thin bg-surface-general-secondary p-medium-3 flex flex-col border-white/10 md:h-auto md:w-full",
        cardCls
      )}
    >
      <IconsFilledQuoteIcon
        className="text-text-general-primary"
        width={40}
        height={40}
      />
      <p
        className={compositeStyles(
          "text-bodyM flex-1 font-light! text-white/90 opacity-85",
          contentCls
        )}
      >
        {content}
      </p>
      <div className="gap-medium-2 flex items-center justify-between">
        <div className="gap-small-1 flex flex-col">
          <span className="text-Body-s line-clamp-1 flex-1 text-white/75">
            {commenter}
          </span>
          <div className="gap-small-0.25 flex w-full opacity-75">
            {Array.from({ length: starCount }, (_, index) => (
              <IconsFilledStarIcon key={index} width={16} height={16} />
            ))}
          </div>
        </div>
        <div className="relative size-[60px] overflow-hidden rounded-[50%]">
          <Image
            style={{
              objectFit: "cover",
            }}
            fill
            src={avatar}
            alt="avatar"
          />
        </div>
      </div>
    </div>
  );
}

export default FeedbackCardV2;
