import styles from "../pricing-content/styles.module.css";

const SKELETON_COUNT = 2;

function PriceCardSkeleton() {
  return (
    <div className={styles.priceCardSkeleton}>
      <div className={styles.priceCardSkeletonInner}>
        <span className={styles.priceCardSkeletonRadio} />
        <span className={styles.priceCardSkeletonBody}>
          <span className={styles.priceCardSkeletonLeft}>
            <span
              className={`${styles.priceCardSkeletonLine} ${styles.priceCardSkeletonLineLg}`}
            />
            <span
              className={`${styles.priceCardSkeletonLine} ${styles.priceCardSkeletonLineSm}`}
            />
          </span>
          <span className={styles.priceCardSkeletonRight}>
            <span
              className={`${styles.priceCardSkeletonLine} ${styles.priceCardSkeletonLineMd}`}
            />
            <span
              className={`${styles.priceCardSkeletonLine} ${styles.priceCardSkeletonLineXs}`}
            />
          </span>
        </span>
      </div>
    </div>
  );
}

export default function PricingPriceCardsSkeleton() {
  return (
    <div className={styles.priceCards} aria-hidden>
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <PriceCardSkeleton key={`plan-skeleton-${index}`} />
      ))}
    </div>
  );
}
