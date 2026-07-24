"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/button-ds";
import { SvgIcon } from "@/components/svg-icon-ds";

/**
 * The gold "Get Pro" button shared by the guest and authenticated top navbars.
 * The two navbars diverge elsewhere (feature-gating vs subscription hooks,
 * notification badge, promote-sign-in banner), but this button was byte-identical
 * except for its click handler — extracted here so its styling/icon/label stay
 * in one place. Each navbar passes its own `onClick`.
 */
export function NavUpgradeButton({ onClick }: { onClick: () => void }) {
  const t = useTranslations("common");

  return (
    <Button
      className="text-v1-action-icon-gold w-max"
      iconOnly
      onClick={onClick}
      prefixIcon={<SvgIcon name="gold" size={20} />}
      size="m"
      variant="gold"
    >
      {t("getProV2")}
    </Button>
  );
}
