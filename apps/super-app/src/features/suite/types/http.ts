export interface SuiteFetchError {
  status: number;
  message: string;
  error?: {
    reason?: string;
    [key: string]: unknown;
  };
}

export type SuiteResponse<T> = [null, T | null] | [SuiteFetchError, null];

export type SuiteResult<T> = Promise<SuiteResponse<T>>;

export type SuiteHeadersHttp = Record<string, string | undefined>;

export type SuiteBodyHttp = XMLHttpRequestBodyInit;

export type SuiteOptions = Omit<RequestInit, "method" | "body" | "headers"> & {
  baseURL?: string;
  body?: Record<string, unknown> | string | FormData;
  params?: Record<string, unknown>;
  headers?: SuiteHeadersHttp;
  enabledAuth?: boolean;
  enabledRefreshToken?: boolean;
  enabledFlattenData?: boolean;
  enabledHandleAuthError?: boolean;
  hasRetried?: boolean;
  withCredentials?: boolean;
};

export interface SuiteHttp {
  get: <T>(path: string, options?: SuiteOptions) => Promise<SuiteResponse<T>>;
  post: <T>(path: string, options?: SuiteOptions) => Promise<SuiteResponse<T>>;
  delete: <T>(
    path: string,
    headers?: SuiteHeadersHttp,
    body?: SuiteBodyHttp
  ) => Promise<SuiteResponse<T>>;
  put: <T>(path: string, options?: SuiteOptions) => Promise<SuiteResponse<T>>;
  patch: <T>(path: string, options?: SuiteOptions) => Promise<SuiteResponse<T>>;
}
