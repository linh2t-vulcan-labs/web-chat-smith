export interface TError {
  message: string;
  code: string;
  error: string;
}

export interface TErrorResponseHttp {
  message: string;
  error: TError[];
}

export interface TSearchParamsErrHome {
  code: string;
  err: string;
  message: string;
}

export interface TErrorDTO {
  code: string;
  message: string;
  err: string;
}

interface TErrorResponseDetailDTO {
  error?: string;
  field?: string;
  description?: string;
}

export interface TErrorResponseDTO {
  code: number;
  message: string;
  reason: string;
  details?: TErrorResponseDetailDTO[];
}

export interface TTokens {
  token: string;
}

export interface TAPIResponse<T> {
  next_page_token: string;
  version: string;
  data: T;
}
