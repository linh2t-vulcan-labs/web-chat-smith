import { jwtDecode } from "jwt-decode";

import { Exclude, Expose, Transform } from "@/libs/class-transformer";
import dayjs from "@/libs/dayjs";

export interface TSignin {
  redirect_url: string;
}

// @Exclude()
// class InternalOAuthModel {
//   @Expose()
//   isNewUser!: boolean;

//   @Expose()
//   url!: string;

//   @Expose()
//   error?: string;
// }

function getJwtMaxAge(token: string | undefined): number {
  if (!token) {
    return 0;
  }

  const decodedJwt = jwtDecode(token);

  if (!decodedJwt.exp) {
    return 0;
  }

  const currentTime = dayjs().unix();
  const maxAge = decodedJwt.exp - currentTime;

  return Math.max(maxAge, 0);
}

function getJwtUserId(token: string | undefined): string {
  if (!token) {
    return "";
  }

  const decodedJwt = jwtDecode(token);
  return decodedJwt.sub || "";
}

@Exclude()
export class RefreshTokenModel {
  @Expose({ name: "access_token" })
  accessToken!: string;

  @Expose({ name: "refresh_token" })
  refreshToken!: string;

  @Expose()
  @Transform(({ obj }) => getJwtMaxAge(obj["access_token"]))
  accessTokenMaxAge!: number;

  @Expose()
  @Transform(({ obj }) => getJwtMaxAge(obj["refresh_token"]))
  refreshTokenMaxAge!: number;

  @Expose()
  @Transform(({ obj }) => getJwtUserId(obj["access_token"]))
  userId!: string;
}

@Exclude()
export class VerifyOAuthTokenModel {
  @Expose({ name: "is_new_user" })
  isNewUser!: boolean;

  @Expose({ name: "access_token" })
  accessToken!: string;

  @Expose({ name: "refresh_token" })
  refreshToken!: string;

  @Expose()
  @Transform(({ obj }) => getJwtUserId(obj["access_token"]))
  userId!: string;

  @Expose()
  @Transform(({ obj }) => getJwtMaxAge(obj["access_token"]))
  accessTokenMaxAge!: number;

  @Expose()
  @Transform(({ obj }) => getJwtMaxAge(obj["refresh_token"]))
  refreshTokenMaxAge!: number;
}

export type TVerifyOAuthToken = VerifyOAuthTokenModel;
export type TRefreshToken = RefreshTokenModel;
