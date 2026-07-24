import type { UserInfoModel } from "@/core/models/user";
import type { TProviders } from "@/core/ports/user";
import type { FirebaseUser } from "@/libs/firebase";
import type { TGuestSignInState } from "@/libs/tracking-event";
import type { EAUTH_PROVIDER, EAUTH_SOURCE } from "@/utils/commons/enums";

export interface TAuthStoreState {
  isOpenLoginModal: boolean;
  provider: string;
  source: string;
  isAuthenticated: boolean;
  accessToken: string;
  isNewUser: boolean;
  userId: string;
  justSignedIn: boolean;
  guestSignInSource: TGuestSignInState | null;
}

export interface TAuthStoreAction {
  signInWithProvider: (
    provider: EAUTH_PROVIDER,
    firebaseCredentials?: string,
    signInSource?: EAUTH_SOURCE
  ) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserInfo: (
    userInfoVulcan: UserInfoModel,
    firebaseUser?: FirebaseUser
  ) => Promise<UserInfoModel>;
  setAuthProvider: (provider: TProviders) => void;
  setAuthSource: (source: EAUTH_SOURCE) => void;
  setIsNewUser: (isNewUser: boolean) => void;
  setJustSignedIn: (justSignedIn: boolean) => void;
  clearPersistState: () => void;
  setIsOpenLoginModal: (
    isOpen: boolean,
    guestSignInSource?: TGuestSignInState | null
  ) => void;
}

export interface TCreateAuthStoreProps {
  handleTransitionSignInWithProvider: (
    provider: EAUTH_PROVIDER,
    firebaseCredentials?: string,
    signInSource?: EAUTH_SOURCE
  ) => Promise<void>;
}

export type TAuthStore = TAuthStoreState & TAuthStoreAction;
