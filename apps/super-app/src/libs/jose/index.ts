import { env } from "@cs/env";
import { EncryptJWT, jwtDecrypt } from "jose";

/**
 * JOSE-based encryption utility for secure cookie storage
 * Uses AES-GCM encryption for sensitive authentication data
 */
export class JoseEncryption {
  private static readonly ALGORITHM = "dir";
  private static readonly ISSUER_AUTH = "vulcan-auth-v2";
  private static readonly ISSUER_GUEST = "vulcan-guest-session";

  /**
   * Creates a secret key from a given secret string
   * Supports both base64 and hex encoding
   */
  private static createSecretKey(
    secret: string,
    encoding: "base64" | "hex" = "base64"
  ): Uint8Array {
    if (!secret) {
      throw new Error("Secret key is required for JOSE encryption");
    }

    try {
      const decoded = Buffer.from(secret, encoding);
      if (decoded.length !== 32) {
        throw new Error(
          `Invalid secret key length: expected 32 bytes, got ${decoded.length} bytes`
        );
      }
      return new Uint8Array(decoded);
    } catch (error) {
      throw new Error(
        `Invalid secret key format (${encoding}): ${error instanceof Error ? error.message : "Unknown error"}`,
        { cause: error }
      );
    }
  }

  /**
   * Gets the auth-v2 secret key (JWT_SECRET)
   */
  private static getAuthSecretKey(): Uint8Array {
    return this.createSecretKey(env.JWT_SECRET ?? "", "base64");
  }

  /**
   * Gets the guest session secret key (GUEST_SESSION_SECRET_KEY)
   */
  private static getGuestSecretKey(): Uint8Array {
    return this.createSecretKey(env.GUEST_SESSION_SECRET_KEY ?? "", "hex");
  }

  /**
   * Generic session encryption - can be used for any session data
   * @param data - Session data to encrypt
   * @param secretKey - Secret key to use for encryption
   * @param issuer - Issuer identifier
   * @param maxAge - Maximum age in seconds
   * @returns Encrypted JWT token
   */
  static async encryptSession<T extends object>(
    data: T,
    secretKey: Uint8Array,
    issuer: string,
    maxAge: number
  ): Promise<string> {
    try {
      const encryptedToken = await new EncryptJWT({
        ...data,
        iat: Math.floor(Date.now() / 1000),
      })
        .setProtectedHeader({ alg: this.ALGORITHM, enc: "A256GCM" })
        .setIssuedAt()
        .setExpirationTime(`${maxAge}s`)
        .setIssuer(issuer)
        .encrypt(secretKey);

      return encryptedToken;
    } catch (error) {
      console.error("[JoseEncryption] Failed to encrypt session:", error);
      throw new Error("Failed to encrypt session data", { cause: error });
    }
  }

  /**
   * Generic session decryption
   * @param encryptedToken - Encrypted JWT token
   * @param secretKey - Secret key to use for decryption
   * @param issuer - Expected issuer identifier
   * @returns Decrypted session data
   */
  static async decryptSession<T = unknown>(
    encryptedToken: string,
    secretKey: Uint8Array,
    issuer: string
  ): Promise<T | null> {
    try {
      const { payload } = await jwtDecrypt(encryptedToken, secretKey, {
        issuer,
      });

      // Remove JWT metadata fields
      const { iat: _iat, exp: _exp, iss: _iss, ...sessionData } = payload;

      return sessionData as T;
    } catch (error) {
      console.error("[JoseEncryption] Failed to decrypt session:", error);
      return null;
    }
  }

  /**
   * Encrypts authentication data for secure cookie storage (auth-v2)
   * @param data - Authentication data to encrypt
   * @returns Encrypted JWT token
   */
  static async encryptAuthData(data: {
    userId: string;
    accessToken: string;
    refreshToken: string;
    expiresAt?: number;
  }): Promise<string> {
    try {
      const secretKey = this.getAuthSecretKey();

      return await this.encryptSession(
        data,
        secretKey,
        this.ISSUER_AUTH,
        env.JWT_MAX_AGE_SESSION
      );
    } catch (error) {
      console.error("[JoseEncryption] Failed to encrypt auth data:", error);
      throw new Error("Failed to encrypt authentication data", {
        cause: error,
      });
    }
  }

  /**
   * Encrypts guest session data
   * @param data - Guest session data to encrypt
   * @returns Encrypted JWT token
   */
  static async encryptGuestSession<T extends object>(data: T): Promise<string> {
    try {
      const secretKey = this.getGuestSecretKey();

      return await this.encryptSession(
        data,
        secretKey,
        this.ISSUER_GUEST,
        env.GUEST_SESSION_MAX_AGE
      );
    } catch (error) {
      console.error("[JoseEncryption] Failed to encrypt guest session:", error);
      throw new Error("Failed to encrypt guest session data", { cause: error });
    }
  }

