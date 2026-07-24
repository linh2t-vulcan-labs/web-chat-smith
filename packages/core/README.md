# @cs/core

Shared, dependency-free TypeScript utilities used by more than one workspace package — the home for cross-cutting helpers that don't belong to any single product domain.

## Why this exists

`decodeJwtExpiryMs`/`jwtDecode` were implemented independently in `@cs/api-client` (hand-rolled, no npm dependency) while `@cs/firebase` separately pulled in the `jwt-decode` npm package for the same job. Two implementations of "decode a JWT" is a real correctness risk (subtly different edge-case behavior, e.g. base64url handling), not just duplicated bytes. `@cs/core` is the single place this kind of utility lives once a second real consumer needs it — not a proactive grab-bag of "utils we might need later."

## Scope

Deliberately narrow and organized one subfolder per concern (`src/jwt/`, and more added the same way as new cross-cutting needs appear) rather than one flat `utils.ts` — mirrors how `@cs/validation`/`@cs/env` are scoped, not a monolithic dumping ground. A utility only moves here once **two** packages need it; a helper used by exactly one package stays local to that package.

## Usage

```ts
import { jwtDecode, decodeJwtExpiryMs } from "@cs/core/jwt";

const payload = jwtDecode<{ sub: string }>(token);
const expiresAtMs = decodeJwtExpiryMs(token);
```

## Exports

| Entry point | Contents |
| --- | --- |
| `@cs/core/jwt` | `jwtDecode`, `decodeJwtExpiryMs`, `JwtHeader`, `JwtPayload`, `JwtDecodeOptions`, `InvalidTokenError` |
