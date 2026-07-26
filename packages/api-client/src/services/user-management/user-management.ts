import { getRuntimeEnv } from "@cs/env/universal";
import { z } from "@cs/validation";

import { defineService } from "../../endpoints/registry";

/**
 * Header carrying the raw refresh token to the backend's refresh endpoint.
 * Confirmed against `stg-api.vulcanlabs.co` directly (2026-07-21) — the
 * literal name wasn't present in `temp/` (only the constant identifier
 * `REFRESH_TOKEN_HEADER` was), and the previous guess `X-Refresh-Token` was
 * wrong (backend rejected it with `INVALID_TOKEN` / "Failed to parse refresh
 * token" regardless of the token's validity). The real header has no `X-`
 * prefix.
 */
const REFRESH_TOKEN_HEADER = "refresh-token";
const APP_ID_HEADER = "X-Application-Id";
// Confirmed against apps/super-app/src/utils/commons/keys.ts (XCountryKey) —
// the real header has no `-Key` suffix.
const COUNTRY_KEY_HEADER = "X-Country";

// Backend does not return `expires_in` explicitly (confirmed via temp/models/signin.ts) —
// TokenManager decodes the JWT `exp` claim itself (see core/token-manager.ts).
const RefreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

const VerifyOAuthTokenResponseSchema = z.object({
  accessToken: z.string(),
  // Confirmed against apps/super-app/src/core/models/signin.ts
  // (VerifyOAuthTokenModel.isNewUser, wire field `is_new_user`).
  isNewUser: z.boolean(),
  refreshToken: z.string(),
});

const UploadTermsConsentSchema = z.object({
  actionContext: z.string(),
  ipAddress: z.string(),
  type: z.string(),
  version: z.string(),
});

const UserConsentsSchema = z.object({
  uploadTermsConsent: z.optional(UploadTermsConsentSchema),
});

// The backend wraps profile fields under an `infos` envelope (confirmed
// against apps/super-app/src/core/repositories/user-service.ts, which
// unwraps `result.infos`/`result.consents` before mapping) — flattened here
// via a transform so callers see a plain object, matching legacy `UserInfoModel`.
const UserProfileSchema = z.pipe(
  z.object({
    consents: z.optional(UserConsentsSchema),
    infos: z.object({
      avatar: z.optional(z.string()),
      createdAt: z.optional(z.string()),
      email: z.optional(z.string()),
      firstName: z.optional(z.string()),
      id: z.string(),
      lastName: z.optional(z.string()),
      role: z.optional(z.string()),
      username: z.optional(z.string()),
    }),
  }),
  z.transform(({ consents, infos }) => ({ ...infos, consents }))
);

const UserOnboardingSchema = z.object({
  metadata: z.optional(z.record(z.string(), z.unknown())),
});

const BootstrapGuestSessionResponseSchema = z.object({
  csrfToken: z.string(),
  nonce: z.string(),
});

/**
 * The backend names the guest access token field `access_jwt`, not
 * `access_token` (confirmed against `apps/super-app/src/features/guest-mode/models/index.ts`'s
 * `GuestSessionModel`) — the global snake_case->camelCase transform
 * (core/http-client.ts) turns it into `accessJwt`, so it needs an explicit
 * rename here, the same `z.pipe`/`z.transform` shape `UserProfileSchema`
 * already uses for its `infos` envelope unwrap.
 */
const CreateGuestSessionResponseSchema = z.pipe(
  z.object({
    accessJwt: z.string(),
    anonId: z.string(),
    deviceId: z.string(),
    refreshToken: z.string(),
    sessionId: z.string(),
  }),
  z.transform(({ accessJwt, ...rest }) => ({ accessToken: accessJwt, ...rest }))
);

const RefreshGuestTokenResponseSchema = z.pipe(
  z.object({
    accessJwt: z.string(),
    refreshToken: z.optional(z.string()),
  }),
  z.transform(({ accessJwt, refreshToken }) => ({
    accessToken: accessJwt,
    refreshToken,
  }))
);

export type RefreshTokenResult = z.infer<typeof RefreshTokenResponseSchema>;
export type VerifyOAuthTokenResult = z.infer<
  typeof VerifyOAuthTokenResponseSchema
>;
export type UserInfoResult = z.infer<typeof UserProfileSchema>;
export type BootstrapGuestSessionResult = z.infer<
  typeof BootstrapGuestSessionResponseSchema
>;
export type CreateGuestSessionResult = z.infer<
  typeof CreateGuestSessionResponseSchema
>;
export type RefreshGuestTokenResult = z.infer<
  typeof RefreshGuestTokenResponseSchema
>;

interface VerifyOAuthTokenInput {
  provider: string;
  idToken: string;
  projectId: string;
  countryCode?: string;
}

/** `origin` is resolved server-side only (see `server/guest/session.ts`'s `resolveCsrfOrigin`, which reads the server-only `ANON_CSRF_ORIGIN` secret) and passed in as plain call input so this service file never imports `@cs/env`'s server-only accessor itself. */
interface BootstrapGuestSessionInput {
  origin: string;
}

