"use client";

import { useToggle } from "@uidotdev/usehooks";
import { useTranslations } from "next-intl";

import { SVGIcon } from "@/components/svg-icon";
import type { ProductModel } from "@/core/models/product";
import { compositeStyles } from "@/utils/commons/styles";

import type { FloatingUpgradeProps } from "./types";

import styles from "./styles.module.scss";

const renderUpgradeNowSpan = (chunks: React.ReactNode) => (
  <span className="hidden md:inline-flex">{chunks}</span>
);

interface FloatingUpgradeBlockProps extends FloatingUpgradeProps {
  containerClassname?: string;
  hideCloseIcon?: boolean;
  title?: string;
  description?: string | React.ReactNode;
  product?: ProductModel;
}
function FloatingUpgradeBlock({
  containerClassname,
  hideCloseIcon,
  product,
  title,
  description,
  onUpgrade,
  onClose,
}: FloatingUpgradeBlockProps) {
  const [visible, setVisible] = useToggle(true);

  const mainLayoutT = useTranslations("mainLayout");
  const commonT = useTranslations("common");
  if (!visible) {
    return null;
  }

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <div
      className={compositeStyles(
        "rounded-rounded relative overflow-hidden dark:bg-transparent",
        styles["floating-upgrade-border"],
        containerClassname
      )}
    >
      <div
        className={compositeStyles(
          'floating-upgrade-bg py-small-1 pl-small-1 pr-small-1 md:pl-medium-2 md:pr-large-4 bg-vul-yellow-100 flex items-center justify-between dark:bg-transparent dark:bg-[url("/images/floating-upgrade-banner-bg.png")]',
          styles["floating-upgrade-bg"]
        )}
      >
        <div className="gap-small-0.5 flex flex-col">
          <div className="text-footnoteM-highlight text-text-general-secondary md:text-bodyS-highlight">
            {title || mainLayoutT("floatingUpgradeBlock.title")}
          </div>
          <p className="text-footnoteM-neutral text-text-general-secondary dark:text-text-general-tertiary">
            {description || mainLayoutT("floatingUpgradeBlock.description")}
          </p>
        </div>
        <div className="ps-small-1 pt-small-1 md:pt-small-0">
          <button
            type="button"
            className={compositeStyles(
              "rounded-rounded px-medium-1.5 py-small-0.5 text-footnoteM-highlight text-text-general-primary relative cursor-pointer",
              styles["floating-upgrade-button"]
            )}
            onClick={onUpgrade}
          >
            <div className="bg-vul-yellow-300 rounded-rounded absolute inset-0 block dark:hidden" />
            {/* GU-1573 */}
            <div className="text-footnoteM-highlight text-text-general-primary relative z-1 whitespace-nowrap">
              {mainLayoutT.rich("floatingUpgradeBlock.upgradeNow", {
                span: renderUpgradeNowSpan,
              })}
            </div>
            <div className="text-footnoteM-neutral text-text-general-tertiary relative z-1 whitespace-nowrap">
              <span className="hidden md:inline-flex">{commonT("only")}</span>{" "}
              {product?.pricePerWeek}/week
            </div>
          </button>
        </div>
      </div>
      {!hideCloseIcon && (
        <button
          type="button"
          onClick={handleClose}
          className="end-small-0.5 top-small-0.5 bg-icon-general-tertiary md:right-small-0.25 md:top-small-0.25 md:bg-surface-general-bright-overlay absolute flex size-[13px] cursor-pointer items-center justify-center rounded-full md:size-5"
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
  );
}

export default FloatingUpgradeBlock;
