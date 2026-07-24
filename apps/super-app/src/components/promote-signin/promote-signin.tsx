import React from "react";

import { Button } from "@/components/button-ds";
import { SvgIcon } from "@/components/svg-icon-ds";
import { cn } from "@/components/utils/cn";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  onSignIn?: () => void;
  onClose?: () => void;
  title: string;
  subTitle: string;
  signInText: string;
}

const PromoteSignin: React.FC<Props> = ({
  title,
  subTitle,
  signInText,
  className,
  onSignIn,
  onClose,
}) => (
  <div
    className={cn(
      "rounded-v1-large bg-v1-surface-hierarchy-toast py-v1-structural-content-normal pl-v1-structural-content-normal pr-v1-structural-section-standard relative flex items-center justify-between",
      className
    )}
  >
    <div className="px-v1-structural-content-tight gap-v1-optical-subtle flex flex-col">
      <div className="typo-v1-title-md-normal text-v1-text-hierarchy-primary">
        {title}
      </div>
      <p className="typo-v1-caption-mdhelper-text text-v1-text-hierarchy-tertiary">
        {subTitle}
      </p>
    </div>
    <div className="px-v1-structural-content-micro">
      <Button
        variant="default"
        size="xs"
        className="bg-v1-action-background-primary"
        onClick={onSignIn}
        style={{ minWidth: 73 }}
      >
        {signInText}
      </Button>
    </div>
    <div className="end-v1-structural-content-micro top-v1-structural-content-tight absolute">
      <Button.Micro onClick={onClose} type="utility">
        <SvgIcon
          className="dark:text-v1-action-icon-tertiary text-v1-action-background-secondary"
          name="x"
          size={16}
        />
      </Button.Micro>
    </div>
  </div>
);

export default PromoteSignin;
