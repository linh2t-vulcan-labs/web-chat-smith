import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
} from "firebase/auth";

import type { AuthProviderKind } from "./types";

export type SocialAuthProvider =
  | FacebookAuthProvider
  | GoogleAuthProvider
  | OAuthProvider;

let googleProvider: GoogleAuthProvider | null = null;
let appleProvider: OAuthProvider | null = null;
let facebookProvider: FacebookAuthProvider | null = null;

export const getGoogleAuthProvider = (): GoogleAuthProvider => {
  googleProvider ??= new GoogleAuthProvider();
  return googleProvider;
};

export const getAppleAuthProvider = (): OAuthProvider => {
  appleProvider ??= new OAuthProvider("apple.com");
  return appleProvider;
};

export const getFacebookAuthProvider = (): FacebookAuthProvider => {
  facebookProvider ??= new FacebookAuthProvider();
  return facebookProvider;
};

const providersByKind: Record<AuthProviderKind, () => SocialAuthProvider> = {
  apple: getAppleAuthProvider,
  facebook: getFacebookAuthProvider,
  google: getGoogleAuthProvider,
};

/**
 * Resolves the social auth provider instance for `kind` via a lookup table —
 * add a new provider by adding one entry, not another branch.
 */
export const getAuthProvider = (kind: AuthProviderKind): SocialAuthProvider =>
  providersByKind[kind]();
