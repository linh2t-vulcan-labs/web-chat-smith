import type { ApiError } from "@cs/api-client/errors/api-error";
import { getReasonDefinition } from "@cs/api-client/errors/reasons";
import { useExtracted } from "next-intl";

export interface ApiErrorCopy {
  title: string;
  description: string;
  /** Whether showing a retry action makes sense for this error. */
  retryable: boolean;
}

const NOT_FOUND_STATUS = 404;

/**
 * Maps an `ApiError` to localized inline-error copy. Each branch is a
 * literal `t({id, message})` call (not a dynamically built id string)
 * because next-intl's macro extraction needs statically-analyzable call
 * sites — see `apps/web/components/playground/extraction-demo.tsx`. The
 * per-category builders below stay nested closures over `t` (declared in
 * this same hook) rather than taking `t` as a parameter, since passing `t`
 * across a function boundary is one of the extraction anti-patterns that
 * comment calls out.
 */
export const useApiErrorCopy = () => {
  const t = useExtracted();

  const notFoundCopy = (): ApiErrorCopy => ({
    description: t({
      id: "Common.errors.notFound.description",
      message: "The item you're looking for doesn't exist or was removed.",
    }),
    retryable: false,
    title: t({
      id: "Common.errors.notFound.title",
      message: "Not found",
    }),
  });

  const authErrorCopy = (retryable: boolean): ApiErrorCopy => ({
    description: t({
      id: "Common.errors.auth.description",
      message: "Please sign in again to continue.",
    }),
    retryable,
    title: t({
      id: "Common.errors.auth.title",
      message: "Your session has expired",
    }),
  });

  const copyByReasonCategory: Record<
    string,
    (retryable: boolean) => ApiErrorCopy
  > = {
    billing: (): ApiErrorCopy => ({
      description: t({
        id: "Common.errors.billing.description",
        message: "This action requires a plan upgrade.",
      }),
      retryable: false,
      title: t({
        id: "Common.errors.billing.title",
        message: "Upgrade required",
      }),
    }),
    platform: (): ApiErrorCopy => ({
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
    }),
    "rate-limit": (retryable: boolean): ApiErrorCopy => ({
      description: t({
        id: "Common.errors.rateLimit.description",
        message: "You've made too many requests. Please wait and try again.",
      }),
      retryable,
      title: t({
        id: "Common.errors.rateLimit.title",
        message: "Too many requests",
      }),
    }),
    transient: (retryable: boolean): ApiErrorCopy => ({
      description: t({
        id: "Common.errors.transient.description",
        message: "This usually resolves itself — try again in a moment.",
      }),
      retryable,
      title: t({
        id: "Common.errors.transient.title",
        message: "Something went wrong",
      }),
    }),
    validation: (): ApiErrorCopy => ({
      description: t({
        id: "Common.errors.validation.description",
        message: "Please check your input and try again.",
      }),
      retryable: false,
      title: t({
        id: "Common.errors.validation.title",
        message: "Invalid request",
      }),
    }),
  };

  const unknownCopy = (retryable: boolean): ApiErrorCopy => ({
    description: t({
      id: "Common.errors.unknown.description",
      message: "An unexpected error occurred.",
    }),
    retryable,
    title: t({
      id: "Common.errors.unknown.title",
      message: "Something went wrong",
    }),
  });

  const getErrorCopy = (error: ApiError): ApiErrorCopy => {
    if (error.httpStatus === NOT_FOUND_STATUS) {
      return notFoundCopy();
    }

    if (error.isAuthError) {
      return authErrorCopy(error.isRetryable);
    }

    const { category } = getReasonDefinition(error.reason);
    const buildCopy = copyByReasonCategory[category] ?? unknownCopy;
    return buildCopy(error.isRetryable);
  };

  return { getErrorCopy };
};
