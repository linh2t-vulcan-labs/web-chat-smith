import type { ReactNode } from "react";

import { Button } from "@/components/button-ds";
import { SvgIcon } from "@/components/svg-icon-ds";
import { cn } from "@/components/utils/cn";

interface TModalHeaderProps {
  title?: ReactNode;
  onClose?: () => void;
  /** Override the outer sticky container */
  className?: string;
  /** Override the inner content wrapper (row with title + close icon) */
  contentClassName?: string;
}

export function ModalHeader(props: Readonly<TModalHeaderProps>) {
  const { title, onClose, className, contentClassName } = props;

  return (
    <div
      className={cn(
        "rounded-v1-tl-default rounded-v1-tr-default px-v1-structural-section-compact pt-v1-structural-component-medium pb-v1-structural-content-relaxed sticky top-0 z-20 w-full",
        className
      )}
    >
      <div
        className={cn(
          "flex h-full w-full items-center justify-between",
          contentClassName
        )}
      >
        {title && (
          <h1 className="typo-v1-heading-h3 text-v1-text-hierarchy-primary w-full">
            {title}
          </h1>
        )}
        {onClose && (
          <Button
            variant="utility"
            size="xl"
            iconOnly
            prefixIcon={<SvgIcon name="x" size={24} />}
            className="before:hidden"
            onClick={onClose}
          />
        )}
      </div>
    </div>
  );
}
