import { SVGIcon } from "@/components/svg-icon";
import { cn } from "@/components/utils/cn";
import { Link } from "@/i18n/navigation";

import type { THelpCenterItemProps } from "./types";

export default function HelpCenterItem(props: THelpCenterItemProps) {
  const {
    title,
    description,
    icon = "/icons/outlined/info-v2.svg",
    enabled,
    link,
    onClick,
  } = props;

  if (!enabled) {
    return null;
  }

  const handleClick = () => {
    // Call onClick for tracking if provided
    if (onClick) {
      onClick();
    }
  };

  const content = (
    <>
      <div className="flex h-auto w-fit items-center justify-center md:h-full md:w-full md:justify-start">
        <div className="rounded-v1-standard bg-v1-surface-glass-dark-breath p-v1-optical-strong m-v1-optical-n2 flex max-h-[44px] max-w-[44px] items-center justify-center">
          {typeof icon === "string" ? (
            <SVGIcon
              src={icon}
              width={24}
              height={24}
              className="text-text-general-primary dark:text-v1-neutral-200"
            />
          ) : (
            icon
          )}
        </div>
      </div>
      <div className="gap-v1-optical-subtle px-v1-optical-subtle flex flex-col">
        <h3 className="typo-v1-title-md-normal text-v1-text-hierarchy-primary line-clamp-1">
          {title}
        </h3>
        <p className="typo-v1-support-secondary-normal text-v1-text-hierarchy-tertiary md:line-clamp-2">
          {description}
        </p>
      </div>
    </>
  );

  const className = cn(
    "flex w-full cursor-pointer gap-v1-structural-content-relaxed rounded-rounded thickness-thin border-v1-border-structural-default p-v1-structural-content-relaxed hover:bg-surface-input-hover",
    "flex-col"
  );

  // If link prop is provided, use Link component with target="_blank"
  if (link) {
    return (
      <Link
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={handleClick}
      >
        {content}
      </Link>
    );
  }

  // Otherwise, use button element for better accessibility
  return (
    <button type="button" className={className} onClick={handleClick}>
      {content}
    </button>
  );
}
