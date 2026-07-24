import { SVGIcon } from "@/components/svg-icon";
import { compositeStyles } from "@/utils/commons/styles";

import type { TContextMenuItemProps } from "./types";

export default function ContextMenuItem(props: TContextMenuItemProps) {
  const { item, onClick, isHighlighted, tabIndex } = props;
  const { icon, title, badge, description } = item;

  const handleClickItem = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    onClick?.(item);
  };

  const handleKeyDownItem = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.(item);
    }
  };

  return (
    <div
      role="menuitem"
      tabIndex={tabIndex}
      className={compositeStyles(
        "p-small-1 gap-small-0.75 rounded-rounded hover:bg-surface-input-default flex cursor-pointer items-center",
        isHighlighted ? "bg-surface-input-default" : ""
      )}
      onClick={handleClickItem}
      onKeyDown={handleKeyDownItem}
    >
      <div className="p-small-1 bg-surface-general-primary rounded-soft inline-flex items-center justify-center">
        <SVGIcon
          src={icon}
          width={16}
          height={16}
          className="text-icon-general-primary"
        />
      </div>
      <div className="flex w-full flex-1 flex-col">
        <div className="gap-small-0.75 flex">
          <h1 className="text-footnoteM-neutral text-text-action-secondary-default">
            {title}
          </h1>
          {badge}
        </div>
        <p className="text-footnoteS-neutral text-text-action-tertiary-default">
          {description}
        </p>
      </div>
    </div>
  );
}
