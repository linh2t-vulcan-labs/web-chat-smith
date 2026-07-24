import { forwardRef, useEffect, useRef } from "react";

import { SVGIcon } from "@/components/svg-icon";
import type { EAIProviderModel } from "@/core/models/model";
import { compositeStyles } from "@/utils/commons/styles";

import type { TModelTabProps, TTabs } from "./types";

const ModelTab = forwardRef<HTMLButtonElement, TModelTabProps>(
  (
    {
      className = "",
      image,
      name,
      isActive = false,
      onClick,
      hasNewModel = false,
    },
    ref
  ) => (
    <button
      ref={ref}
      type="button"
      className={compositeStyles(
        "border-border-general-primary px-small-0.5 py-small-1 text-footnoteS-neutral hover:bg-surface-input-hover hover:text-text-general-primary relative flex size-full flex-col items-center border-b",
        {
          "text-text-general-primary": isActive,
          "text-text-general-tertiary": !isActive,
        },
        className
      )}
      onClick={onClick}
    >
      {image}
      {name}
      {hasNewModel && (
        <span className="absolute top-2 end-2 size-1.5 rounded-full bg-[#6AEBC3]" />
      )}
    </button>
  )
);

ModelTab.displayName = "ModelTab";

const DEFAULT_SEEN_MODELS: TTabs["seenModels"] = [];

const Tabs = ({
  activeIndex,
  models,
  seenModels = DEFAULT_SEEN_MODELS,
  onChange,
}: TTabs) => {
  const tabRefs = useRef<HTMLButtonElement[]>([]);
  const lineRef = useRef<HTMLDivElement | null>(null);

  const mapIconByProvider: Partial<Record<EAIProviderModel, string>> = {
    claude: "/icons/providers/claude.svg",
    deepseek: "/icons/providers/deepseek.svg",
    gemini: "/icons/providers/gemini.svg",
    grok: "/icons/providers/grok.svg",
    openai: "/icons/providers/openai.svg",
  };

  const updateLine = () => {
    const activeTab = tabRefs.current[activeIndex];

    if (activeTab && lineRef.current) {
      lineRef.current.style.left = `${activeTab.offsetLeft}px`;
      lineRef.current.style.width = `${activeTab.offsetWidth}px`;
    }
  };

  useEffect(() => {
    updateLine();
    window.addEventListener("resize", updateLine);
    return () => window.removeEventListener("resize", updateLine);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  return (
    <div className="relative flex">
      {models.map((model, index) => {
        const isActive = activeIndex === index;
        const hasNewModel = model.models?.some((item) => {
          if (item.badge?.text !== "New") {
            return false;
          }
          const isSeen = seenModels.some(
            (seenModel) =>
              seenModel.value === item.value &&
              seenModel.badge?.text === item.badge?.text
          );
          return !isSeen;
        });
        return (
          <ModelTab
            className="group"
            key={model.id}
            ref={(el) => {
              if (el) {
                tabRefs.current[index] = el;
              }
            }}
            name={model.title}
            isActive={isActive}
            hasNewModel={hasNewModel}
            image={
              <div className="relative">
                <SVGIcon
                  className={compositeStyles(
                    "group-hover:text-text-general-primary",
                    {
                      "text-text-general-primary": isActive,
                      "text-text-general-tertiary": !isActive,
                    }
                  )}
                  src={mapIconByProvider[model.value] ?? ""}
                  width={24}
                  height={24}
                />
              </div>
            }
            onClick={() => onChange(model.value)}
          />
        );
      })}
      {/* Line under the active tab */}
      <div
        ref={lineRef}
        className="bg-border-action-primary-default absolute bottom-0 h-[2px] transition-all duration-200"
      />
    </div>
  );
};

export default Tabs;
