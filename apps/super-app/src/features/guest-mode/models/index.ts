import type { EAIProviderModel, EAIValueModel } from "@/core/models/model";
import { Expose, Type } from "@/libs/class-transformer";

export { EAIProviderModel, EAIValueModel } from "@/core/models/model";

export interface TSelectedModel {
  model: EAIValueModel;
  provider: EAIProviderModel;
}

class BootstrapCaptchaModel {
  @Expose()
  provider!: string;
  @Expose({ name: "site_key" })
  siteKey!: string;

  @Expose()
  action!: string;

  @Expose({ name: "min_score" })
  minScore!: number;

  @Expose({ name: "vendor_options_json" })
  vendorOptionsJson!: string;
}

export class BootstrapModel {
  @Expose({ name: "csrf_token" })
  csrfToken!: string;

  @Expose()
  nonce!: string;

  @Expose({ name: "csrf_ttl_seconds" })
  @Type(() => Number)
  csrfTTLSeconds!: number;

  @Expose({ name: "nonce_ttl_seconds" })
  @Type(() => Number)
  nonceTTLSeconds!: number;

  @Expose({ name: "expires_at" })
  expiresAt!: string;

  @Expose()
  @Type(() => BootstrapCaptchaModel)
  captcha?: BootstrapCaptchaModel;
}

export class GuestSessionModel {
  @Expose({ name: "access_jwt" })
  accessToken!: string;

  @Expose({ name: "expires_in" })
  expiresIn!: number;

  @Expose({ name: "anon_id" })
  anonId!: string;

  @Expose({ name: "session_id" })
  sessionId!: string;

  @Expose({ name: "device_id" })
  deviceId!: string;

  @Expose()
  scope!: string[];

  @Expose({ name: "refresh_token" })
  refreshToken!: string;
}

export class GuestRefreshTokenModel {
  @Expose({ name: "access_jwt" })
  accessToken!: string;

  @Expose({ name: "expires_in" })
  expiresIn!: number;

  @Expose({ name: "refresh_token" })
  refreshToken!: string;
}
