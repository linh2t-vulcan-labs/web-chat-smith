import type { ApiError } from "@cs/api-client/errors/api-error";
import { getReasonDefinition } from "@cs/api-client/errors/reasons";
import { useExtracted } from "next-intl";

export interface ApiErrorCopy {
  title: string;
  description: string;
  /** Whether showing a retry action makes sense for this error. */
  retryable: boolean;
}

/**
 * Maps an `ApiError` to localized inline-error copy. Implemented as a
 * `switch` over literal `t({id, message})` calls (not a dynamically built id
 * string) because next-intl's macro extraction needs statically-analyzable
 * call sites — see `apps/web/components/playground/extraction-demo.tsx`.
 */
export const useApiErrorCopy = () => {
  const t = useExtracted();

  const getErrorCopy = (error: ApiError): ApiErrorCopy => {
    if (error.httpStatus === 404) {
      return {
        description: t({
          id: "Common.errors.notFound.description",
          message: "The item you're looking for doesn't exist or was removed.",
        }),
        retryable: false,
        title: t({
          id: "Common.errors.notFound.title",
          message: "Not found",
        }),
      };
    }

    if (error.isAuthError) {
      return {
        description: t({
          id: "Common.errors.auth.description",
          message: "Please sign in again to continue.",
        }),
        retryable: error.isRetryable,
        title: t({
          id: "Common.errors.auth.title",
          message: "Your session has expired",
        }),
      };
    }

    const { category } = getReasonDefinition(error.reason);

    switch (category) {
      case "transient": {
        return {
          description: t({
            id: "Common.errors.transient.description",
            message: "This usually resolves itself — try again in a moment.",
          }),
          retryable: error.isRetryable,
          title: t({
            id: "Common.errors.transient.title",
            message: "Something went wrong",
          }),
        };
      }
      case "rate-limit": {
        return {
          description: t({
            id: "Common.errors.rateLimit.description",
            message:
              "You've made too many requests. Please wait and try again.",
          }),
          retryable: error.isRetryable,
          title: t({
            id: "Common.errors.rateLimit.title",
            message: "Too many requests",
          }),
        };
      }
      case "billing": {
        return {
          description: t({
            id: "Common.errors.billing.description",
            message: "This action requires a plan upgrade.",
          }),
          retryable: false,
          title: t({
            id: "Common.errors.billing.title",
            message: "Upgrade required",
          }),
        };
      }
      case "validation": {
        return {
          description: t({
            id: "Common.errors.validation.description",
            message: "Please check your input and try again.",
          }),
          retryable: false,
          title: t({
            id: "Common.errors.validation.title",
            message: "Invalid request",
          }),
        };
      }
      case "platform": {
        return {
          description: t({
            id: "Common.errors.platform.description",
            message:
              "This feature isn't available on your current plan or platform.",
          }),
          retryable: false,
          title: t({
            id: "Common.errors.platform.title",
            message: "Not available",
          }),
        };
      }
      default: {
        return {
          description: t({
            id: "Common.errors.unknown.description",
            message: "An unexpected error occurred.",
          }),
          retryable: error.isRetryable,
          title: t({
            id: "Common.errors.unknown.title",
            message: "Something went wrong",
          }),
        };
      }
    }
  };

  return { getErrorCopy };
};
