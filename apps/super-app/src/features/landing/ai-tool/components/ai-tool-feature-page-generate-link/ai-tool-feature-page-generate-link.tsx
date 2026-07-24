"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import { Link } from "@/i18n/navigation";
import type { TFeaturePageSection } from "@/libs/tracking-event/types";

import { useFeaturePageTracking } from "../../tracking/use-feature-page-tracking";

interface Props {
  href: string;
  section: TFeaturePageSection;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}

export function AIToolFeaturePageGenerateLink({
  href,
  section,
  className,
  ariaLabel,
  children,
}: Props) {
  const { trackClickGenerate } = useFeaturePageTracking();

  return (
    <Link
      className={className}
      href={href}
      aria-label={ariaLabel}
      onClick={() => trackClickGenerate(section)}
    >
      {children}
    </Link>
  );
}

interface CtaIconProps {
  className?: string;
}

export function AIToolFeaturePageGenerateCtaIcon({ className }: CtaIconProps) {
  return (
    <span className={className} aria-hidden>
      <Image src="/icons/send.svg" alt="" width={24} height={24} />
    </span>
  );
}
