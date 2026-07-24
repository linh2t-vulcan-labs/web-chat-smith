import { getRuntimeEnv } from "@cs/env/universal";
import type { FirebaseOptions } from "firebase/app";
import { getApp, initializeApp } from "firebase/app";
import {
  FacebookAuthProvider,
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
} from "firebase/auth";
import { getRemoteConfig } from "firebase/remote-config";

import { remoteConfigDefaultValue } from "@/libs/firebase/remote-config-default";
import { safeJsonParse } from "@/utils/commons/helpers";

// Every export below is a lazy getter, not a module-scope value. This module
// is invoked from FirebaseRemoteConfigProvider's render body, which — despite
// being "use client" — still executes during SSR, so reads must go through
// the isomorphic getRuntimeEnv() (server: publicEnv, client: window.__CS_ENV__),
// not the client-only getPublicEnv(), which throws when called server-side.

const getFirebaseConfig = (): FirebaseOptions =>
  safeJsonParse<FirebaseOptions>(
    getRuntimeEnv().CS_PUBLIC_FIREBASE_AUTH_CONFIG ?? "{}"
  ) as FirebaseOptions;

let cachedFirebaseApp: ReturnType<typeof initializeApp> | undefined;
export const getFirebaseApp = (): ReturnType<typeof initializeApp> => {
  if (!cachedFirebaseApp) {
    try {
      cachedFirebaseApp = getApp();
    } catch {
      cachedFirebaseApp = initializeApp(getFirebaseConfig());
    }
  }
  return cachedFirebaseApp;
};

// Firebase Auth's getAuth() eagerly fetches the auth iframe (`{authDomain}/__/auth/iframe.js`)
// to support redirect/multi-tab persistence. Since this module is bundled into every route via
// FirebaseRemoteConfigProvider, calling getAuth() at module scope fired that network chain on
// every page load. Lazily creating it defers the fetch until an auth action actually needs it.
let cachedFirebaseAuth: ReturnType<typeof getAuth> | undefined;
export const getFirebaseAuth = (): ReturnType<typeof getAuth> => {
  cachedFirebaseAuth ??= getAuth(getFirebaseApp());
  return cachedFirebaseAuth;
};

let cachedGoogleAuthProvider: GoogleAuthProvider | undefined;
export const getGoogleAuthProvider = (): GoogleAuthProvider => {
  if (!cachedGoogleAuthProvider) {
    cachedGoogleAuthProvider = new GoogleAuthProvider();
    cachedGoogleAuthProvider.setCustomParameters({ prompt: "select_account" });
  }
  return cachedGoogleAuthProvider;
};

let cachedAppleAuthProvider: OAuthProvider | undefined;
export const getAppleAuthProvider = (): OAuthProvider => {
  cachedAppleAuthProvider ??= new OAuthProvider("apple.com");
  return cachedAppleAuthProvider;
};

let cachedFacebookAuthProvider: FacebookAuthProvider | undefined;
export const getFacebookAuthProvider = (): FacebookAuthProvider => {
  cachedFacebookAuthProvider ??= new FacebookAuthProvider();
  return cachedFacebookAuthProvider;
};

let cachedFirebaseRemoteConfig: ReturnType<typeof getRemoteConfig> | undefined;
export const getFirebaseRemoteConfig = (): ReturnType<
  typeof getRemoteConfig
> => {
  if (!cachedFirebaseRemoteConfig) {
    cachedFirebaseRemoteConfig = getRemoteConfig(getFirebaseApp());
    cachedFirebaseRemoteConfig.settings.minimumFetchIntervalMillis =
      getRuntimeEnv().CS_PUBLIC_FIREBASE_REMOTE_CONFIG_INTERVAL_FETCH ?? 0;
    cachedFirebaseRemoteConfig.defaultConfig =
      remoteConfigDefaultValue as unknown as Record<
        string,
        string | number | boolean
      >;
  }
  return cachedFirebaseRemoteConfig;
};

export { signInWithPopup, signOut } from "firebase/auth";
export { FirebaseError } from "firebase/app";
export type {
  User as FirebaseUser,
  UserInfo as FirebaseUserInfo,
} from "firebase/auth";
