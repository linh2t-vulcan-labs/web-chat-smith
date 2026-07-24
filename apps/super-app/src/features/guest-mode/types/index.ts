interface TCaptcha {
  provider: string;
  site_key: string;
  action: string;
  min_score: number;
  vendor_options_json: string;
}

export interface TBootstrapGuestModeResponse {
  csrf_token: string;
  nonce: string;
  csrf_ttl_seconds: number;
  nonce_ttl_seconds: number;
  expires_at: string;
  captcha: TCaptcha;
}

export interface TCreateGuestSessionPayload {
  csrfToken: string;
  nonce: string;
  captchaToken: string;
  deviceFp?: string; //  client-side device fingerprint hash
}

export interface TCreateGuestSessionResponse {
  access_jwt: string;
  expires_in: number;
  anon_id: string;
  session_id: string;
  device_id: string;
  scope: string[];
  refresh_token: string;
}

export interface TRefreshTokenResponse {
  access_jwt: string;
  expires_in: number;
  refresh_token: string;
}
