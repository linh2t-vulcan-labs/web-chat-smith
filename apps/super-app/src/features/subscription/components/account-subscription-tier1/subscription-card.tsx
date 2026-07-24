import type { PropsWithChildren } from "react";
import React from "react";

import { Divider } from "@/components/divider";
import { compositeStyles } from "@/utils/commons/styles";

import type { TSubscriptionPlanProps } from "../../types/common";

import styles from "@/features/subscription/styles/styles.module.scss";

const SubscriptionCard: React.FC<
  PropsWithChildren<TSubscriptionPlanProps> &
    React.HTMLAttributes<HTMLDivElement>
> = ({
  children,
  packageName,
  subtitle,
  className,
  innerClassName,
  headerClassName,
  color = "default",
}) => (
  <div
    className={compositeStyles(
      "rounded-pill border-border-general-primary border",
      className,
      color === "default"
        ? styles["subscription-border-default"]
        : styles["subscription-border-primary"]
    )}
  >
    <div
      className={compositeStyles(
        "gap-medium-2 p-medium-3 flex h-full flex-col",
        innerClassName,
        color === "default"
          ? styles["subscription-bg-default"]
          : styles["subscription-bg-primary"]
      )}
    >
      <div
        className={compositeStyles(
          "gap-medium-2 flex flex-col",
          headerClassName
        )}
      >
        <div className="gap-medium-2 flex items-center">
          <span className="text-display-medium text-text-general-secondary">
            {packageName}
          </span>
          {subtitle && (
            <span className="text-bodyM-neutral text-text-general-quaternary capitalize">
              {subtitle}
            </span>
          )}
        </div>
        <Divider
          direction="horizontal"
          className="border-border-general-primary!"
        />
      </div>
      <div>{children}</div>
    </div>
  </div>
);

export default SubscriptionCard;
