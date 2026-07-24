import { AssistantIcon } from "@/components/assistant-icon";
import { Button } from "@/components/button";
import { SVGIcon } from "@/components/svg-icon";
import type { TAssistantType } from "@/core/models/assistant";

interface TAssistantCardProps {
  name: TAssistantType;
  title: string;
  description: string;
  onClick: () => void;
}

export default function AssistantCard({
  name,
  title,
  description,
  onClick,
}: TAssistantCardProps) {
  return (
    <div className="px-medium-2 py-small-1 rounded-pill-soft bg-surface-general-modal2 gap-medium-1.5 flex items-center">
      <AssistantIcon name={name} size="large" />

      <div className="gap-small-0.5 flex flex-1 flex-col">
        <h4 className="text-bodyM-highlight text-text-general-primary line-clamp-1">
          {title}
        </h4>
        <p className="text-footnoteM-neutral text-text-general-secondary line-clamp-1">
          {description}
        </p>
      </div>
      <Button
        rounded="default"
        color="tertiary"
        size="baseIcon"
        startIcon={
          <SVGIcon
            src="/icons/triangle-right.svg"
            className="text-text-general-primary"
            width={24}
            height={24}
          />
        }
        onClick={onClick}
      />
    </div>
  );
}
