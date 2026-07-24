import { Exclude, Expose, Type } from "@/libs/class-transformer";
import type { EDURATION_UNIT, EUSER_ROLE } from "@/utils/commons/enums";
import {
  ESUBSCRIPTION_SOURCE,
  ESUBSCRIPTION_STATUS,
} from "@/utils/commons/enums";
import { mappingPackageSubscriptionDurationUnit } from "@/utils/mappers/product";
import {
  checkSubscriptionPassedExpireGracePeriod,
  checkSubscriptionPassedGracePeriod,
  filterSubscriptionsByMobileSource,
  filterSubscriptionsByWebSource,
  findCancelledPremiumPackage,
  findCurrentSubscriptionInfo,
  hasActiveSubscription,
  hasPremiumRole,
  hasValidSubscriptionItems,
  isMobileSubscriptionSource,
  isSubscriptionNotExpired,
  isWebSubscriptionSource,
} from "@/utils/mappers/subscription";

import type { TDurationUnitLabel } from "./product";

@Exclude()
class SubscriptionMetaDataModel {
  @Expose({ name: "subscription_id" })
  subscriptionId!: string;
}

@Exclude()
export class SubscriptionItemModel {
  @Expose()
  id!: string;

  @Expose({ name: "user_id" })
  userId!: string;

  @Expose({ name: "app_id" })
  appId!: string;

  @Expose()
  role!: EUSER_ROLE;

  @Expose({ name: "subscription_source" })
  subscriptionSource!: ESUBSCRIPTION_SOURCE;

  @Expose()
  status!: ESUBSCRIPTION_STATUS;

  @Expose({ name: "duration_unit" })
  durationUnit!: EDURATION_UNIT;

  @Expose()
  get durationUnitLabel(): TDurationUnitLabel {
    return mappingPackageSubscriptionDurationUnit(this.durationUnit);
  }

  @Expose({ name: "duration_value" })
  durationValue!: number;

  @Expose({ name: "expired_at" })
  expiredAt!: string;

  @Expose({ name: "grace_period_start_at" })
  gracePeriodStartAt!: string;

  @Expose({ name: "grace_period_end_at" })
  gracePeriodEndAt!: string;

  @Expose({ name: "created_at" })
  createdAt!: string;

  @Expose({ name: "updated_at" })
  updatedAt!: string;

  @Expose()
  @Type(() => SubscriptionMetaDataModel)
  metadata?: SubscriptionMetaDataModel;
}

@Exclude()
export class SubscriptionModel {
  @Expose()
  @Type(() => SubscriptionItemModel)
  items!: SubscriptionItemModel[];

  @Expose()
  get isExistUserSubscription(): boolean {
    return hasValidSubscriptionItems(this.items);
  }

  @Expose()
  get isValidPremiumUser(): boolean {
    if (!hasValidSubscriptionItems(this.items)) {
      return false;
    }

    // Check if user has active premium role
    if (hasPremiumRole(this.items)) {
      return true;
    }

    // Check if cancelled premium package is still valid (not expired)
    const cancelledPremiumPackage = findCancelledPremiumPackage(this.items);
    if (cancelledPremiumPackage) {
      return isSubscriptionNotExpired(cancelledPremiumPackage.expiredAt);
    }

    return false;
  }

  get isExpired(): boolean {
    if (!hasValidSubscriptionItems(this.items)) {
      return false;
    }

    // Use the original logic: isExpired = !this.isValidPremiumUser
    const isNotValidPremiumUser = !this.isValidPremiumUser;

    // If user is still valid premium, not expired
    if (!isNotValidPremiumUser) {
      return false;
    }

    const hasPassedGracePeriod = checkSubscriptionPassedGracePeriod(
      this.items,
      isNotValidPremiumUser
    );
    // If grace period has passed, return false (not expired anymore)
    if (hasPassedGracePeriod) {
      return false;
    }

    // Otherwise, return the original logic
    return isNotValidPremiumUser;
  }

  get trialExists(): boolean {
    if (!this.items) {
      return false;
    }

    if (!this.items.length) {
      return false;
    }

    const isNotValidPremiumUser = !this.isValidPremiumUser;

    const hasTrialSubscription = this.items.find((item) =>
      item.metadata?.subscriptionId?.includes("trial")
    );
    return isNotValidPremiumUser && Boolean(hasTrialSubscription);
  }

  get existingTrialActive(): boolean {
    const trialSubscription = this.items.find((item) =>
      item.metadata?.subscriptionId?.includes("trial")
    );
    return (
      Boolean(trialSubscription) &&
      trialSubscription?.status === ESUBSCRIPTION_STATUS.ACTIVE
    );
  }

  @Expose()
  get currentSubscriptionInfo(): SubscriptionItemModel | null {
    if (!hasValidSubscriptionItems(this.items)) {
      return null;
    }

    return findCurrentSubscriptionInfo(this.items);
  }

  @Expose()
  get listSubscriptionFromMobile(): SubscriptionItemModel[] {
    return filterSubscriptionsByMobileSource(this.items);
  }

  @Expose()
  get listSubscriptionFromWeb(): SubscriptionItemModel[] {
    return filterSubscriptionsByWebSource(this.items);
  }

  @Expose()
  get isExistActiveSubscriptionFromMobile(): boolean {
    return hasActiveSubscription(this.items, isMobileSubscriptionSource);
  }

  @Expose()
  get isExistActiveSubscriptionFromWeb(): boolean {
    return hasActiveSubscription(this.items, isWebSubscriptionSource);
  }

  @Expose()
  get isCurrentSubscriptionFromMobile(): boolean {
    const isOnlyOneItem = this.items.length === 1;
    if (!isOnlyOneItem) {
      return false;
    }
    const [currentSubscriptionInfo] = this.items;
    return isMobileSubscriptionSource(
      currentSubscriptionInfo?.subscriptionSource as ESUBSCRIPTION_SOURCE
    );
  }

  get isExistSubscriptionFromWeb(): boolean {
    if (!this.isExistUserSubscription) {
      return false;
    }

    return this.items.some(
      (item) => item.subscriptionSource === ESUBSCRIPTION_SOURCE.WEB
    );
  }
  @Expose()
  get canShowExpiredSubPopup(): boolean {
    if (!this.items) {
      return false;
    }

    if (!this.items.length) {
      return false;
    }

    const hasPassedGraceExpirePeriod = checkSubscriptionPassedExpireGracePeriod(
      this.items,
      false
    );
    return hasPassedGraceExpirePeriod;
  }
}
