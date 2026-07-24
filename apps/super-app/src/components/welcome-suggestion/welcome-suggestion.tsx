import { useTheme } from "@wrksz/themes/client";
import { motion } from "motion/react";
import Image from "next/image";
import React from "react";

import {
  AtomicOptionItem,
  AtomicOptionItemWithMedia,
} from "@/components/option-item";
import { useMediaQuery } from "@/hooks/use-media-query";

import { SUGGESTION_ANIMATION } from "./consts";

export interface TSuggestionCard {
  id: string;
  key: string; // key to use translation
  type: "image" | "icon";
  actionType:
    | "image_to_image"
    | "text_to_image"
    | "info_query"
    | "fun_social"
    | "deep_research";
  url: string;
  title: string;
  prompt: string;
  isEnabled: boolean;
}

interface Props {
  imageItems: TSuggestionCard[];
  iconItems: TSuggestionCard[];
  onClickSuggestion?: (item: TSuggestionCard) => void;
}

interface TSuggestionType {
  url: string;
  actionType: TSuggestionCard["actionType"];
}

function mappingWelcomeSuggestionIcon(
  options: TSuggestionType,
  theme = "dark"
) {
  const { url, actionType } = options;
  if (theme !== "light") {
    return url;
  }
  const ICON_MAP: Partial<Record<TSuggestionCard["actionType"], string>> = {
    deep_research: "/icons/welcome-suggestions/deep_research.svg",
    fun_social: "/icons/welcome-suggestions/fun_social.svg",
    info_query: "/icons/welcome-suggestions/info_query.svg",
  };
  return ICON_MAP[actionType] || url;
}

const WelcomeSuggestion: React.FC<Props> = ({
  imageItems,
  iconItems,
  onClickSuggestion,
}) => {
  const { theme } = useTheme();

  const isDesktop = useMediaQuery("md", { defaultValue: true });

  return (
    <div className="gap-v1-structural-content-tight m-auto flex w-full flex-col">
      {/* List of image suggestions */}
      <div className="gap-v1-structural-content-tight md:gap-v1-structural-content-tight grid grid-cols-1 md:grid-cols-2">
        {imageItems.map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            initial={SUGGESTION_ANIMATION.initial}
            animate={SUGGESTION_ANIMATION.animate}
            transition={{
              ...SUGGESTION_ANIMATION.transition,
              delay: index * SUGGESTION_ANIMATION.staggerDelay,
            }}
            whileTap={SUGGESTION_ANIMATION.whileTap}
          >
            <div className="border-v1-border-structural-subtle p-v1-structural-content-micro bg-v1-surface-hierarchy-container-low rounded-v1-xl hover:bg-v1-surface-overlay-interactive-hover border hover:cursor-pointer">
              <AtomicOptionItemWithMedia
                type="inline"
                imageSrc={suggestion.url}
                size={isDesktop ? "medium" : "small"}
                description={suggestion.title}
                onClick={() => onClickSuggestion?.(suggestion)}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* List of icon suggestions */}
      <div className="gap-v1-structural-content-tight grid grid-cols-1 md:grid-cols-3">
        {iconItems.map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            initial={SUGGESTION_ANIMATION.initial}
            animate={SUGGESTION_ANIMATION.animate}
            transition={{
              ...SUGGESTION_ANIMATION.transition,
              delay:
                (imageItems.length + index) * SUGGESTION_ANIMATION.staggerDelay,
            }}
            whileTap={SUGGESTION_ANIMATION.whileTap}
          >
            <div className="border-v1-surface-input-material dark:border-v1-border-structural-subtle p-v1-structural-content-micro bg-v1-surface-glass-light-mist rounded-v1-large hover:bg-v1-surface-overlay-interactive-hover border hover:cursor-pointer">
              <AtomicOptionItem
                icon={
                  <span className="rounded-medium bg-v1-surface-glass-dark-breath rounded-v1-medium size-v1-9 flex items-center justify-center">
                    <Image
                      src={mappingWelcomeSuggestionIcon(
                        {
                          actionType: suggestion.actionType,
                          url: suggestion.url,
                        },
                        theme
                      )}
                      width={16}
                      height={16}
                      alt="suggestion"
                    />
                  </span>
                }
                label={suggestion.title}
                onClick={() => onClickSuggestion?.(suggestion)}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WelcomeSuggestion;
