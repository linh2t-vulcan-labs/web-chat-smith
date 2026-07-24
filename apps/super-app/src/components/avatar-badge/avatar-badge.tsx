"use client";

import * as React from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/avatar-primitive";
import { cn } from "@/components/utils/cn";
import { AVATAR_DEFAULT_URL } from "@/config/urls";

export type AvatarBadgeSize = "medium" | "large" | "xlarge";

export interface AvatarBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  avatarUrl?: string;
  isExpired?: boolean;
  isPremium?: boolean;
  /** `medium` = 40px, `large` = 48px inner avatar. Default `medium`. */
  size?: AvatarBadgeSize;
  className?: string;
}

type BorderVariant = "premium" | "free" | "expired";

function resolveVariant(
  isPremium: boolean | undefined,
  isExpired: boolean | undefined
): BorderVariant {
  if (isPremium) {
    return "premium";
  }
  if (isExpired) {
    return "expired";
  }
  return "free";
}

const VARIANT_RING: Record<BorderVariant, { inner: string }> = {
  expired: {
    inner:
      "bg-v1-surface-glass-light-mist ring-1 ring-v1-border-structural-strong",
  },
  free: {
    inner:
      "bg-v1-surface-glass-light-mist ring-1 ring-v1-border-structural-strong",
  },
  premium: {
    inner: "bg-v1-level-gold-background ring-1 ring-v1-level-gold-border",
  },
};

const SIZE_LAYOUT: Record<
  AvatarBadgeSize,
  { avatar: string; innerPad: string; extendHeight?: string }
> = {
  large: {
    avatar: "size-10",
    extendHeight: "h-12",
    innerPad: "p-v1-structural-content-micro",
  },
  medium: {
    avatar: "size-8",
    innerPad: "p-v1-structural-content-micro",
  },
  xlarge: {
    avatar: "size-12",
    innerPad: "p-v1-structural-content-micro",
  },
};

const AvatarBadge = React.forwardRef<HTMLDivElement, AvatarBadgeProps>(
  (
    { className, avatarUrl, isExpired, isPremium, size = "medium", ...props },
    ref
  ) => {
    const variant = resolveVariant(isPremium, isExpired);
    const ring = VARIANT_RING[variant];
    const layout = SIZE_LAYOUT[size];

    return (
      <div
        ref={ref}
        className={cn("inline-flex rounded-full", className)}
        {...props}
      >
        <div
          className={cn(
            "overflow-hidden rounded-full",
            layout.innerPad,
            ring.inner,
            layout?.extendHeight
          )}
        >
          <Avatar className={layout.avatar}>
            <AvatarImage
              src={avatarUrl || AVATAR_DEFAULT_URL}
              alt="User avatar"
              referrerPolicy="no-referrer"
            />
            <AvatarFallback className="typo-v1-support-micro" />
          </Avatar>
        </div>
      </div>
    );
  }
);

AvatarBadge.displayName = "AvatarBadge";

export default AvatarBadge;
