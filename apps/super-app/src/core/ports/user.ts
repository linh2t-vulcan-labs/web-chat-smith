import type {
  TUpdateUserInfoPayload,
  TUpdateUserOnboardingInput,
} from "@/core/http/dto/user";
import type { FirebaseUser, FirebaseUserInfo } from "@/libs/firebase";
import type { EAUTH_PROVIDER } from "@/utils/commons/enums";

import type { TResult } from "../models/http";
import type { TRefreshToken, TVerifyOAuthToken } from "../models/signin";
import type { TUserOnboarding, UserInfoModel } from "../models/user";

export type TProviders = "facebook" | "google" | "apple";

export interface TUserServiceAPIs {
  getUserOnboarding: () => TResult<TUserOnboarding>;
  getUserProfile: (enabledHandleAuthError?: boolean) => TResult<UserInfoModel>;
  updateUserOnboarding: (input: TUpdateUserOnboardingInput) => TResult<object>;
  refreshToken: (
    rt: string,
    enabledHandleAuthError?: boolean,
    proxyHeaders?: Record<string, string>
  ) => TResult<TRefreshToken>;
  verifyOAuthToken: (
    token: string,
    provider: EAUTH_PROVIDER,
    countryCode?: string,
    proxyHeaders?: Record<string, string>
  ) => TResult<TVerifyOAuthToken>;
  updateUserInfo: (
    internalUserInfo: UserInfoModel,
    firebaseUserInfo: FirebaseUser
  ) => TResult<UserInfoModel>;
  confirmConsent: (payload: {
    type: string;
    action_context: string;
    version?: string;
  }) => TResult<unknown>;
  logout: (
    accessToken: string,
    proxyHeaders?: Record<string, string>
  ) => Promise<void>;
}

export interface TUserRepositories {
  getUserOnboarding: () => TResult<TUserOnboarding>;
  getUserProfile: (enabledHandleAuthError?: boolean) => TResult<UserInfoModel>;
  updateUserOnboarding: (input: TUpdateUserOnboardingInput) => TResult<object>;
  refreshToken: (
    rt: string,
    enabledHandleAuthError?: boolean,
    proxyHeaders?: Record<string, string>
  ) => TResult<TRefreshToken>;
  verifyOAuthToken: (
    token: string,
    provider: EAUTH_PROVIDER,
    countryCode?: string,
    proxyHeaders?: Record<string, string>
  ) => TResult<TVerifyOAuthToken>;
  updateUserInfo: (
    internalUserInfo: UserInfoModel,
    firebaseUserInfo: TUpdateUserInfoPayload,
    firebaseProviderData: FirebaseUserInfo[],
    authProvider: EAUTH_PROVIDER
  ) => TResult<UserInfoModel>;
  logout: (
    accessToken: string,
    proxyHeaders?: Record<string, string>
  ) => Promise<void>;
}
