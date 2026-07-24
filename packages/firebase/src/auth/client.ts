import type { FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import type { Auth } from "firebase/auth";

let cachedAuth: Auth | null = null;

/**
 * Lazily creates (or reuses) the singleton `Auth` instance for `app`.
 *
 * Kept separate from {@link getFirebaseApp} so routes that never touch auth
 * don't eagerly trigger `getAuth()`'s iframe/network setup on every render.
 */
export const getFirebaseAuth = (app: FirebaseApp): Auth => {
  cachedAuth ??= getAuth(app);
  return cachedAuth;
};
