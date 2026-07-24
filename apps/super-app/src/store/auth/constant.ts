import type { TAuthStoreState } from "./types";

export const defaultAuthStoreState: TAuthStoreState = {
  accessToken: "",
  guestSignInSource: null,
  isAuthenticated: false,
  isNewUser: false,
  isOpenLoginModal: false,
  justSignedIn: false,
  provider: "",
  source: "",
  userId: "",
};
