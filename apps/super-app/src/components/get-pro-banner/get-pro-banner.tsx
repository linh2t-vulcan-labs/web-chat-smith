import Image from "next/image";
import React from "react";

import { Button } from "@/components/button-ds";

interface Props {
  price?: string;
  perWeekLabel?: string;
  upgradeText?: string;
  onUpgrade?: () => void;
}

const GetProBanner: React.FC<Props> = ({
  price,
  perWeekLabel,
  upgradeText,
  onUpgrade,
}) => (
  <div className="gap-v1-structural-section-compact flex w-full flex-col items-center">
    <div className="flex w-full items-center justify-between">
      <div className="gap-v1-structural-content-tight flex flex-col">
        <div className="text-v1-level-gold-text typo-v1-heading-h4 flex flex-col">
          Chat Smith PRO
        </div>
        {/* GU-1573 */}
        <div className="gap-v1-structural-content-micro flex items-center">
          <span className="typo-v1-heading-h4 text-v1-text-hierarchy-inverse dark:text-v1-text-hierarchy-primary">
            {price || ""}
          </span>
          <span className="typo-v1-title-md-light text-v1-text-hierarchy-inverse dark:text-v1-text-hierarchy-primary">
            {perWeekLabel}
          </span>
        </div>
      </div>
      <Image src="/icons-v2/pro-icon.svg" width={60} height={60} alt="Gold" />
    </div>

    <Button
      variant="gold"
      className="rounded-circle w-full"
      onClick={onUpgrade}
    >
      {upgradeText}
    </Button>
  </div>
);

export default GetProBanner;
