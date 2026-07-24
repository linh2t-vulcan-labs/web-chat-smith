"use client";

import { IconsFilledStarIcon } from "@cs/icons/icons-filled-star";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { feedbacks } from "./consts";

function FeedbackLoginSection() {
  const feedbackTranslate = useTranslations("loginPage.feedback");
  // GU-1573
  return (
    <div className="gap-medium-1.5 flex">
      {feedbacks.slice(0, 3).map(({ commenter, avatar, starCount }, index) => (
        <div
          className="gap-medium-2 rounded-default p-medium-2 flex flex-1 flex-col justify-between"
          key={index}
          style={{
            background: "rgba(255, 255, 255, 0.08)",
          }}
        >
          <p className="text-footnoteM-neutral text-text-general-inverse dark:text-text-general-primary opacity-85">
            {feedbackTranslate(String(index + 1))}
          </p>
          <div className="flex items-start justify-between">
            <div className="gap-small-1 flex flex-col">
              <span className="text-footnoteM-highlight text-text-general-tertiary font-normal">
                {commenter}
              </span>
              <div className="gap-small-0.25 flex w-full opacity-60">
                {Array.from({ length: starCount }).map((_, index) => (
                  <IconsFilledStarIcon key={index} width={12} height={12} />
                ))}
              </div>
            </div>
            <div className="relative size-[40px] overflow-hidden rounded-[50%]">
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
      ))}
    </div>
  );
}

export default FeedbackLoginSection;
