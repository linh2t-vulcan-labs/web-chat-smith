import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  GenericAbortSignal,
  InternalAxiosRequestConfig,
} from "axios";
import { AxiosError, AxiosHeaders, create } from "axios";

import type { TErrorResponseDTO } from "@/core/http/dto/http-response";
import type {
  TAxiosClientOptions,
  TOptions,
  TResponse,
} from "@/core/models/http";
import type { ITokenHandler } from "@/core/models/token-handler";
import type { TFetchErrorDetail } from "@/utils/commons/error";
import { THttpError } from "@/utils/commons/error";
import { AUTH_ERROR_REASON } from "@/utils/constants/error";
import { HTTP_STATUS } from "@/utils/constants/http";

const DEFAULT_TIMEOUT = 60 * 1.5 * 1000; // 90s

const BASE_HEADERS_CONFIG = { "Content-Type": "application/json" };
const BASE_SERVER_HEADERS_CONFIG = {
  ...BASE_HEADERS_CONFIG,
  "User-Agent": "web",
};

type TRefreshSession = Awaited<ReturnType<ITokenHandler["refreshToken"]>>;

class AxiosClientBase {
  private readonly axiosInstance: AxiosInstance;
  private readonly tokenHandler: ITokenHandler;
  private readonly options?: TAxiosClientOptions;
  private static readonly refreshPromiseMap = new WeakMap<
    ITokenHandler,
    Promise<TRefreshSession>
  >();

  constructor(tokenHandler: ITokenHandler, options?: TAxiosClientOptions) {
    this.tokenHandler = tokenHandler;
    this.options = options;
    this.axiosInstance = create({
      baseURL: options?.baseUrl,
      headers: BASE_HEADERS_CONFIG,
      timeout: DEFAULT_TIMEOUT,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const accessToken = this.tokenHandler.getAccessToken();

        if (accessToken) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error: AxiosError) => {
        throw error;
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => this.handleErrorResponseInterceptor(error)
    );
  }

  private static setAuthorizationHeader(
    request: InternalAxiosRequestConfig,
    token: string
  ) {
    request.headers["Authorization"] = `Bearer ${token}`;
  }

  private getRefreshPromise() {
    return AxiosClientBase.refreshPromiseMap.get(this.tokenHandler) || null;
  }

  private setRefreshPromise(refreshPromise: Promise<TRefreshSession>) {
    AxiosClientBase.refreshPromiseMap.set(this.tokenHandler, refreshPromise);
  }

  private clearRefreshPromise() {
    AxiosClientBase.refreshPromiseMap.delete(this.tokenHandler);
  }

  private async handleExpireSession() {
    this.clearRefreshPromise();
    await this.tokenHandler.onExpire?.();
  }

  private async handleErrorResponseInterceptor(error: AxiosError) {
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      const errorResponse = error.response.data as TErrorResponseDTO;

      if (errorResponse.reason === AUTH_ERROR_REASON.USER_DEACTIVATED) {
        await this.handleExpireSession();
        throw error;
      }

      return await this.handleRefreshToken(error);
    }

    throw error.response?.data;
  }

  private async handleRefreshToken(error: AxiosError) {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    if (originalRequest._retry) {
      await this.handleExpireSession();
      throw error;
    }

    originalRequest._retry = true;

    let refreshPromise = this.getRefreshPromise();
    const shouldStartRefresh = !refreshPromise;
    if (shouldStartRefresh) {
      refreshPromise = this.tokenHandler.refreshToken();
      this.setRefreshPromise(refreshPromise);
    }

    try {
      const newSession = await refreshPromise;
      const hasValidAccessToken = Boolean(newSession?.accessToken);
      const hasRefreshError = Boolean(newSession?.error);

      if (!newSession || !hasValidAccessToken || hasRefreshError) {
        if (shouldStartRefresh) {
          await this.handleExpireSession();
        }
        throw error;
      }

      AxiosClientBase.setAuthorizationHeader(
        originalRequest,
        newSession?.accessToken || ""
      );

      return this.axiosInstance({
        ...originalRequest,
        headers: {
          ...originalRequest.headers,
          Authorization: `Bearer ${newSession?.accessToken}`,
        },
      });
    } catch (refreshError) {
      if (shouldStartRefresh) {
        await this.handleExpireSession();
      }
      throw refreshError;
    } finally {
      if (shouldStartRefresh) {
        this.clearRefreshPromise();
      }
    }
  }

  getInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

class AxiosServerBase {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = create({
      headers: BASE_SERVER_HEADERS_CONFIG,
      timeout: DEFAULT_TIMEOUT,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        config.headers = AxiosHeaders.from({
          ...BASE_SERVER_HEADERS_CONFIG,
          ...config.headers,
        });

        return config;
      },
      (error: AxiosError) => {
        throw error;
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        throw error.response?.data;
      }
    );
  }

  getInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

class HttpBase {
  private readonly httpBase: AxiosInstance;

  constructor(httpBase: AxiosInstance) {
    this.httpBase = httpBase;
  }

  private static transformToAxiosOptions(
    options?: TOptions
  ): AxiosRequestConfig | undefined {
    if (!options) {
      return undefined;
    }

    return {
      baseURL: options?.baseURL,
      headers: options?.headers,
      params: options?.params,
      signal: options?.signal as GenericAbortSignal | undefined,
      ...(options?.mode
        ? {
            adapter: "fetch",
            fetchOptions: { mode: "no-cors" },
            headers: {
              ...options.headers,
              "Content-Type": "multipart/form-data",
            },
          }
        : {}),
      withCredentials: options?.withCredentials,
    };
  }

  private static async transformResponseToCommonFormat<T>(
    promiseResponse: Promise<AxiosResponse<T>>,
    options?: TOptions
  ): Promise<TResponse<T>> {
    try {
      const response = await promiseResponse;

      const isNoCors = options?.mode === "no-cors";
      if (isNoCors && response.status === HTTP_STATUS.NETWORK_ERROR) {
        return [null, null] as unknown as TResponse<T>;
      }

      if (response.status === HTTP_STATUS.OK) {
        return HttpBase.transformSuccessResponse<T>(response, options);
      }

      const error = new THttpError({
        message: "Fetch Error",
        status: response.status,
      });
      return [error, null];
    } catch (error) {
      return HttpBase.transformCatchError<T>(error as Error | AxiosError);
    }
  }

  private static transformSuccessResponse<T>(
    response: AxiosResponse<T>,
    options?: TOptions
  ): TResponse<T> {
    let { data } = response;

    if (options?.enabledFlattenData) {
      data = (data as { data?: T } | undefined)?.data as T;
    }

    return [null, data];
  }

  private static transformCatchError<T>(
    error: Error | AxiosError
  ): TResponse<T> {
    if (error instanceof AxiosError) {
      return [
        HttpBase.createHttpError(error.status, error.message, error),
        null,
      ];
    }

    const message = (error as Error)?.message ?? "Bad Request";
    return [
      HttpBase.createHttpError(HTTP_STATUS.BAD_REQUEST, message, error),
      null,
    ];
  }

  private static createHttpError(
    status: number | undefined,
    message: string,
    error?: unknown
  ): THttpError {
    const normalizedError: TFetchErrorDetail | undefined =
      typeof error === "object" && error !== null
        ? (error as TFetchErrorDetail)
        : undefined;

    return new THttpError({
      error: normalizedError,
      message,
      status: status ?? HTTP_STATUS.BAD_REQUEST,
    });
  }

  public get<T>(path: string, options?: TOptions): Promise<TResponse<T>> {
    const axiosOptions = HttpBase.transformToAxiosOptions(options);
    const response = this.httpBase.get<T>(path, axiosOptions);
    return HttpBase.transformResponseToCommonFormat<T>(response, options);
  }

  public post<T>(path: string, options?: TOptions): Promise<TResponse<T>> {
    const axiosOptions = HttpBase.transformToAxiosOptions(options);
    const response = this.httpBase.post<T>(path, options?.body, axiosOptions);
    return HttpBase.transformResponseToCommonFormat<T>(response, options);
  }

  public put<T>(path: string, options?: TOptions): Promise<TResponse<T>> {
    const axiosOptions = HttpBase.transformToAxiosOptions(options);
    const response = this.httpBase.put<T>(path, options?.body, axiosOptions);

    return HttpBase.transformResponseToCommonFormat<T>(response, options);
  }

  public patch<T>(path: string, options?: TOptions): Promise<TResponse<T>> {
    const axiosOptions = HttpBase.transformToAxiosOptions(options);
    const response = this.httpBase.patch<T>(path, options?.body, axiosOptions);

    return HttpBase.transformResponseToCommonFormat<T>(response, options);
  }

  public delete<T>(path: string, options?: TOptions): Promise<TResponse<T>> {
    const axiosOptions = HttpBase.transformToAxiosOptions(options);
    const response = this.httpBase.delete<T>(path, axiosOptions);
    return HttpBase.transformResponseToCommonFormat<T>(response, options);
  }
}

export {
  HttpBase,
  AxiosClientBase,
  AxiosServerBase,
  BASE_SERVER_HEADERS_CONFIG,
  BASE_HEADERS_CONFIG,
};
