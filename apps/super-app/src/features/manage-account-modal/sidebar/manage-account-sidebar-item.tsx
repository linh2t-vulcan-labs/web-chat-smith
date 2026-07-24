import { compositeStyles } from "@/utils/commons/styles";

import type { TManageAccountSidebarItemProps } from "./types";

export default function ManageAccountSidebarItem(
  props: TManageAccountSidebarItemProps
) {
  const { title, icon, isActive, onClick, isDesktop = true } = props;

  if (isDesktop) {
    return (
      <button
        type="button"
        className={compositeStyles(
          "gap-v1-structural-content-micro rounded-v1-standard px-v1-structural-content-relaxed py-v1-structural-content-tight flex w-full items-center justify-start text-left outline-hidden transition-all duration-150 ease-in-out",
          "text-v1-text-hierarchy-primary",
          isActive
            ? "bg-v1-surface-overlay-interactive-selected"
            : "hover:bg-v1-surface-overlay-interactive-hover hover:text-v1-text-hierarchy-primary"
        )}
        onClick={onClick}
      >
        {icon}
        <p className="typo-v1-title-md-light px-v1-structural-content-micro line-clamp-1">
          {title}
        </p>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={compositeStyles(
        "gap-small-1 rounded-rounded thickness-thin border-border-inputControls-neutral-default px-v1-structural-content-relaxed py-v1-structural-content-tight flex w-full items-center justify-start text-left outline-hidden transition-all duration-150 ease-in-out",
        isActive
          ? "bg-v1-surface-overlay-interactive-selected text-v1-text-hierarchy-primary"
          : "text-text-inputControl-neutral-default"
      )}
      onClick={onClick}
    >
      {icon}
      <p className="typo-v1-title-md-light text-nowrap">{title}</p>
    </button>
  );
}
