import { getRuntimeEnv } from "@cs/env/universal";
import type { AxiosInstance } from "axios";

import { authTokenManager, guestTokenManager } from "@/core/repositories";
import { AxiosClientBase, HttpBase } from "@/libs/axios";

type THttpClientMode = "guest" | "auth";

interface TClientBundle {
  httpClient: HttpBase;
  axiosInstance: AxiosInstance;
}

// Lazily constructed on first `useHttpClient()` call, not at module scope —
// CS_PUBLIC_API_BASE_URL isn't available until window.__CS_ENV__ (client) or
// process.env (server) is read, and Next evaluates a module's top-level
// scope during the build, before either exists.
let guestClient: TClientBundle | null = null;
let authClient: TClientBundle | null = null;

const getGuestClient = (): TClientBundle => {
  if (!guestClient) {
    const axiosInstance = new AxiosClientBase(guestTokenManager, {
      baseUrl: getRuntimeEnv().CS_PUBLIC_API_BASE_URL,
    }).getInstance();
    guestClient = { axiosInstance, httpClient: new HttpBase(axiosInstance) };
  }
  return guestClient;
};

const getAuthClient = (): TClientBundle => {
  if (!authClient) {
    const axiosInstance = new AxiosClientBase(authTokenManager, {
      baseUrl: getRuntimeEnv().CS_PUBLIC_API_BASE_URL,
    }).getInstance();
    authClient = { axiosInstance, httpClient: new HttpBase(axiosInstance) };
  }
  return authClient;
};

export const useHttpClient = (mode: THttpClientMode = "auth") =>
  mode === "auth" ? getAuthClient() : getGuestClient();
