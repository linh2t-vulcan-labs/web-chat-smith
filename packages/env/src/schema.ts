// @cs/env/schema — CS_PUBLIC_* schema, shared flat schema for every app
// (super-app, web, creative-studio). Every field is `z.optional(...)`
// deliberately: different apps read different subsets, and this is a single
// shared schema rather than one per app — an app whose .env.local doesn't
// set a var some *other* app needs must not crash on first `publicEnv`/
// `getPublicEnv()` access.
import { z } from "@cs/validation";

import { CS_PUBLIC_PREFIX } from "./constants";
import { envJsonString, envNum, envNumDefault, envUrl } from "./helpers";

export const publicSchemaEntries = {
  // Previously read raw via `process.env.NEXT_PUBLIC_AF_WEB_APP_ID` in
  // appsflyer/provider.tsx, bypassing @cs/env entirely — folded in here.
  CS_PUBLIC_AF_WEB_APP_ID: z.optional(z.string()),
  CS_PUBLIC_API_BASE_URL: z.optional(envUrl()),
  CS_PUBLIC_APP_ID: z.optional(z.string()),
  CS_PUBLIC_CDN_PREFIX: z.optional(z.string()),
  CS_PUBLIC_CHAT_SERVICE_URL: z.optional(envUrl()),
  CS_PUBLIC_COOKIE_DOMAIN: z.optional(z.string()),
  CS_PUBLIC_CORALOGIX_ACCOUNT_DOMAIN: z.optional(z.string()),
  CS_PUBLIC_CORALOGIX_APPLICATION_NAME: z.optional(z.string()),
  CS_PUBLIC_CORALOGIX_APP_VERSION: z.optional(z.string()),
  CS_PUBLIC_CORALOGIX_ENVIRONMENT: z.optional(z.string()),
  CS_PUBLIC_CORALOGIX_PUBLIC_KEY: z.optional(z.string()),
  CS_PUBLIC_DELAY_TIME_MANAGE_SUBSCRIPTION: envNumDefault("4000"),
  CS_PUBLIC_ENV_NAME: z.optional(
    z.enum(
      ["dev", "staging", "production"] as const,
      'CS_PUBLIC_ENV_NAME must be one of "dev", "staging", "production"'
    )
  ),
  CS_PUBLIC_FIREBASE_AUTH_CONFIG: z.optional(envJsonString()),
  CS_PUBLIC_FIREBASE_REMOTE_CONFIG_INTERVAL_FETCH: z.optional(envNum()),
  CS_PUBLIC_FIREBASE_VAPID_KEY: z.optional(z.string()),
  CS_PUBLIC_GOOGLE_OAUTH_CLIENT_ID: z.optional(z.string()),
  CS_PUBLIC_ORDER_SERVICE_URL: z.optional(envUrl()),
  CS_PUBLIC_PADDLE_CLIENT_TOKEN: z.optional(z.string()),
  CS_PUBLIC_PAYMENT_SERVICE_URL: z.optional(envUrl()),
  CS_PUBLIC_PRODUCT_SERVICE_URL: z.optional(envUrl()),
  CS_PUBLIC_SITE_URL: z.optional(z.string()),
  CS_PUBLIC_SMITH_ENGINE_SERVICE_URL: z.optional(envUrl()),
  CS_PUBLIC_SUBSCRIPTION_SERVICE_URL: z.optional(envUrl()),
  CS_PUBLIC_TURNSTILE_CAPTCHA_SITEKEY: z.optional(z.string()),
  CS_PUBLIC_USER_MANAGEMENT_SERVICE_URL: z.optional(envUrl()),
  CS_PUBLIC_WEB_URL: z.optional(envUrl()),
} as const;

export type PublicEnv = {
  readonly [K in keyof typeof publicSchemaEntries]: z.infer<
    (typeof publicSchemaEntries)[K]
  >;
};

// Self-check only — not exported. Nothing outside this module needs to call
// it; it just asserts the schema above honors its own naming convention.
const assertAllPublic = (): void => {
  for (const key of Object.keys(publicSchemaEntries)) {
    if (!key.startsWith(CS_PUBLIC_PREFIX)) {
      throw new Error(
        `[@cs/env] schema key "${key}" must start with ${CS_PUBLIC_PREFIX}.`
      );
    }
  }
};

assertAllPublic();
