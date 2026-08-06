import { ApiError } from "../errors/api-error";
import type { ApiResult } from "../errors/api-error";
import { fileService } from "../services/file";
import type { UploadPolicy } from "../services/file";

export interface UploadFileInput {
  file: File;
  fileName?: string;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

export interface UploadFileResult {
  fileId: string;
}

const PERCENT = 100;

/**
 * `fetch` doesn't expose upload progress, so the GCS leg specifically uses
 * XMLHttpRequest — the policy-fetch leg above still goes through the
 * regular http-client/interceptors stack.
 */
const postFormDataWithProgress = (
  url: string,
  formData: FormData,
  options: { onProgress?: (percent: number) => void; signal?: AbortSignal }
): Promise<ApiResult<void>> =>
  // oxlint-disable-next-line promise/avoid-new -- XMLHttpRequest is callback-based; no promise-returning library API covers upload progress
  new Promise((resolve) => {
    if (options.signal?.aborted) {
      resolve([ApiError.aborted(), null]);
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        options.onProgress?.(
          Math.round((event.loaded / event.total) * PERCENT)
        );
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve([null, undefined]);
        return;
      }
      resolve([
        new ApiError({
          httpStatus: xhr.status,
          kind: "network",
          message: `GCS upload failed with status ${xhr.status}`,
          reason: "ERROR_UNKNOWN",
        }),
        null,
      ]);
    });

    xhr.addEventListener("error", () => {
      resolve([ApiError.network(new Error("GCS upload network error")), null]);
    });
    xhr.addEventListener("abort", () => resolve([ApiError.aborted(), null]));

    // Already-aborted case handled above (before `send()` ever fires); this
    // only needs to cover an abort that happens mid-flight.
    options.signal?.addEventListener("abort", () => xhr.abort(), {
      once: true,
    });

    xhr.send(formData);
  });

/** GCS expects the presigned policy's fields as form fields ahead of the file itself — order matters to GCS, so `file` is always appended last. */
const buildUploadFormData = (policy: UploadPolicy, file: File): FormData => {
  const formData = new FormData();
  for (const [key, value] of Object.entries(policy.uploadPolicy)) {
    formData.append(key, value);
  }
  formData.append("file", file);
  return formData;
};

/**
 * Presigned-URL upload — the one pattern the legacy code already got right
 * (see docs/runbook/api-client.md §2/§9): ask Vulcan for a signed POST
 * policy, then POST the file straight to GCS, bypassing both Vulcan and
 * Next.js for the byte stream.
 */
export const uploadFile = async (
  input: UploadFileInput
): Promise<ApiResult<UploadFileResult>> => {
  const [policyError, policy] = await fileService.getUploadPolicy(
    {
      // Wire field is `file_size` (confirmed against
      // apps/super-app/src/core/http/dto/file.ts's CreateUploadFileLinkDTO) —
      // `fileSize`, not `size`, so the global camelCase->snake_case body
      // conversion produces the field the backend actually expects.
      fileName: input.fileName ?? input.file.name,
      fileSize: input.file.size,
      mimeType: input.file.type,
    },
    { signal: input.signal }
  );
  if (policyError) {
    return [policyError, null];
  }

  const formData = buildUploadFormData(policy, input.file);

  const [uploadError] = await postFormDataWithProgress(
    policy.uploadUrl,
    formData,
    {
      onProgress: input.onProgress,
      signal: input.signal,
    }
  );
  if (uploadError) {
    return [uploadError, null];
  }

  return [null, { fileId: policy.fileId }];
};
