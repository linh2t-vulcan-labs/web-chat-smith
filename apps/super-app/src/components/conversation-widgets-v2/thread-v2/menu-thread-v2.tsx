"use client";

import { useTranslations } from "next-intl";

import { Icon } from "@/components/icon";
import { Menu } from "@/components/menu";
import type { TMenuProps } from "@/components/menu/types";
import { compositeStyles } from "@/utils/commons/styles";

import type { TMenuThread } from "./types";

export default function MenuThreadV2({
  id,
  className = "",
  onRemove,
  onEdit,
  onClick: onClickTrigger,
  triggerRef,
}: TMenuThread) {
  const t = useTranslations("common.cta");

  const menuItems: TMenuProps["items"] = [
    {
      icon: <Icon name="edit" size={18} />,
      key: "rename",
      label: t("rename"),
      onClick: (e) => {
        e.stopPropagation();
        onEdit(e);
      },
    },
    {
      icon: <Icon name="delete" size={18} />,
      key: "delete",
      label: <span className="text-text-system-error">{t("delete")}</span>,
      onClick: (e) => {
        e.stopPropagation();
        onRemove(id);
      },
    },
  ];

  return (
    <Menu
      triggerRef={triggerRef}
      triggerNode={
        <Icon
          name="more"
          size={18}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        />
      }
      onClickTrigger={onClickTrigger}
      items={menuItems}
      className={compositeStyles(className)}
      contentClassName={compositeStyles("z-99 md:w-[145px]")}
    />
  );
}
