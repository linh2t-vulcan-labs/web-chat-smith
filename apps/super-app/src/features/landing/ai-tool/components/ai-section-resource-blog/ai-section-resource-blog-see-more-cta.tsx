"use client";
"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { useFeaturePageTracking } from "../../tracking/use-feature-page-tracking";

interface Props {
  href: string;
  className?: string;
  ariaLabel: string;
  label: string;
  ctaLabelClassName?: string;
  ctaIconClassName?: string;
}

export function AISectionResourceBlogSeeMoreCta({
  href,
  className,
  ariaLabel,
  label,
  ctaLabelClassName,
  ctaIconClassName,
}: Props) {
  const { trackAccessBlog } = useFeaturePageTracking();

  return (
    <Link
      href={href as Route}
      className={className}
      aria-label={ariaLabel}
      onClick={() => trackAccessBlog()}
    >
      <span className={ctaLabelClassName}>{label}</span>
      <Image
        src="/icons/send.svg"
        alt=""
        width={24}
        height={24}
        className={ctaIconClassName}
      />
    </Link>
  );
}
