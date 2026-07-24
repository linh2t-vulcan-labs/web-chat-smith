import { getFirebaseApp } from "@cs/firebase";
import { getFirebaseAuth, getGoogleAuthProvider } from "@cs/firebase/auth";
import { getFirebaseConfigFromEnv } from "@cs/firebase/config";

/**
 * Single shared Firebase app/auth instance for this app — both `@cs/flags`
 * and `@cs/notifications` need the same `FirebaseApp`, so every consumer
 * goes through these getters instead of calling `getFirebaseApp` a second time.
 * Called lazily (never at module top-level) since `getFirebaseConfigFromEnv`
 * reads `window.__CS_ENV__`, which doesn't exist yet during the client
 * module's build-time top-level evaluation.
 */
export const firebaseApp = () => getFirebaseApp(getFirebaseConfigFromEnv());

export const firebaseAuth = () => getFirebaseAuth(firebaseApp());

export const googleAuthProvider = () => getGoogleAuthProvider();
