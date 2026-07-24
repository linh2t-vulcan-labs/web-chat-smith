import { jwtDecode } from "jwt-decode";

import type { ICustomJWT } from "@/libs/firebase/types";

import type { EAUTH_PROVIDER } from "./enums";

export const decodeFirebaseToken = (token: string) => {
  const decodeToken = jwtDecode(token) as ICustomJWT;

  const authProvider = decodeToken.firebase.sign_in_provider.split(
    "."
  )[0] as EAUTH_PROVIDER;
  return {
    ...decodeToken,
    authProvider,
  };
};

export const extractUserId = (token: string): string => {
  if (!token || token === "") {
    return "";
  }
  try {
    const decoded = jwtDecode<{ sub?: string }>(token);
    return decoded.sub || "";
  } catch {
    return "";
  }
};
