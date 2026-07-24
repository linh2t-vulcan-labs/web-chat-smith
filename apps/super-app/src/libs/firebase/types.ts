import type { JwtPayload } from "jwt-decode";

export interface FirebaseJWT {
  identities: {
    email: string;
  };
  sign_in_provider: string;
}

export interface FirebaseCustomData {
  email: string;
  _tokenResponse: {
    oauthAccessToken: string;
    verifiedProvider: string[];
    providerId: string;
  };
}

export interface ICustomJWT extends JwtPayload {
  firebase: FirebaseJWT;
}
