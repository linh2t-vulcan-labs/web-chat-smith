import { InvalidTokenError } from "./types";
import type { JwtDecodeOptions, JwtHeader, JwtPayload } from "./types";

const b64DecodeUnicode = (str: string) =>
  decodeURIComponent(
    atob(str).replaceAll(/(?<char>.)/gu, (m, p) => {
      let code = (p as string).codePointAt(0)?.toString(16).toUpperCase();
      if ((code?.length ?? 0) < 2) {
        code = `0${code}`;
      }
      return `%${code}`;
    })
  );

const base64UrlDecode = (str: string) => {
  let output = str.replaceAll("-", "+").replaceAll("_", "/");
  switch (output.length % 4) {
    case 0: {
      break;
    }
    case 2: {
      output += "==";
      break;
    }
    case 3: {
      output += "=";
      break;
    }
    default: {
      throw new Error("base64 string is not of the correct length");
    }
  }

  try {
    return b64DecodeUnicode(output);
  } catch {
    return atob(output);
  }
};

const getTokenPart = (token: string, pos: number): string => {
  const part = token.split(".")[pos];
  if (typeof part !== "string") {
    throw new InvalidTokenError(
      `Invalid token specified: missing part #${pos + 1}`
    );
  }
  return part;
};

const decodeTokenPart = (part: string, pos: number): string => {
  try {
    return base64UrlDecode(part);
  } catch (error) {
    throw new InvalidTokenError(
      `Invalid token specified: invalid base64 for part #${pos + 1} (${(error as Error).message})`
    );
  }
};

const parseTokenPart = <T>(decoded: string, pos: number): T => {
  try {
    return JSON.parse(decoded) as T;
  } catch (error) {
    throw new InvalidTokenError(
      `Invalid token specified: invalid json for part #${pos + 1} (${(error as Error).message})`
    );
  }
};

/**
 * Dependency-free JWT decode (header or payload — no signature verification,
 * this is a client-side read of an already-trusted token). Kept as this
 * repo's single implementation instead of the `jwt-decode` npm package so
 * every consumer shares one, audited code path.
 */
export function jwtDecode<T = JwtHeader>(
  token: string,
  options: JwtDecodeOptions & { header: true }
): T;
export function jwtDecode<T = JwtPayload>(
  token: string,
  options?: JwtDecodeOptions
): T;
export function jwtDecode<T = JwtHeader | JwtPayload>(
  token: string,
  options?: JwtDecodeOptions
): T {
  if (typeof token !== "string") {
    throw new InvalidTokenError("Invalid token specified: must be a string");
  }

  const pos = options?.header === true ? 0 : 1;
  const part = getTokenPart(token, pos);
  const decoded = decodeTokenPart(part, pos);
  return parseTokenPart<T>(decoded, pos);
}

/** Only used if a token somehow fails to decode — should not happen in practice. */
const FALLBACK_TTL_MS = 60_000;

/**
 * Decodes a JWT's `exp` claim into an absolute epoch-ms expiry. Falls back to
 * "expires in 60s" if the token has no `exp` or fails to decode, so a caller
 * always gets a usable (if conservative) expiry instead of having to handle
 * a thrown error on the hot path.
 */
export const decodeJwtExpiryMs = (token: string): number => {
  try {
    const decoded = jwtDecode<{ exp?: number }>(token);
    if (decoded.exp) {
      return decoded.exp * 1000;
    }
  } catch {
    // fall through to fallback below
  }
  return Date.now() + FALLBACK_TTL_MS;
};