interface CsrfProtectedGuestInput {
  csrfToken: string;
  /** From the same bootstrap call as `csrfToken` — the backend rejects the request without it ("Nonce validation failed: nonce cannot be empty", confirmed live). */
  nonce: string;
  origin: string;
}

const CSRF_TOKEN_HEADER = "x-csrf-token";
const NONCE_HEADER = "x-nonce";

/** Double-submit CSRF pair the backend expects: the token both as a cookie and as a header (see apps/super-app's anon route handlers), plus the paired nonce. */
const csrfHeaders = (
  input: CsrfProtectedGuestInput
): Record<string, string> => ({
  cookie: `csrf_token=${input.csrfToken}`,
  [CSRF_TOKEN_HEADER]: input.csrfToken,
  [NONCE_HEADER]: input.nonce,
  origin: input.origin,
});

/**
 * First domain migrated off `temp/` as a proof of concept (see
 * docs/runbook/api-client.md §8) — contract facts only, none of the legacy
 * class-transformer/boolean-flag implementation carried over.
 */
export const userManagement = defineService("user-management")
  .endpoint("refreshToken", {
    auth: "none",
    headers: (input: { refreshToken: string }) => ({
      [REFRESH_TOKEN_HEADER]: input.refreshToken,
    }),
    method: "POST",
    path: "/auth/token/refresh",
    responseSchema: RefreshTokenResponseSchema,
    retry: false,
    version: "v1",
  })
  .endpoint<"verifyOAuthToken", VerifyOAuthTokenInput, VerifyOAuthTokenResult>(
    "verifyOAuthToken",
    {
      auth: "none",
      headers: (input: VerifyOAuthTokenInput): Record<string, string> =>
        input.countryCode ? { [COUNTRY_KEY_HEADER]: input.countryCode } : {},
      method: "POST",
      path: (input: VerifyOAuthTokenInput) => `/oauth/${input.provider}/token`,
      responseSchema: VerifyOAuthTokenResponseSchema,
      retry: false,
      toBody: (input: VerifyOAuthTokenInput) => ({
        idToken: input.idToken,
        projectId: input.projectId,
      }),
      version: "v1",
    }
  )
  .endpoint("getProfile", {
    auth: "required",
    headers: () => ({
      [APP_ID_HEADER]: getRuntimeEnv().CS_PUBLIC_APP_ID ?? "",
    }),
    method: "GET",
    path: "/users/accounts/info",
    responseSchema: UserProfileSchema,
    version: "v1",
  })
  .endpoint("getUserOnboarding", {
    auth: "required",
    method: "GET",
    path: "/onboardings",
    responseSchema: UserOnboardingSchema,
    version: "v1",
  })
  .endpoint("updateUserOnboarding", {
    auth: "required",
    method: "POST",
    path: "/onboardings",
    toBody: (input: { metadata: Record<string, unknown> }) => ({
      metadata: input.metadata,
    }),
    version: "v1",
  })
  .endpoint("updateUserInfo", {
    auth: "required",
    method: "PUT",
    path: "/users",
    responseSchema: UserProfileSchema,
    version: "v1",
  })
  .endpoint("confirmConsent", {
    auth: "required",
    method: "POST",
    path: "/users/consents/confirm",
    version: "v1",
  })
  .endpoint("logout", {
    auth: "required",
    method: "POST",
    path: "/auth/logout",
    retry: false,
    version: "v1",
  })
  .endpoint<
    "bootstrapGuestSession",
    BootstrapGuestSessionInput,
    BootstrapGuestSessionResult
  >("bootstrapGuestSession", {
    auth: "none",
    headers: (input: BootstrapGuestSessionInput) => ({ origin: input.origin }),
    method: "GET",
    path: "/anon/bootstrap",
    responseSchema: BootstrapGuestSessionResponseSchema,
    retry: false,
    version: "v1",
  })
  .endpoint<
    "createGuestSession",
    CsrfProtectedGuestInput & { captchaToken: string },
    CreateGuestSessionResult
  >("createGuestSession", {
    auth: "none",
    headers: csrfHeaders,
    method: "POST",
    path: "/anon/sessions",
    responseSchema: CreateGuestSessionResponseSchema,
    retry: false,
    toBody: (input: { captchaToken: string }) => ({
      captchaToken: input.captchaToken,
    }),
    version: "v1",
  })
  .endpoint<
    "refreshGuestToken",
    CsrfProtectedGuestInput & { refreshToken: string },
    RefreshGuestTokenResult
  >("refreshGuestToken", {
    auth: "none",
    headers: csrfHeaders,
    method: "POST",
    path: "/anon/tokens:refresh",
    responseSchema: RefreshGuestTokenResponseSchema,
    retry: false,
    toBody: (input: { refreshToken: string }) => ({
      refreshToken: input.refreshToken,
    }),
    version: "v1",
  });
