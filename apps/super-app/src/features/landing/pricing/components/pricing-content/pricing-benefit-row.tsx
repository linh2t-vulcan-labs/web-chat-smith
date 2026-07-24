import { PRICING_ICONS } from "./pricing-benefits";
import type {
  PricingBenefitFreeStatus,
  PricingBenefitRow as PricingBenefitRowConfig,
} from "./pricing-benefits";

import styles from "./styles.module.css";

function FreeStatusCell({
  status,
  limitedLabel,
}: {
  status: PricingBenefitFreeStatus;
  limitedLabel: string;
}) {
  if (status === "limitedLabel") {
    return <span className={styles.colStatusLimited}>{limitedLabel}</span>;
  }

  const Icon = PRICING_ICONS.checked;
  return (
    <Icon className={styles.colStatusIcon} width={32} height={32} aria-hidden />
  );
}

function ProStatusCell() {
  const Icon = PRICING_ICONS.checked;
  return (
    <Icon className={styles.colStatusIcon} width={32} height={32} aria-hidden />
  );
}

export interface PricingBenefitRowProps {
  row: PricingBenefitRowConfig;
  title: string;
  description: string;
  limitedLabel: string;
}

export default function PricingBenefitRow({
  row,
  title,
  description,
  limitedLabel,
}: PricingBenefitRowProps) {
  const BenefitIcon = row.icon;

  return (
    <li className={styles.benefitRow}>
      <div className={styles.benefitRowMain}>
        <BenefitIcon
          className={styles.benefitRowIcon}
          width={32}
          height={32}
          aria-hidden
        />
        <p className={styles.benefitCopy}>
          <span className={styles.benefitTitle}>{title}</span>
          <span className={styles.benefitDesc}>{description}</span>
        </p>
      </div>
      <div className={styles.benefitRowStatus}>
        <div className={styles.benefitStatusCell}>
          <FreeStatusCell status={row.free} limitedLabel={limitedLabel} />
        </div>
        <div className={styles.benefitStatusCell}>
          <ProStatusCell />
        </div>
      </div>
    </li>
  );
}
