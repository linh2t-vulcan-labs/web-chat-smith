import { suiteCreativeUploadClientService } from "@/features/suite/services/design-studio/upload-service";
import type {
  SuiteCreativeUploadModel,
  TSuiteCreativeCompleteUploadInput,
  TSuiteCreativeCreateUploadInput,
  // TSuiteCreativeGetUploadInput,
  // TSuiteCreativeGetUploadOptions,
  TSuiteCreativeUploadContentType,
  TSuiteCreativeUploadFileInput,
  TSuiteCreativeUploadFileResult,
} from "@/features/suite/types/design-studio";
import { useQuery } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";
import { HTTP_STATUS } from "@/utils/constants/http";

import { suiteCreativeQueryKeys } from "./query-keys";

// const SUITE_CREATIVE_UPLOAD_POLL_INTERVAL_MS = 1500;

function getUploadContentType(file: File): TSuiteCreativeUploadContentType {
  if (file.type === "image/png" || file.type === "image/jpeg") {
    return file.type;
  }

  throw new THttpError({
    error: { contentType: file.type },
    message: "Invalid upload content type",
    status: HTTP_STATUS.BAD_REQUEST,
  });
}

async function postFileToSignedUploadUrl(
  uploadUrl: string,
  file: File,
  uploadPolicy?: Record<string, string>
): Promise<void> {
  const formData = new FormData();

  if (uploadPolicy) {
    for (const [key, value] of Object.entries(uploadPolicy)) {
      formData.append(key, value);
    }
  }

  formData.append("file", file);

  const response = await fetch(uploadUrl, {
    body: formData,
    method: "POST",
    mode: "no-cors",
  });

  // no-cors response type is "opaque" — status/ok are not exposed, treat as success
  if (response.type !== "opaque" && !response.ok) {
    throw new THttpError({
      error: response,
      message: "Upload failed",
      status: response.status,
    });
  }
}

async function createSuiteCreativeUpload(
  input: TSuiteCreativeCreateUploadInput
): Promise<SuiteCreativeUploadModel> {
  const [error, result] =
    await suiteCreativeUploadClientService.createUpload(input);

  if (error) {
    throw new THttpError(error);
  }

  if (!result) {
    throw new THttpError({
      message: "Upload creation returned empty response",
      status: HTTP_STATUS.BAD_REQUEST,
    });
  }

  return result;
}

async function uploadFileToSignedSuiteCreativeUrl(
  file: File,
  uploadUrl: string,
  uploadPolicy?: Record<string, string>
) {
  await postFileToSignedUploadUrl(uploadUrl, file, uploadPolicy);
}

// async function getSuiteCreativeUpload(
//   uploadId: string
// ): Promise<SuiteCreativeUploadModel> {
//   const [error, result] = await suiteCreativeUploadClientService.getUpload({
//     uploadId,
//   });

//   if (error) {
//     throw new THttpError(error);
//   }

//   if (!result) {
//     throw new THttpError({
//       status: HTTP_STATUS.BAD_REQUEST,
//       message: "Upload polling returned empty response",
//     });
//   }

//   return result;
// }

async function completeSuiteCreativeUpload(
  input: TSuiteCreativeCompleteUploadInput
): Promise<SuiteCreativeUploadModel | null> {
  const [error, result] =
    await suiteCreativeUploadClientService.completeUpload(input);

  if (error) {
    throw new THttpError(error);
  }

  return result;
}

export async function uploadSuiteCreativeFile({
  file,
  projectId,
  displayOnly,
}: TSuiteCreativeUploadFileInput): Promise<TSuiteCreativeUploadFileResult> {
  const contentType = getUploadContentType(file);
  const createdUpload = await createSuiteCreativeUpload({
    contentType,
    displayOnly,
    filename: file.name,
    projectId,
    sizeBytes: file.size,
  });

  await uploadFileToSignedSuiteCreativeUrl(
    file,
    createdUpload.uploadUrl,
    createdUpload.uploadPolicy
  );

  const uploadUrl = new URL(createdUpload.uploadUrl);
  const key = createdUpload.uploadPolicy?.key ?? "";
  const builtDownloadUrl = `${uploadUrl.origin}${uploadUrl.pathname}${key}`;

  const completedUpload = await completeSuiteCreativeUpload({
    downloadUrl: builtDownloadUrl,
    uploadId: createdUpload.id,
  });

  return {
    downloadUrl: completedUpload?.downloadUrl ?? builtDownloadUrl,
    uploadId: createdUpload.id,
  };
}

// const useCreateUpload = () =>
//   useMutation({
//     networkMode: "always",
//     mutationFn: (input: TSuiteCreativeCreateUploadInput) =>
//       createSuiteCreativeUpload(input),
//   });

// const useGetUpload = (
//   input: TSuiteCreativeGetUploadInput,
//   options: TSuiteCreativeGetUploadOptions = {}
// ) =>
//   useQuery({
//     queryKey: suiteCreativeQueryKeys.upload(input.uploadId),
//     networkMode: "always",
//     queryFn: async () => {
//       const [error, result] =
//         await suiteCreativeUploadClientService.getUpload(input);

//       if (error) {
//         throw new THttpError(error);
//       }

//       return result;
//     },
//     enabled: !!input.uploadId && !!options.enabled,
//     refetchInterval: (query) => {
//       const upload = query.state.data;

//       if (upload?.status === "completed" || upload?.status === "failed") {
//         return false;
//       }

//       return SUITE_CREATIVE_UPLOAD_POLL_INTERVAL_MS;
//     },
//   });

// const useCompleteUpload = () =>
//   useMutation({
//     networkMode: "always",
//     mutationFn: (input: TSuiteCreativeCompleteUploadInput) =>
//       completeSuiteCreativeUpload(input),
//   });

// const useUploadFile = () =>
//   useMutation({
//     networkMode: "always",
//     mutationFn: (
//       input: TSuiteCreativeUploadFileInput
//     ): Promise<TSuiteCreativeUploadFileResult> =>
//       uploadSuiteCreativeFile(input),
//   });

// Recent-uploads picker shows up to this many newest completed uploads.
export const SUITE_CREATIVE_RECENT_UPLOADS_PAGE_SIZE = 9;

/**
 * Recent completed uploads for the prompt-input picker. No cache: always refetches fresh whenever
 * it mounts/opens (staleTime + gcTime 0, refetchOnMount "always"). Gate with `enabled` so it only
 * fires when the modal is open.
 */
export const useListUploads = ({
  enabled = true,
}: { enabled?: boolean } = {}) =>
  useQuery({
    enabled,
    gcTime: 0,
    queryFn: async () => {
      const [error, result] =
        await suiteCreativeUploadClientService.listUploads({
          pageSize: SUITE_CREATIVE_RECENT_UPLOADS_PAGE_SIZE,
        });

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
    queryKey: suiteCreativeQueryKeys.uploadsList(),
    refetchOnMount: "always",
    staleTime: 0,
  });
