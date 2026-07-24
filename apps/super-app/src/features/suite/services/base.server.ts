import "server-only";
import { publicEnv } from "@cs/env/server";

import type { ITokenHandler } from "@/core/models/token-handler";
import type { SuiteHttp } from "@/features/suite/types/http";
import { AxiosClientBase, HttpBase } from "@/libs/axios";

export function createSuiteServerHttp(accessToken: string): SuiteHttp {
  const tokenHandler: ITokenHandler = {
    clearAccessToken: () => {
      // Intentional no-op: nothing to clear on the server.
    },
    clearAll: () => {
      // Intentional no-op: nothing to clear on the server.
    },
    getAccessToken: () => accessToken,
    refreshToken: () =>
      Promise.resolve({
        accessToken: "",
        error: new Error("no refresh on server"),
      }),
    setAccessToken: () => {
      // Intentional no-op: access token is fixed for the lifetime of a server request.
    },
  };

  const instance = new AxiosClientBase(tokenHandler, {
    baseUrl: publicEnv.CS_PUBLIC_API_BASE_URL,
  }).getInstance();

  instance.defaults.headers.common["Cache-Control"] = "no-cache";

  return new HttpBase(instance) as unknown as SuiteHttp;
}
