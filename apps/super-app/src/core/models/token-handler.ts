export interface ITokenHandler {
  getAccessToken: () => string | null;
  setAccessToken: (token: string) => void;
  refreshToken: () => Promise<{ accessToken?: string; error?: unknown } | null>;
  clearAccessToken: () => void;
  clearAll: () => void;
  onExpire?: () => Promise<void>;
  onTokenRefreshed?: (token: string) => void;
}
