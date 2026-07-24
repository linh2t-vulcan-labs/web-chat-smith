import type { ReactNode } from "react";
import React from "react";

import { Badge } from "@/components/badge-ds";
import type { IBadgeLevelProps } from "@/components/badge-ds";
import { SvgIcon } from "@/components/svg-icon-ds";

interface Props {
  isExpired?: boolean;
  isPremium?: boolean;
  size: IBadgeLevelProps["size"];
  children?: ReactNode;
}

const AccountStatusBadge: React.FC<Props> = ({
  size,
  isPremium,
  isExpired,
  children,
}) => {
  let badgeColor: "gold" | "hierarchy-high" | "hierarchy";
  if (isPremium) {
    badgeColor = "gold";
  } else if (isExpired) {
    badgeColor = "hierarchy-high";
  } else {
    badgeColor = "hierarchy";
  }
  return (
    <Badge.Level size={size} color={badgeColor}>
      {isPremium && <SvgIcon name="gold" size={12} className="shrink-0" />}
      {children}
    </Badge.Level>
  );
};

export default AccountStatusBadge;
