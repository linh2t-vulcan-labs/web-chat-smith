# @cs/firebase

App bootstrap and auth for Firebase — the shared foundation `@cs/flags` and `@cs/notifications` build on.

## Why this exists

Before this package, every app that touched Firebase re-implemented its own `getFirebaseApp()`/`getFirebaseAuth()` singletons, re-exported the whole Firebase Auth SDK from the same module as unrelated features (Remote Config), and manually diffed `localStorage` to track the signed-in user. This package is just the small, reusable slice: one singleton app, one singleton auth client, and helpers for decoding an ID token's claims.

## Usage

`@cs/env`'s shared schema already declares the Firebase web config as one JSON-string var — `CS_PUBLIC_FIREBASE_AUTH_CONFIG` (validated there only as "parses as JSON", not the Firebase shape). `getFirebaseConfigFromEnv()` reads and parses it in one call (it's a thin wrapper around `@cs/env/universal`'s `getRuntimeEnv()` + `@cs/env/helpers`'s `requireServerVar()`, so `@cs/firebase` depends on `@cs/env` directly — no per-app glue needed):

```ts
// lib/firebase.ts
import { getFirebaseApp } from "@cs/firebase";
import { getFirebaseAuth } from "@cs/firebase/auth";
import { getFirebaseConfigFromEnv } from "@cs/firebase/config";

// Call these inside a function, not at module top-level — same rule as
// `getRuntimeEnv()` itself (see @cs/env/client's doc comment).
export const getApp = () => getFirebaseApp(getFirebaseConfigFromEnv());
export const getAuth = () => getFirebaseAuth(getApp());
```

If you need to source the raw config string from somewhere other than `@cs/env` (a test double, a non-`@cs/env` app), use the lower-level `parseFirebaseConfig(rawJsonString)` instead.

## Social sign-in

```ts
import { getAuthProvider } from "@cs/firebase/auth";
import { signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

await signInWithPopup(auth, getAuthProvider("google"));
```

## Decoding an ID token

```ts
import { decodeFirebaseToken, extractUserId } from "@cs/firebase/auth";

const decoded = decodeFirebaseToken(idToken); // -> { ...claims, providerKind } | null
const uid = extractUserId(idToken); // -> string, "" if malformed
```

## Integrating with `@cs/api-client`'s session (important)

`@cs/api-client` already owns a complete, working auth session — an httpOnly-cookie access/refresh token pair, a browser-tab `TokenManager` singleton, automatic 401-retry-once, and BFF/Server Component fetch helpers. It is **deliberately Firebase-agnostic**: it never imports the Firebase SDK and only expects to be handed a raw Firebase ID token once, to exchange for its own session.

**This package does not do that exchange for you.** `AuthProvider`/`useAuth` here only mirror Firebase's own client-side auth state (`onAuthStateChanged`) — they are the _identity source_, not the session. Wiring the two together is app-level glue, and `apps/web` already has the pieces: after `signInWithPopup`/`onAuthStateChanged` gives you a Firebase user, get its ID token and POST it to the app's own `/api/auth/session` route (which calls `@cs/api-client`'s `userManagement.verifyOAuthToken` and sets the session cookies), then feed the response into `@cs/api-client`'s `TokenManager` (via `useApiAuth`/`ApiAuthProvider`, already mounted in `apps/web`'s locale layout) — see `apps/web/app/api/auth/session/route.ts` and `packages/api-client/src/core/token-manager.ts`'s `setSession()` for the exact contract. Don't reimplement token exchange, cookie-setting, or refresh here — that would create a second, divergent session mechanism.

## Exports

| Entry point | Contents |
| --- | --- |
| `@cs/firebase` | `getFirebaseApp` |
| `@cs/firebase/auth` | `getFirebaseAuth`, `getAuthProvider`, `getGoogleAuthProvider`/`getAppleAuthProvider`/`getFacebookAuthProvider`, `decodeFirebaseToken`, `extractUserId` |
| `@cs/firebase/config` | `getFirebaseConfigFromEnv`, `parseFirebaseConfig` |
