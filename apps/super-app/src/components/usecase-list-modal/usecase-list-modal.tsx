import { Tabs } from "radix-ui";
import React, { useEffect, useState } from "react";

import { TaskModal } from "@/components/modal";
import { SVGIcon } from "@/components/svg-icon";
import { TaskCard } from "@/components/task-card";
import {
  INTEREST_BUTTON_OPTIONS,
  INTEREST_CATEGORY_OPTIONS,
} from "@/config/options";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";
import { compositeStyles } from "@/utils/commons/styles";

import type { TUseCaseListModalProps } from "./types";

function UseCaseListModal({
  open,
  defaultTab,
  onSelect,
  onClose,
}: TUseCaseListModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultTab);
  const user = useGlobalState((state) => state.user);
  const { sendTrackingEvent } = useSendTrackingEvent();

  // Handle select category
  const handleOnSelectCategory = (category: string) => {
    setSelectedCategory(category);
    // Tracking UseCaseView
    sendTrackingEvent({
      name: EventKeys.UseCaseView,
      payload: {
        sub_task: "",
        task: category,
        vulcan_user_id: user.id,
      },
    });
  };

  // Handle select sub-category
  const handleOnSelect = (value: string) => {
    onSelect(value);
    // Tracking UseCaseView
    sendTrackingEvent({
      name: EventKeys.UseCaseView,
      payload: {
        sub_task: value,
        task: selectedCategory,
        vulcan_user_id: user.id,
      },
    });
  };

  // Ensure selectedCategory is updated when defaultTab changes
  useEffect(() => {
    // oxlint-disable-next-line react/react-compiler -- resyncs local selectedCategory when the defaultTab prop changes; this mirrors a derived-state-from-props pattern that would need a broader controlled/uncontrolled refactor to make compiler-safe
    setSelectedCategory(defaultTab);
  }, [defaultTab]);

  return (
    <TaskModal title="Tasks for AI" open={open} onClose={onClose}>
      <Tabs.Root
        className="h-full md:flex md:h-auto"
        defaultValue={selectedCategory}
      >
        <Tabs.List className="no-scrollbar gap-small-1 px-medium-2 py-small-1 flex overflow-x-auto whitespace-nowrap md:min-w-[240px] md:flex-col md:overflow-x-visible">
          {INTEREST_BUTTON_OPTIONS.map((category) => (
            <Tabs.Trigger
              key={category.value}
              value={category.value}
              onClick={() => handleOnSelectCategory(category.value)}
              className={compositeStyles(
                "gap-small-1 rounded-rounded px-medium-2 py-small-1 text-bodyS-neutral text-text-inputControl-neutral-default outline-border-inputControls-neutral-default data-[state=active]:bg-surface-inputControl-highlight-hover data-[state=active]:px-medium-2.5 data-[state=active]:text-text-inputControl-inverse-default md:px-large-4 md:px-medium-2.5 md:py-medium-1.5 inline-flex items-center text-left outline-1 transition-[padding] duration-300 ease-out outline-solid data-[state=active]:outline-hidden md:outline-hidden"
              )}
            >
              <SVGIcon src={category.icon} width={16} height={16} />
              {category.name}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {Object.entries(INTEREST_CATEGORY_OPTIONS).map(([key, tasks]) => (
          <Tabs.Content
            className="all-unset gap-small-1 data-[state=active]:px-medium-2 data-[state=active]:pb-medium-1.5 grid grid-cols-1 data-[state=active]:size-full data-[state=active]:h-[calc(100%-60px)] data-[state=active]:auto-rows-min data-[state=active]:overflow-y-auto md:data-[state=active]:h-[380px] md:data-[state=active]:grid-cols-3 md:data-[state=active]:pl-0"
            key={key}
            value={key}
          >
            {tasks.map((task, idx) => (
              <TaskCard
                key={`task-${idx.toString()}`}
                title={task.title}
                description={task.desc}
                icon={<SVGIcon src={task.icon} width={24} height={24} />}
                onClick={() => handleOnSelect(task.value)}
              />
            ))}
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </TaskModal>
  );
}

export default UseCaseListModal;
