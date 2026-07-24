"use client";

import { useToggle } from "@uidotdev/usehooks";
import { useTranslations } from "next-intl";

import { SVGIcon } from "@/components/svg-icon";
import { useGlobalState } from "@/store/global/hooks";
import { compositeStyles } from "@/utils/commons/styles";

import type { FloatingUpgradeProps } from "./types";

import styles from "./styles.module.scss";

interface FloatingUpgradeBannerProps extends FloatingUpgradeProps {
  containerClassname?: string;
  hideCloseIcon?: boolean;
  fixedTop?: boolean;
  shouldHidden?: boolean;
}

function FloatingUpgradeBanner({
  onUpgrade,
  onClose,
  containerClassname,
  hideCloseIcon,
  fixedTop,
  shouldHidden,
}: FloatingUpgradeBannerProps) {
  const [visible, setVisible] = useToggle(true);
  const isExpanded = useGlobalState((state) => state.isOpenSidebar);

  const mainLayoutT = useTranslations("mainLayout");
  const commonT = useTranslations("common");

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible) {
    return null;
  }
  const compositeLeftClassname = isExpanded
    ? "left-[calc(50%+152px)] rtl:left-[calc(50%-152px)]"
    : "left-1/2 rtl:left-1/2";
  return (
    <div
      className={compositeStyles(
        "rounded-rounded w-max overflow-hidden transition-[left] duration-200 ease-in-out",
        containerClassname,
        fixedTop &&
          `bottom-medium-1.5 md:top-medium-1.5 fixed top-auto z-50 -translate-x-1/2 md:bottom-auto ${compositeLeftClassname} hidden md:block`,
        shouldHidden && "hidden"
      )}
    >
      <div
        className={compositeStyles(
          "gap-medium-2 pl-medium-2 pr-large-4 relative flex items-center justify-between py-2",
          styles["floating-upgrade-bg"]
        )}
      >
        <span className="text-footnoteM-neutral text-text-general-secondary">
          {mainLayoutT("floatingUpgradeBanner.content")}
        </span>
        <button
          type="button"
          className={compositeStyles(
            "rounded-rounded px-medium-1.5 py-small-0.5 text-footnoteM-highlight text-text-general-primary",
            styles["floating-upgrade-button"]
          )}
          onClick={onUpgrade}
        >
          {commonT("upgrade")}
        </button>
        {!hideCloseIcon && (
          <button
            type="button"
            onClick={handleClose}
            className="end-small-0.5 top-small-0.5 bg-icon-general-tertiary md:right-small-0.25 md:top-small-0.25 md:bg-surface-general-bright-overlay absolute flex size-[13px] items-center justify-center rounded-full md:size-5"
          >
            <SVGIcon
              src="/icons/outlined/closed-v3.svg"
              className="text-icon-general-inverse md:text-icon-general-primary"
              width={7.1}
              height={7.1}
            />
          </button>
        )}
      </div>
    </div>
  );
}

export default FloatingUpgradeBanner;
