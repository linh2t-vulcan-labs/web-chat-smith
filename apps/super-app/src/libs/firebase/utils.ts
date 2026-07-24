import type {
  FacebookAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
} from "firebase/auth";

import type { TProviders } from "@/core/ports/user";
import { EAUTH_PROVIDER } from "@/utils/commons/enums";

import {
  getAppleAuthProvider,
  getFacebookAuthProvider,
  getGoogleAuthProvider,
} from ".";

type SocialAuthProvider =
  | FacebookAuthProvider
  | GoogleAuthProvider
  | OAuthProvider;

export const getAuthProvider = (
  provider: EAUTH_PROVIDER | TProviders
): SocialAuthProvider => {
  switch (provider) {
    case EAUTH_PROVIDER.APPLE: {
      return getAppleAuthProvider();
    }
    case EAUTH_PROVIDER.FACEBOOK: {
      return getFacebookAuthProvider();
    }
    default: {
      return getGoogleAuthProvider();
    }
  }
};
