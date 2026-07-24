import { getRuntimeEnv } from "@cs/env/universal";
import { jwtDecode } from "jwt-decode";

import type { THttp } from "@/core/models/http";
import { RefreshTokenModel, VerifyOAuthTokenModel } from "@/core/models/signin";
import { TUserOnboarding, UserInfoModel } from "@/core/models/user";
import type { TUserServiceAPIs } from "@/core/ports/user";
import { TransformerBuilder } from "@/libs/class-transformer";
import type { ICustomJWT } from "@/libs/firebase/types";
import { isEqual, pick } from "@/libs/lodash-es";
import { removeNullAndUndefined } from "@/utils/commons/helpers";
import { REFRESH_TOKEN_HEADER, XCountryKey } from "@/utils/commons/keys";

import type {
  TUpdateUserInfoPayload,
  TUserConsentsDTO,
  TUserProfileDTO,
  VerifyOAuthTokenPayload,
} from "../http/dto/user";
import { UpdateUserInfoPayloadDto } from "../http/dto/user";

const getUserManagementServiceUrl = () =>
  getRuntimeEnv().CS_PUBLIC_USER_MANAGEMENT_SERVICE_URL;
const getAppId = () => getRuntimeEnv().CS_PUBLIC_APP_ID;

export const userServiceAPIs = (client: THttp): TUserServiceAPIs => ({
  confirmConsent: async (payload) => {
    const [error, response] = await client.post(
      "/api/v1/users/consents/confirm",
      {
        baseURL: getUserManagementServiceUrl(),
        body: payload,
      }
    );
    if (error) {
      return [error, null];
    }
    return [null, response];
  },
  getUserOnboarding: async () => {
    const [error, result] = await client.get<TUserOnboarding>(
      "/api/v1/onboardings",
      {
        baseURL: getUserManagementServiceUrl(),
      }
    );

    if (error) {
      return [error, null];
    }

    const data = new TransformerBuilder(TUserOnboarding)
      .format(result)
      .toPlainCamelCase() as TUserOnboarding;

    return [null, data];
  },
  getUserProfile: async (enabledHandleAuthError?: boolean) => {
    const [error, result] = await client.get<{
      infos?: TUserProfileDTO;
      consents?: TUserConsentsDTO;
    }>("/api/v1/users/accounts/info", {
      baseURL: getUserManagementServiceUrl(),
      enabledHandleAuthError,
      headers: {
        "X-Application-Id": getAppId(),
      },
    });

    if (error) {
      return [error, null];
    }
    const userInfo = {
      ...result.infos,
      consents: result.consents,
    };

    const data = new TransformerBuilder(UserInfoModel)
      .format(userInfo)
      .toPlainCamelCase() as UserInfoModel;

    return [null, data];
  },
  logout: async (accessToken, proxyHeaders) => {
    const [error] = await client.post(`/api/v1/auth/logout`, {
      baseURL: getUserManagementServiceUrl(),
      headers: {
        ...proxyHeaders,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (error) {
      console.log(error);
    }
  },
  refreshToken: async (rt, enabledHandleAuthError, proxyHeaders) => {
    const [error, result] = await client.post<{
      access_token: string;
      refresh_token: string;
    }>("/api/v1/auth/token/refresh", {
      baseURL: getUserManagementServiceUrl(),
      enabledAuth: false,
      enabledHandleAuthError: false,
      enabledRefreshToken: false,
      headers: {
        ...proxyHeaders,
        [REFRESH_TOKEN_HEADER]: rt,
      },
    });

    if (error) {
      return [error, null];
    }

    const data = new TransformerBuilder(RefreshTokenModel)
      .format(result)
      .toPlainCamelCase() as RefreshTokenModel;

    return [null, data];
  },
  updateUserInfo: async (internalUserInfo, firebaseUserInfo) => {
    const PRIORITIZED_PROVIDERS = ["google.com", "apple.com", "facebook.com"];

    const sortedProviderData = [...firebaseUserInfo.providerData].toSorted(
      (a, b) =>
        PRIORITIZED_PROVIDERS.indexOf(a.providerId) -
        PRIORITIZED_PROVIDERS.indexOf(b.providerId)
    );

    const [topProvider] = sortedProviderData;

    const payload: Partial<TUpdateUserInfoPayload> = {
      avatar: topProvider?.photoURL || firebaseUserInfo.photoURL || "",
      email: topProvider?.email || firebaseUserInfo.email || "",
      phoneNumber:
        topProvider?.phoneNumber || firebaseUserInfo.phoneNumber || "",
      username: topProvider?.displayName || firebaseUserInfo.displayName || "",
    };

    const transformedPayload = new TransformerBuilder(UpdateUserInfoPayloadDto)
      .format(payload, {
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
      })
      .toPlainSnakeCase() as UpdateUserInfoPayloadDto;

    const cleanedPayload =
      removeNullAndUndefined<UpdateUserInfoPayloadDto>(transformedPayload);
    const hasUpdate = Object.keys(cleanedPayload).length > 0;

    const currentData = pick(internalUserInfo, Object.keys(cleanedPayload));

    const isModified = !isEqual(cleanedPayload, currentData);

    if (hasUpdate && isModified) {
      const [error, response] = await client.put<{ infos?: TUserProfileDTO }>(
        "/api/v1/users",
        {
          baseURL: getUserManagementServiceUrl(),
          body: transformedPayload,
        }
      );

      if (error) {
        return [error, null];
      }

      const updatedUser = new TransformerBuilder(UserInfoModel)
        .format(response?.infos)
        .toPlainCamelCase() as UserInfoModel;

      return [null, updatedUser];
    }

    return [null, internalUserInfo];
  },
  updateUserOnboarding: async (input) => {
    const [error, result] = await client.post<object>("/api/v1/onboardings", {
      baseURL: getUserManagementServiceUrl(),
      body: {
        metadata: input,
      },
    });

    if (error) {
      return [error, null];
    }

    return [null, result];
  },
  verifyOAuthToken: async (token, provider, countryCode, proxyHeaders) => {
    const decodeJwt = jwtDecode(token) as ICustomJWT;

    const payload: VerifyOAuthTokenPayload = {
      id_token: token,
      project_id: decodeJwt.aud as string,
    };

    const [error, result] = await client.post<VerifyOAuthTokenModel>(
      `/api/v1/oauth/${provider}/token`,
      {
        baseURL: getUserManagementServiceUrl(),
        body: payload,
        enabledAuth: false,
        enabledRefreshToken: false,
        headers: {
          ...proxyHeaders,
          [XCountryKey]: countryCode,
        },
      }
    );

    if (error) {
      return [error, null];
    }

    const data = new TransformerBuilder(VerifyOAuthTokenModel)
      .format(result)
      .toPlainCamelCase() as VerifyOAuthTokenModel;

    return [null, data];
  },
});
