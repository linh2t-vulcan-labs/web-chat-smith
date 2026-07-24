import { getApps, initializeApp } from "firebase/app";
import type { FirebaseApp, FirebaseOptions } from "firebase/app";

let cachedApp: FirebaseApp | null = null;

/**
 * Lazily creates (or reuses) the singleton `FirebaseApp` for this process.
 *
 * The config is always supplied by the caller — this package never reads
 * `process.env` itself, so it stays testable and works the same in every
 * runtime (browser, SSR, edge). Reuses an already-initialized app instead of
 * calling `initializeApp` twice (which throws), which matters in Next.js dev
 * mode where modules can re-evaluate across HMR/SSR boundaries.
 */
export const getFirebaseApp = (config: FirebaseOptions): FirebaseApp => {
  if (cachedApp) {
    return cachedApp;
  }
  const [existing] = getApps();
  cachedApp = existing ?? initializeApp(config);
  return cachedApp;
};