  /**
   * Decrypts guest session data
   * @param encryptedToken - Encrypted JWT token
   * @returns Decrypted guest session data
   */
  static async decryptGuestSession<T = unknown>(
    encryptedToken: string
  ): Promise<T | null> {
    try {
      const secretKey = this.getGuestSecretKey();

      return await this.decryptSession<T>(
        encryptedToken,
        secretKey,
        this.ISSUER_GUEST
      );
    } catch (error) {
      console.error("[JoseEncryption] Failed to decrypt guest session:", error);
      return null;
    }
  }

  /**
   * Decrypts authentication data from secure cookie (auth-v2)
   * @param encryptedToken - Encrypted JWT token
   * @returns Decrypted authentication data
   */
  static async decryptAuthData(encryptedToken: string): Promise<{
    userId: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  } | null> {
    try {
      const secretKey = this.getAuthSecretKey();

      // Try to decrypt as JWE first (encrypted JWT)
      const { payload } = await jwtDecrypt(encryptedToken, secretKey, {
        issuer: this.ISSUER_AUTH,
      });

      // Validate required fields
      if (!payload.userId || !payload.accessToken || !payload.refreshToken) {
        console.warn("[JoseEncryption] Invalid payload structure");
        return null;
      }

      const expiresAt =
        (payload.expiresAt as number) ||
        (payload.exp === undefined ? undefined : payload.exp * 1000);

      if (expiresAt === undefined) {
        throw new Error(
          "Decrypted auth payload is missing both expiresAt and exp"
        );
      }

      return {
        accessToken: payload.accessToken as string,
        expiresAt,
        refreshToken: payload.refreshToken as string,
        userId: payload.userId as string,
      };
    } catch (error) {
      console.error("[JoseEncryption] Failed to decrypt auth data:", error);
      return null;
    }
  }

  /**
   * Validates if an encrypted token is expired
   * @param encryptedToken - Encrypted JWT token
   * @returns True if token is expired, false otherwise
   */
  static async isTokenExpired(encryptedToken: string): Promise<boolean> {
    try {
      const authData = await this.decryptAuthData(encryptedToken);
      if (!authData) {
        return true;
      }

      return Date.now() > authData.expiresAt;
    } catch (error) {
      console.error(
        "[JoseEncryption] Failed to check token expiration:",
        error
      );
      return true;
    }
  }

  /**
   * Extracts only the refresh token from encrypted data
   * @param encryptedToken - Encrypted JWT token
   * @returns Refresh token or null if decryption fails
   */
  static async extractRefreshToken(
    encryptedToken: string
  ): Promise<string | null> {
    try {
      const authData = await this.decryptAuthData(encryptedToken);
      return authData?.refreshToken || null;
    } catch (error) {
      console.error("[JoseEncryption] Failed to extract refresh token:", error);
      return null;
    }
  }

  /**
   * Extracts only the access token from encrypted data
   * @param encryptedToken - Encrypted JWT token
   * @returns Access token or null if decryption fails
   */
  static async extractAccessToken(
    encryptedToken: string
  ): Promise<string | null> {
    try {
      const authData = await this.decryptAuthData(encryptedToken);
      return authData?.accessToken || null;
    } catch (error) {
      console.error("[JoseEncryption] Failed to extract access token:", error);
      return null;
    }
  }

  /**
   * Extracts only the user ID from encrypted data
   * @param encryptedToken - Encrypted JWT token
   * @returns User ID or null if decryption fails
   */
  static async extractUserId(encryptedToken: string): Promise<string | null> {
    try {
      const authData = await this.decryptAuthData(encryptedToken);
      return authData?.userId || null;
    } catch (error) {
      console.error("[JoseEncryption] Failed to extract user ID:", error);
      return null;
    }
  }

  /**
   * Updates specific fields in encrypted auth data
   * @param encryptedToken - Current encrypted token
   * @param updates - Fields to update
   * @returns New encrypted token with updated data
   */
  static async updateAuthData(
    encryptedToken: string,
    updates: {
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: number;
    }
  ): Promise<string | null> {
    try {
      const currentData = await this.decryptAuthData(encryptedToken);
      if (!currentData) {
        return null;
      }

      const { expiresAt: _previousExpiresAt, ...restCurrentData } = currentData;
      const updatedData = {
        ...restCurrentData,
        ...updates,
      };

      return await this.encryptAuthData(updatedData);
    } catch (error) {
      console.error("[JoseEncryption] Failed to update auth data:", error);
      return null;
    }
  }
}
