import { CoralogixEventType } from "@coralogix/browser";
import type { CoralogixBrowserSdkConfig } from "@coralogix/browser";
import { getPublicEnv } from "@cs/env/client";

const INTERVAL_TIME_MEMORY_USAGE = 60 * 1000 * 5; // 5 mins
const SESSIONS_SAMPLE_RATE = 10; // 10% sessions will be recorded
const MAX_RUM_EVENTS = 5000;
const MAX_RECORD_TIME = 10_000;

// Called lazily from coralogix/index.tsx's effect, never at module scope —
// CS_PUBLIC_* isn't available until window.__CS_ENV__ is read.
const createColoragixEnvs = (): CoralogixBrowserSdkConfig => {
  const env = getPublicEnv();
  const CS_PUBLIC_CORALOGIX_ENVIRONMENT =
    env.CS_PUBLIC_CORALOGIX_ENVIRONMENT ?? "";
  const CS_PUBLIC_CORALOGIX_APP_VERSION =
    env.CS_PUBLIC_CORALOGIX_APP_VERSION ?? "";
  const CS_PUBLIC_CORALOGIX_APPLICATION_NAME =
    env.CS_PUBLIC_CORALOGIX_APPLICATION_NAME ?? "";
  const CS_PUBLIC_CORALOGIX_PUBLIC_KEY =
    env.CS_PUBLIC_CORALOGIX_PUBLIC_KEY ?? "";
  const CS_PUBLIC_CORALOGIX_ACCOUNT_DOMAIN =
    env.CS_PUBLIC_CORALOGIX_ACCOUNT_DOMAIN ?? "";

  const coralogixConfigs: CoralogixBrowserSdkConfig = {
    application: CS_PUBLIC_CORALOGIX_APPLICATION_NAME,
    coralogixDomain:
      CS_PUBLIC_CORALOGIX_ACCOUNT_DOMAIN as CoralogixBrowserSdkConfig["coralogixDomain"],
    environment: CS_PUBLIC_CORALOGIX_ENVIRONMENT,
    ignoreUrls: [
      // Image files
      /\b[^/]+\.svg$/u,
      /\b[^/]+\.webp$/u,
      /\b[^/]+\.png$/u,
      /\b[^/]+\.jpg$/u,
      /\b[^/]+\.jpeg$/u,
      /\b[^/]+\.gif$/u,
      /\b[^/]+\.ico$/u,
      /\b[^/]+\.bmp$/u,
      /\b[^/]+\.tiff?$/u,

      // Google Analytics & Tag Manager
      /google-analytics\.com/u,
      /googletagmanager\.com/u,
      /google\.com\/analytics/u,
      /gtag\.js/u,
      /gtm\.js/u,

      // Other tracking services
      /facebook\.net/u,
      /doubleclick\.net/u,
      /googlesyndication\.com/u,
      /googletagservices\.com/u,
      /googleadservices\.com/u,
    ],
    memoryUsageConfig: {
      enabled: true,
      interval: INTERVAL_TIME_MEMORY_USAGE,
    },
    public_key: CS_PUBLIC_CORALOGIX_PUBLIC_KEY,
    sessionConfig: {
      alwaysTrackSessionsWithErrors: true, // Always capture sessions with errors regardless of sampling
      onlyWithErrorConfig: {
        enable: true, // Focus on error sessions for production monitoring
        /**
         * Production-optimized instrumentation: Only send essential data for error analysis
         * This reduces payload size while maintaining error diagnostic capabilities
         */
        instrumentationsToSend: {
          [CoralogixEventType.WEB_VITALS]: true, // Core performance metrics
        },
        maxRecordTime: MAX_RECORD_TIME, // Record 10 seconds before error for context
        maxRumEvents: MAX_RUM_EVENTS, // Cache up to 5000 events before error occurs,
      },
      sessionSampleRate: SESSIONS_SAMPLE_RATE, // 50% of sessions sampled for performance,
    },
    version: CS_PUBLIC_CORALOGIX_APP_VERSION,
  };

  return coralogixConfigs;
};

export { createColoragixEnvs };
