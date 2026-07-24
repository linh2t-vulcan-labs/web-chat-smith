import { THttpError } from "@/utils/commons/error";

// The Axios interceptor rejects with the raw response body, so the real HTTP status is lost
// (THttpError.status is always 400 — see libs/axios transformCatchError). The backend instead
// carries a gRPC-style status code in the body, surfaced on THttpError.error.code. Use these codes
// (not the HTTP status) to branch on the failure reason.
export const SUITE_API_ERROR_CODE = {
  ABORTED: 10, // 409 — project đang có generation khác chạy
  FAILED_PRECONDITION: 9, // 400 — upload expired
  INTERNAL: 13, // 500 — DB/GCS lỗi
  INVALID_ARGUMENT: 3, // 400 — validate input fail / magic bytes mismatch
  NOT_FOUND: 5, // 404 — upload/project/message không tồn tại
  QUOTA_EXCEEDED: 8, // 429 — RESOURCE_EXHAUSTED, quota hết (không retry)
  UNAUTHENTICATED: 16, // 401 — missing/invalid token
  UNAVAILABLE: 14, // 503 — server busy / infra tạm không sẵn sàng (retry with backoff)
  UNIMPLEMENTED: 12, // 501 — format conversion chưa support
} as const;

// Backend code -> the HTTP status it represents (status itself is stripped before we see it).
const CODE_TO_HTTP_STATUS: Record<number, number> = {
  [SUITE_API_ERROR_CODE.INVALID_ARGUMENT]: 400,
  [SUITE_API_ERROR_CODE.NOT_FOUND]: 404,
  [SUITE_API_ERROR_CODE.QUOTA_EXCEEDED]: 429,
  [SUITE_API_ERROR_CODE.FAILED_PRECONDITION]: 400,
  [SUITE_API_ERROR_CODE.ABORTED]: 409,
  [SUITE_API_ERROR_CODE.UNIMPLEMENTED]: 501,
  [SUITE_API_ERROR_CODE.INTERNAL]: 500,
  [SUITE_API_ERROR_CODE.UNAVAILABLE]: 503,
  [SUITE_API_ERROR_CODE.UNAUTHENTICATED]: 401,
};

interface SuiteApiErrorBody {
  code?: number;
}

const getApiErrorCode = (error: unknown): number | undefined => {
  if (!(error instanceof THttpError)) {
    return undefined;
  }

  return (error.error as SuiteApiErrorBody | undefined)?.code;
};

export const isSuiteNotFoundError = (error: unknown): boolean =>
  getApiErrorCode(error) === SUITE_API_ERROR_CODE.NOT_FOUND;

export const isSuiteQuotaExceededError = (error: unknown): boolean =>
  getApiErrorCode(error) === SUITE_API_ERROR_CODE.QUOTA_EXCEEDED;

// The HTTP status the backend code maps to, or undefined if it isn't a recognized suite API error.
export const getSuiteHttpStatusFromError = (
  error: unknown
): number | undefined => {
  const code = getApiErrorCode(error);
  return code === undefined ? undefined : CODE_TO_HTTP_STATUS[code];
};
