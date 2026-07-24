import { avatarBackgroundColor } from "@/components/avatar/consts";
import { Exclude, Expose, Transform, Type } from "@/libs/class-transformer";
import type { EUSER_ROLE } from "@/utils/commons/enums";
import { getRandomInt } from "@/utils/commons/helpers";

// @Exclude()
// class UserMetadataModel {
//   @Expose({ name: "photo_upload_consent" })
//   photoUploadConsent!: boolean;
// }

@Exclude()
export class UploadTermsConsentModel {
  @Expose({ name: "action_context" })
  actionContext!: string;

  @Expose({ name: "ip_address" })
  ipAddress!: string;

  @Expose()
  timestamp!: string;

  @Expose()
  version!: string;
}

@Exclude()
class UserConsentsModel {
  @Expose({ name: "upload_terms_consent" })
  uploadTermsConsent!: UploadTermsConsentModel;
}

@Exclude()
export class UserInfoModel {
  @Expose()
  id!: string;

  @Expose({ name: "first_name" })
  firstName!: string;

  @Expose({ name: "last_name" })
  lastName!: string;

  @Expose()
  avatar!: string;

  @Expose()
  email!: string;

  @Expose()
  role!: EUSER_ROLE;

  @Expose()
  username!: string;

  @Expose({ name: "created_at" })
  createdAt!: string;

  @Expose()
  consents!: UserConsentsModel | null;

  @Expose()
  // oxlint-disable-next-line class-methods-use-this
  get avatarColor(): string {
    return avatarBackgroundColor[
      getRandomInt(0, avatarBackgroundColor.length - 1)
    ] as string;
  }
}

export class FreeUsageCountModel {
  @Expose({ name: "user_id" })
  userId!: string;

  @Expose({ name: "remaining_count" })
  remainingCount!: number;

  @Expose({ name: "use_case" })
  usecase!: string;

  @Expose({ name: "created_at" })
  createdAt!: string;

  @Expose({ name: "updated_at" })
  updatedAt!: string;
}

class MetadataModel {
  @Expose()
  personal?: string;

  @Expose()
  @Transform(({ value }) => value || [])
  interest!: string[];
}

export class TUserOnboarding {
  @Expose()
  @Type(() => MetadataModel)
  metadata!: MetadataModel;

  @Expose()
  get isUserOnboarded() {
    return this.metadata.interest.length > 0 && !!this.metadata.personal;
  }
}

export interface TCredentialActions {
  token?: string;
  refreshToken?: string;
  userId: string;
}
