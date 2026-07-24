import React from "react";

import { compositeStyles } from "@/utils/commons/styles";

interface TTaskCardProps {
  className?: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

function TaskCard({
  className = "",
  title,
  description,
  icon,
  onClick,
}: TTaskCardProps) {
  return (
    <button
      className={compositeStyles(
        "rounded-default p-medium-1.5 md:px-medium-2 gap-medium-1.5 md:gap-small-1 md:py-medium-1.5 bg-surface-input-hover dark:bg-surface-general-soft hover:bg-surface-general-soft dark:hover:bg-surface-input-hover flex hover:cursor-pointer md:flex-col",
        className
      )}
      onClick={onClick}
      type="button"
    >
      <span className="bg-icon-general-inverse rounded-rounded flex size-[44px] items-center justify-center">
        {icon}
      </span>
      <div className="gap-small-0.5 flex flex-col">
        <h3 className="text-text-general-secondary text-bodyS-highlight line-clamp-1">
          {title}
        </h3>
        <p className="text-footnoteM-neutral text-text-general-tertiary line-clamp-2">
          {description}
        </p>
      </div>
    </button>
  );
}

export default TaskCard;
