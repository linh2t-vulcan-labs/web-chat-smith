"use client";

import type { ComponentProps, MouseEvent } from "react";

import PlusIcon from "@/features/suite/assets/icons/navigations/plus-icon.svg";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";
import { Link } from "@/i18n/navigation";

type CreateProjectCardProps = Readonly<{
  href?: ComponentProps<typeof Link>["href"];
  onClick?: () => void;
}>;

export function CreateProjectCard({
  href = "#",
  onClick,
}: CreateProjectCardProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (href === "#") {
      event.preventDefault();
    }

    if (!onClick) {
      return;
    }

    onClick();
  };

  return (
    <Link
      href={href}
      data-testid={DATA_TEST_ID.suite.home.createProjectCard}
      onClick={handleClick}
      className="rounded-v1-large p-v1-structural-content-micro hover:bg-v1-surface-overlay-interactive-hover flex min-w-0 flex-1 flex-col overflow-hidden transition-colors"
    >
      <div className="rounded-v1-medium bg-v1-surface-glass-dark-breath flex aspect-278/156 shrink-0 items-center justify-center self-stretch overflow-hidden">
        <PlusIcon
          className="text-v1-text-hierarchy-primary size-v1-9"
          aria-hidden
        />
      </div>

      <div className="gap-v1-structural-content-micro px-v1-structural-component-medium py-v1-structural-component-small flex flex-col self-stretch">
        <p className="typo-v1-title-md-normal text-v1-text-hierarchy-primary self-stretch truncate text-start font-medium">
          Create New Project
        </p>
      </div>
    </Link>
  );
}
