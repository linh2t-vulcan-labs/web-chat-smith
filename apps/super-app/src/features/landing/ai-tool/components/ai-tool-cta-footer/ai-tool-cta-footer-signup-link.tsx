"use client";

import Image from "next/image";

import { Link } from "@/i18n/navigation";

import { useFeaturePageTracking } from "../../tracking/use-feature-page-tracking";

interface Props {
  href: string;
  className?: string;
  ariaLabel: string;
  label: string;
  ctaLabelClassName?: string;
  ctaIconClassName?: string;
  trackingPage?: "ai-tool" | "pricing";
}

export function AIToolCTAFooterSignupLink({
  href,
  className,
  ariaLabel,
  label,
  ctaLabelClassName,
  ctaIconClassName,
  trackingPage = "ai-tool",
}: Props) {
  const { trackClickSignup, trackPricingClickSignup } =
    useFeaturePageTracking();

  return (
    <Link
      className={className}
      href={href}
      aria-label={ariaLabel}
      onClick={() => {
        if (trackingPage === "pricing") {
          trackPricingClickSignup();
          return;
        }
        trackClickSignup();
      }}
    >
      <span className={ctaLabelClassName}>{label}</span>
      <span className={ctaIconClassName} aria-hidden>
        <Image src="/icons/send.svg" alt="" width={24} height={24} />
      </span>
    </Link>
  );
}
