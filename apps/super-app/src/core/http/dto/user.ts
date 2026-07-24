import { Exclude, Expose } from "@/libs/class-transformer";
import type { EUSER_ROLE } from "@/utils/commons/enums";

export interface TUserProfileDTO {
  id: string;
  first_name: string;
  role: EUSER_ROLE;
  last_name: string;
  username: string;
  email: string;
  // phone_number: string;

  avatar: string;
  status: string;
}

export interface TUserConsentsDTO {
  upload_terms_consent: TUploadTermsConsentDTO;
}

export interface TUploadTermsConsentDTO {
  type: string;
  action_context: string;
  ip_address: string;
  version: string;
}

export type TLoginStatus = "success" | "error";

export interface TSearchParamsLoginPage {
  status?: TLoginStatus;
}

@Exclude()
export class VerifyOAuthTokenPayload {
  @Expose({ name: "idToken" })
  id_token!: string;

  @Expose({ name: "projectId" })
  project_id!: string;
}

@Exclude()
export class UpdateUserInfoPayloadDto {
  @Expose()
  username!: string;

  @Expose({ name: "firstName" })
  first_name!: string;

  @Expose({ name: "lastName" })
  last_name!: string;

  @Expose()
  avatar!: string;

  @Expose()
  email!: string;
}

export interface TUpdateUserInfoPayload {
  username?: string;
  email?: string;
  avatar?: string;
  phoneNumber?: string;
}

export interface TUpdateUserOnboardingInput {
  personal: string;
  interest: string[];
}
