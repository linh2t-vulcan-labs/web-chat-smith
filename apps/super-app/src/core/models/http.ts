import type { TFetchError } from "@/utils/commons/error";

export type TMethod = "GET" | "POST" | "PUT" | "DELETE";
export type THeadersHttp = Record<string, string | undefined>;
export type TBodyHttp = XMLHttpRequestBodyInit;
export type TResponse<T> = [null, T] | [TFetchError, null];

export type TResult<T> = Promise<TResponse<T>>;

export type TFetchRequestInterceptor = (
  method: TMethod,
  path: string,
  options: TOptions
) => Promise<[string, TOptions]>;

export type TFetchResponseInterceptor = <T>(
  res: Response,
  config: { method: TMethod; path: string; options: TOptions }
) => Promise<TResponse<T>>;

export type TOptions = Omit<RequestInit, "method" | "body" | "headers"> & {
  baseURL?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- accepts arbitrary DTO classes without index signatures; Record<string, unknown> breaks structural assignability for every caller.
  body?: Record<string, any> | string | FormData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see body above.
  params?: Record<string, any>;
  headers?: THeadersHttp;
  enabledAuth?: boolean;
  enabledRefreshToken?: boolean;
  enabledFlattenData?: boolean;
  enabledHandleAuthError?: boolean;
  hasRetried?: boolean;
  withCredentials?: boolean;
};

export interface THttp {
  get: <T>(path: string, options?: TOptions) => Promise<TResponse<T>>;
  post: <T>(path: string, options?: TOptions) => Promise<TResponse<T>>;
  delete: <T>(
    path: string,
    headers?: THeadersHttp,
    body?: TBodyHttp
  ) => Promise<TResponse<T>>;
  put: <T>(path: string, options?: TOptions) => Promise<TResponse<T>>;
  patch: <T>(path: string, options?: TOptions) => Promise<TResponse<T>>;
}

export interface TAxiosClientOptions {
  baseUrl?: string;
}
