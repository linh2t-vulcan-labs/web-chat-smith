import { getRuntimeEnv } from "@cs/env/universal";

import { authTokenManager } from "@/core/repositories";
import { SUITE_CREATIVE_STUDIO_API_BASE_PATH } from "@/features/suite/api/endpoints";
import type { SuiteHeadersHttp, SuiteHttp } from "@/features/suite/types/http";
import { AxiosClientBase, HttpBase } from "@/libs/axios";
import { HTTP_STATUS } from "@/utils/constants/http";

// Lazily constructed on first access, not at module scope —
// CS_PUBLIC_API_BASE_URL isn't available until window.__CS_ENV__ (client) or
// process.env (server) is read, and Next evaluates a module's top-level
// scope during the build, before either exists.
let cachedSuiteHttpClient: SuiteHttp | null = null;

function getSuiteHttpClient(): SuiteHttp {
  if (!cachedSuiteHttpClient) {
    cachedSuiteHttpClient = new HttpBase(
      new AxiosClientBase(authTokenManager, {
        baseUrl: getRuntimeEnv().CS_PUBLIC_API_BASE_URL,
      }).getInstance()
    ) as unknown as SuiteHttp;
  }
  return cachedSuiteHttpClient;
}

export const suiteHttpClient: SuiteHttp = new Proxy({} as SuiteHttp, {
  get(_target, prop) {
    const instance = getSuiteHttpClient() as unknown as object;
    const value = Reflect.get(instance, prop);
    // Methods on the real instance close over `this` — rebind so calling
    // `suiteHttpClient.get(...)` doesn't run with the empty proxy target as
    // `this`.
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

function createSuiteCreativePath(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const relativePath =
    normalizedPath === SUITE_CREATIVE_STUDIO_API_BASE_PATH ||
    normalizedPath.startsWith(`${SUITE_CREATIVE_STUDIO_API_BASE_PATH}/`)
      ? normalizedPath
      : `${SUITE_CREATIVE_STUDIO_API_BASE_PATH}${normalizedPath}`;

  const baseUrl = getRuntimeEnv().CS_PUBLIC_API_BASE_URL ?? "";
  return `${baseUrl}${relativePath}`;
}

function compactHeaders(headers: SuiteHeadersHttp): Record<string, string> {
  const acc: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) {
      acc[key] = value;
    }
  }

  return acc;
}

function createSuiteAuthHeaders(
  headers: SuiteHeadersHttp = {}
): Record<string, string> {
  const accessToken = authTokenManager.getAccessToken();

  return compactHeaders({
    ...headers,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  });
}

export type TSuiteCreativeStreamFetchInit = Omit<RequestInit, "headers"> & {
  headers?: SuiteHeadersHttp;
};

function fetchSuiteCreativeStreamOnce(
  path: string,
  init: TSuiteCreativeStreamFetchInit = {}
): Promise<Response> {
  const { headers, ...restInit } = init;

  return fetch(createSuiteCreativePath(path), {
    ...restInit,
    headers: createSuiteAuthHeaders({
      Accept: "text/event-stream",
      ...headers,
    }),
  });
}

export async function fetchSuiteCreativeStream(
  path: string,
  init: TSuiteCreativeStreamFetchInit = {}
): Promise<Response> {
  const response = await fetchSuiteCreativeStreamOnce(path, init);

  if (response.status !== HTTP_STATUS.UNAUTHORIZED) {
    return response;
  }

  const refreshSession = await authTokenManager.refreshToken();

  if (!refreshSession?.accessToken || refreshSession.error) {
    return response;
  }

  return fetchSuiteCreativeStreamOnce(path, init);
}
