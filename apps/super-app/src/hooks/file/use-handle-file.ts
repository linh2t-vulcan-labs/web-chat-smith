import { useCallback, useState } from "react";
import { toast } from "sonner";

import type { TUploadFileLinkResponse } from "@/core/models/file";
import type { TResponse } from "@/core/models/http";
import type { TFetchError } from "@/utils/commons/error";
import { CONVERSATION_ERROR_REASON } from "@/utils/constants/error";

import { useGetFileUrl } from "./use-get-file-url";
import { useMutationCreateFile } from "./use-mutate-create-file-url";

export const useHandleFile = () => {
  const [fileId, setFileId] = useState("");
  const [error, setError] = useState<TFetchError | Error | null>(null);

  const handleSuccessMutationCreateFileUrl = (
    response: TResponse<TUploadFileLinkResponse>
  ) => {
    const [error, data] = response;

    if (error) {
      const errorDetail = error.error;
      const isReachedLimit =
        errorDetail?.reason === CONVERSATION_ERROR_REASON.REACHED_LIMIT;

      toast.error(null, {
        description: isReachedLimit
          ? "We’d love to help you solve your request. Let upgrade to Pro to unlock unlimited access now"
          : error.message,
      });
    }

    setError(error);

    if (data?.fileId) {
      setFileId(data?.fileId);
    }
  };

  const handleErrorMutationCreateFileUrl = (error: Error) => {
    setError(error);
    toast.error(null, {
      description: error.message,
    });
  };

  const mutationCreateFileUrl = useMutationCreateFile(
    handleSuccessMutationCreateFileUrl,
    handleErrorMutationCreateFileUrl
  );

  const { data, isFetching, status } = useGetFileUrl(fileId);

  const handleUpload = useCallback(
    (file: File) => {
      mutationCreateFileUrl.mutate({
        file,
      });
    },
    [mutationCreateFileUrl]
  );

  return {
    error: error || mutationCreateFileUrl.error,
    fileId,
    fileUrl: data?.fileUrl,
    handleUpload,
    isLoading: isFetching || (mutationCreateFileUrl.isPending && !fileId),
    isPending: mutationCreateFileUrl.isPending,
    setFileId,
    status,
  };
};
